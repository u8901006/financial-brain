import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRecentIssueIndex, isPaperAlreadyIncluded } from '../src/lib/dedupe.js';

test('dedupe prefers PMID, then DOI, then normalized title across latest seven days', () => {
  const issues = [
    {
      date: '2026-04-23',
      papers: [
        { pmid: '123', doi: '10.1/abc', title: 'Finance Stress and Sleep' },
        { title: 'Decision making under scarcity' },
      ],
    },
    {
      date: '2026-04-15',
      papers: [{ pmid: '999', title: 'Older item should be ignored' }],
    },
  ];

  const index = buildRecentIssueIndex(issues, '2026-04-23', 7);

  assert.equal(isPaperAlreadyIncluded(index, { pmid: '123' }), true);
  assert.equal(isPaperAlreadyIncluded(index, { doi: '10.1/abc' }), true);
  assert.equal(isPaperAlreadyIncluded(index, { title: 'Decision-Making Under Scarcity' }), true);
  assert.equal(isPaperAlreadyIncluded(index, { pmid: '999' }), false);
  assert.equal(isPaperAlreadyIncluded(index, { title: 'New finance paper' }), false);
});
