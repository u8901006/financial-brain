import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateSite } from '../src/cli/generate.js';

test('generator writes site and issue JSON outputs', async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'financial-brain-'));

  await generateSite({
    rootDir: tempRoot,
    guidePath: new URL('../finance_related_journals_pubmed_guide.md', import.meta.url),
    fetchPubMedRecords: async () => [
      {
        pmid: 'A1',
        title: 'Financial stress in caregivers',
        abstract: 'Study abstract',
        journal: 'Journal of Financial Therapy',
        publicationDate: '2026-04-23',
        doi: '10.1/a1',
        url: 'https://pubmed.ncbi.nlm.nih.gov/A1/',
      },
    ],
    summarizePapers: async (papers) => papers.map((paper) => ({
      ...paper,
      summary: '中文摘要',
      classification: 'Financial Stress',
      significance: '值得關注',
    })),
    now: '2026-04-23T03:00:00.000Z',
  });

  assert.equal(existsSync(join(tempRoot, 'site', 'index.html')), true);
  assert.equal(existsSync(join(tempRoot, 'site', 'financial-2026-04-23.html')), true);
  assert.equal(existsSync(join(tempRoot, 'data', 'issues', '2026-04-23.json')), true);

  const issueHtml = readFileSync(join(tempRoot, 'site', 'financial-2026-04-23.html'), 'utf8');
  assert.match(issueHtml, /Financial stress in caregivers/);
  assert.match(issueHtml, /中文摘要/);
});
