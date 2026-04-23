function xmlDecode(value) {
  return String(value || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i'));
  return match ? xmlDecode(match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) : '';
}

function buildDateFilter(daysBack = 7, referenceDate = new Date().toISOString()) {
  const now = new Date(referenceDate);
  const start = new Date(now.getTime() - daysBack * 86400000);
  const format = (date) => `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${String(date.getUTCDate()).padStart(2, '0')}`;
  return `("${format(start)}"[Date - Publication] : "3000"[Date - Publication])`;
}

function wait(ms, sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))) {
  return sleep(ms);
}

async function fetchJson(url, options) {
  const response = await options.fetchImpl(url, {
    headers: { 'User-Agent': 'financial-brain/1.0 (GitHub Actions)' },
  });

  if (!response.ok) {
    const error = new Error(`PubMed request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function fetchText(url, options) {
  const response = await options.fetchImpl(url, {
    headers: { 'User-Agent': 'financial-brain/1.0 (GitHub Actions)' },
  });

  if (!response.ok) {
    const error = new Error(`PubMed request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.text();
}

async function withRetry(work, options) {
  const retries = options.maxRetries ?? 3;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await work();
    } catch (error) {
      const shouldRetry = (error.status === 429 || error.status >= 500) && attempt < retries;
      if (!shouldRetry) {
        throw error;
      }

      await wait((attempt + 1) * (options.retryDelayMs ?? 1500), options.sleep);
    }
  }

  return null;
}

export async function fetchRecentPubMedRecords(config, options = {}) {
  const runtime = {
    fetchImpl: options.fetchImpl || fetch,
    sleep: options.sleep,
    maxRetries: options.maxRetries ?? 3,
    retryDelayMs: options.retryDelayMs ?? 1500,
  };
  const queries = config.journals
    .filter((journal) => journal.template)
    .slice(0, options.maxQueries || config.journals.length)
    .map((journal) => ({
      journal: journal.name,
      query: `${journal.template} AND ${buildDateFilter(options.daysBack || 7, options.referenceDate)}`,
    }));

  const idSet = new Set();
  let successfulQueries = 0;

  for (const item of queries) {
    const searchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
    searchUrl.searchParams.set('db', 'pubmed');
    searchUrl.searchParams.set('retmode', 'json');
    searchUrl.searchParams.set('retmax', String(options.resultsPerQuery || 5));
    searchUrl.searchParams.set('sort', 'pub date');
    searchUrl.searchParams.set('term', item.query);

    try {
      const result = await withRetry(() => fetchJson(searchUrl, runtime), runtime);
      successfulQueries += 1;
      for (const id of result.esearchresult?.idlist || []) {
        idSet.add(id);
      }
    } catch {
      continue;
    }

    await wait(400, runtime.sleep);
  }

  if (idSet.size === 0) {
    if (successfulQueries === 0) {
      throw new Error('PubMed queries failed for all configured journals');
    }

    return [];
  }

  const fetchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi');
  fetchUrl.searchParams.set('db', 'pubmed');
  fetchUrl.searchParams.set('retmode', 'xml');
  fetchUrl.searchParams.set('id', [...idSet].join(','));

  const xml = await withRetry(() => fetchText(fetchUrl, runtime), runtime);
  const articles = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];

  return articles.map((article) => {
    const pmid = extractTag(article, 'PMID');
    const title = extractTag(article, 'ArticleTitle');
    const abstractParts = [...article.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map((item) => xmlDecode(item[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()));
    const journal = extractTag(article, 'Title') || extractTag(article, 'MedlineTA');
    const year = extractTag(article, 'Year');
    const month = extractTag(article, 'Month');
    const day = extractTag(article, 'Day');
    const doiMatch = article.match(/<ArticleId IdType="doi">([\s\S]*?)<\/ArticleId>/i);
    const doi = doiMatch ? xmlDecode(doiMatch[1].trim()) : '';
    const publicationDate = [year, month, day].filter(Boolean).join('-');

    return {
      pmid,
      doi,
      title,
      abstract: abstractParts.join(' '),
      journal,
      publicationDate,
      url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : '',
    };
  }).filter((paper) => paper.title);
}
