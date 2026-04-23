import { wrapHtml } from '../templates/site.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderIndexPage({ title, subtitle, issues, repoUrl }) {
  const items = issues
    .map((issue) => `<li><a class="issue-link" href="${escapeHtml(issue.href)}">📅 ${escapeHtml(issue.label)}</a></li>`)
    .join('\n');

  return wrapHtml({
    title: `${title} · 金融文獻日報`,
    body: `<div class="container">
  <div class="logo">📈</div>
  <h1>${escapeHtml(title)}</h1>
  <p class="subtitle">${escapeHtml(subtitle)}</p>
  <p class="count">共 ${issues.length} 期日報</p>
  <ul>${items}</ul>
  <footer>
    <p>Powered by PubMed + Zhipu AI · <a href="${escapeHtml(repoUrl)}">GitHub</a></p>
  </footer>
</div>`,
  });
}

function renderPaper(paper) {
  return `<article class="paper">
    <h2>${escapeHtml(paper.title)}</h2>
    <p class="meta">${escapeHtml(paper.journal || 'Unknown Journal')} · ${escapeHtml(paper.publicationDate || '')}</p>
    <p class="tagline">分類：${escapeHtml(paper.classification || '未分類')}</p>
    <span class="section-label">中文摘要</span>
    <p>${escapeHtml(paper.summary || paper.abstract || '暫無摘要')}</p>
    <span class="section-label">研究亮點</span>
    <p>${escapeHtml(paper.significance || '此研究具潛在參考價值。')}</p>
    <span class="section-label">原始連結</span>
    <p><a href="${escapeHtml(paper.url || '#')}">PubMed</a></p>
  </article>`;
}

export function renderIssuePage({ title, issueDate, issueLabel, intro, papers, repoUrl }) {
  const body = papers.length
    ? papers.map(renderPaper).join('\n')
    : '<p class="empty">今天沒有新且未在前 7 天日報中收錄的研究文獻。</p>';

  return wrapHtml({
    title: `${title} · ${issueDate}`,
    body: `<div class="container">
  <a class="back-link" href="index.html">← 返回首頁</a>
  <div class="logo">📈</div>
  <h1>${escapeHtml(title)}</h1>
  <p class="subtitle">${escapeHtml(issueLabel)}</p>
  <p class="lead">${escapeHtml(intro)}</p>
  ${body}
  <footer>
    <p><a href="https://www.leepsyclinic.com/">李政洋身心診所首頁</a></p>
    <p><a href="https://blog.leepsyclinic.com/">訂閱電子報</a></p>
    <p><a href="https://buymeacoffee.com/CYlee">Buy me a coffee</a></p>
    <p>Powered by PubMed + Zhipu AI · <a href="${escapeHtml(repoUrl)}">GitHub</a></p>
  </footer>
</div>`,
  });
}
