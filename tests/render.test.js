import test from 'node:test';
import assert from 'node:assert/strict';
import { renderIndexPage, renderIssuePage } from '../src/lib/render.js';

test('renderers use psychiatry-brain palette and required footer links', () => {
  const indexHtml = renderIndexPage({
    title: 'Financial Brain',
    subtitle: '金融醫學與行為科學文獻日報 · 每日自動更新',
    issues: [{ date: '2026-04-23', href: 'financial-2026-04-23.html', label: '2026年4月23日（週四）' }],
    repoUrl: 'https://github.com/u8901006/financial-brain',
  });

  assert.match(indexHtml, /#f6f1e8/);
  assert.match(indexHtml, /Financial Brain/);

  const issueHtml = renderIssuePage({
    title: 'Financial Brain',
    issueDate: '2026-04-23',
    issueLabel: '2026年4月23日（週四）',
    intro: '今日摘要',
    papers: [],
    repoUrl: 'https://github.com/u8901006/financial-brain',
  });

  assert.match(issueHtml, /leepsyclinic\.com/);
  assert.match(issueHtml, /blog\.leepsyclinic\.com/);
  assert.match(issueHtml, /buymeacoffee\.com\/CYlee/);
});
