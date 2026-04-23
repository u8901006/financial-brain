function toUtcDate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function dayDiff(a, b) {
  const ms = Math.abs(toUtcDate(a) - toUtcDate(b));
  return Math.floor(ms / 86400000);
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function addKey(index, key, value) {
  if (!key) return;
  index.add(key);
}

export function buildRecentIssueIndex(issues, currentDate, lookbackDays = 7) {
  const index = new Set();

  for (const issue of issues) {
    if (!issue?.date || dayDiff(issue.date, currentDate) >= lookbackDays) {
      continue;
    }

    for (const paper of issue.papers || []) {
      addKey(index, paper.pmid ? `pmid:${paper.pmid}` : '', true);
      addKey(index, paper.doi ? `doi:${normalizeText(paper.doi)}` : '', true);
      addKey(index, paper.title ? `title:${normalizeText(paper.title)}` : '', true);
    }
  }

  return index;
}

export function isPaperAlreadyIncluded(index, paper) {
  const keys = [
    paper?.pmid ? `pmid:${paper.pmid}` : '',
    paper?.doi ? `doi:${normalizeText(paper.doi)}` : '',
    paper?.title ? `title:${normalizeText(paper.title)}` : '',
  ].filter(Boolean);

  return keys.some((key) => index.has(key));
}

export function normalizeTitle(value) {
  return normalizeText(value);
}
