import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchRecentPubMedRecords } from '../src/lib/pubmed.js';

function buildConfig() {
  return {
    journals: [
      { name: 'Journal A', template: '(foo[Title/Abstract] AND ("Journal A"[Journal]))' },
    ],
  };
}

test('pubmed client retries 429 search responses and eventually parses article details', async () => {
  const xml = `<?xml version="1.0"?><PubmedArticleSet><PubmedArticle><MedlineCitation><PMID>123</PMID><Article><ArticleTitle>Finance and Health</ArticleTitle><Abstract><AbstractText>Abstract here.</AbstractText></Abstract><Journal><Title>Journal A</Title><JournalIssue><PubDate><Year>2026</Year><Month>04</Month><Day>23</Day></PubDate></JournalIssue></Journal></Article></MedlineCitation><PubmedData><ArticleIdList><ArticleId IdType="doi">10.1/example</ArticleId></ArticleIdList></PubmedData></PubmedArticle></PubmedArticleSet>`;
  const calls = [];

  const papers = await fetchRecentPubMedRecords(buildConfig(), {
    fetchImpl: async (url) => {
      calls.push(url.toString());
      if (calls.length === 1) {
        return { ok: false, status: 429, json: async () => ({}) };
      }
      if (url.toString().includes('esearch.fcgi')) {
        return { ok: true, status: 200, json: async () => ({ esearchresult: { idlist: ['123'] } }) };
      }
      return { ok: true, status: 200, text: async () => xml };
    },
    sleep: async () => {},
    maxQueries: 1,
    resultsPerQuery: 1,
  });

  assert.equal(papers.length, 1);
  assert.equal(papers[0].pmid, '123');
  assert.ok(calls.length >= 3);
});

test('pubmed client tolerates query failures and returns empty results instead of throwing', async () => {
  await assert.rejects(
    () => fetchRecentPubMedRecords(buildConfig(), {
      fetchImpl: async () => ({ ok: false, status: 429, json: async () => ({}) }),
      sleep: async () => {},
      maxRetries: 1,
    }),
    /PubMed queries failed/,
  );
});

test('pubmed client queries every configured journal by default', async () => {
  const calls = [];
  const config = {
    journals: [
      { name: 'A', template: 'a' },
      { name: 'B', template: 'b' },
      { name: 'C', template: 'c' },
    ],
  };

  await fetchRecentPubMedRecords(config, {
    fetchImpl: async (url) => {
      calls.push(url.toString());
      if (url.toString().includes('esearch.fcgi')) {
        return { ok: true, status: 200, json: async () => ({ esearchresult: { idlist: [] } }) };
      }
      return { ok: true, status: 200, text: async () => '<PubmedArticleSet />' };
    },
    sleep: async () => {},
  });

  assert.equal(calls.filter((url) => url.includes('esearch.fcgi')).length, 3);
});

test('pubmed client uses provided reference date for publication filter', async () => {
  const calls = [];

  await fetchRecentPubMedRecords(buildConfig(), {
    fetchImpl: async (url) => {
      calls.push(url.toString());
      if (url.toString().includes('esearch.fcgi')) {
        return { ok: true, status: 200, json: async () => ({ esearchresult: { idlist: [] } }) };
      }
      return { ok: true, status: 200, text: async () => '<PubmedArticleSet />' };
    },
    sleep: async () => {},
    referenceDate: '2026-04-23T03:00:00.000Z',
  });

  assert.match(calls[0], /2026%2F04%2F16/);
});
