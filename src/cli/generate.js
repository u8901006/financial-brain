import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFinanceGuide } from '../lib/guide-parser.js';
import { buildRecentIssueIndex, isPaperAlreadyIncluded } from '../lib/dedupe.js';
import { loadIssues, writeIssue } from '../lib/issues.js';
import { renderIndexPage, renderIssuePage } from '../lib/render.js';
import { fetchRecentPubMedRecords } from '../lib/pubmed.js';
import { createZhipuSummarizer } from '../lib/zhipu-client.js';

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatTaiwanLabel(dateString) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日（${weekdays[date.getUTCDay()]}）`;
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

export async function generateSite(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const now = new Date(options.now || new Date().toISOString());
  const issueDate = formatIsoDate(now);
  const guidePath = options.guidePath || join(rootDir, 'finance_related_journals_pubmed_guide.md');
  const guideMarkdown = readFileSync(guidePath, 'utf8');
  const config = parseFinanceGuide(guideMarkdown);
  const existingIssues = loadIssues(rootDir);
  const recentIndex = buildRecentIssueIndex(existingIssues, issueDate, 7);
  const fetchPubMedRecords = options.fetchPubMedRecords || ((guideConfig) => fetchRecentPubMedRecords(guideConfig));
  const summarizePapers = options.summarizePapers || createZhipuSummarizer();
  const allRecords = await fetchPubMedRecords(config, { referenceDate: now.toISOString() });
  const uniqueRecords = allRecords.filter((paper) => !isPaperAlreadyIncluded(recentIndex, paper));
  const papers = await summarizePapers(uniqueRecords);

  const issue = {
    date: issueDate,
    label: formatTaiwanLabel(issueDate),
    generatedAt: now.toISOString(),
    totalCandidates: allRecords.length,
    newPapers: papers.length,
    papers,
  };

  writeIssue(rootDir, issue);

  const siteDir = join(rootDir, 'site');
  ensureDir(siteDir);
  const issueHtmlPath = join(siteDir, `financial-${issueDate}.html`);
  const repoUrl = 'https://github.com/u8901006/financial-brain';
  const intro = papers.length
    ? `今日收錄 ${papers.length} 篇過去 7 天日報尚未出現的新研究，聚焦金融壓力、健康經濟、決策科學與不平等議題。`
    : '今日沒有找到符合條件且未在前 7 天日報收錄的新文獻。';

  writeFileSync(issueHtmlPath, renderIssuePage({
    title: 'Financial Brain',
    issueDate,
    issueLabel: issue.label,
    intro,
    papers,
    repoUrl,
  }), 'utf8');

  const allIssues = loadIssues(rootDir)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((item) => ({
      date: item.date,
      href: `financial-${item.date}.html`,
      label: item.label || formatTaiwanLabel(item.date),
    }));

  writeFileSync(join(siteDir, 'index.html'), renderIndexPage({
    title: 'Financial Brain',
    subtitle: '金融醫學與行為科學文獻日報 · 每日自動更新',
    issues: allIssues,
    repoUrl,
  }), 'utf8');

  writeFileSync(join(rootDir, 'data', 'latest.json'), `${JSON.stringify(issue, null, 2)}\n`, 'utf8');
  return issue;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  generateSite().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
