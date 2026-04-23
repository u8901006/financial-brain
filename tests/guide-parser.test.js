import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseFinanceGuide } from '../src/lib/guide-parser.js';

test('guide parser extracts master keyword groups and journal templates', () => {
  const markdown = readFileSync(new URL('../finance_related_journals_pubmed_guide.md', import.meta.url), 'utf8');
  const config = parseFinanceGuide(markdown);

  assert.ok(config.keywordGroups.length > 0);
  assert.ok(config.journals.length > 20);
  assert.ok(config.keywordGroups.some((group) => group.title.includes('Personal finance')));

  const journal = config.journals.find((item) => item.name === 'Journal of Financial Therapy');
  assert.ok(journal);
  assert.match(journal.template, /Journal of Financial Therapy/);
});
