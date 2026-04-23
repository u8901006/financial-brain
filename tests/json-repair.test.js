import test from 'node:test';
import assert from 'node:assert/strict';
import { parseModelJson } from '../src/lib/json-repair.js';

test('json repair parses fenced and prefixed model output', () => {
  const result = parseModelJson('Here you go\n```json\n{"summary":"ok","items":[1]}\n```');
  assert.equal(result.summary, 'ok');
  assert.deepEqual(result.items, [1]);
});

test('json repair can close a truncated object when structure is otherwise recoverable', () => {
  const result = parseModelJson('{"summary":"ok","classification":"policy"');
  assert.equal(result.summary, 'ok');
  assert.equal(result.classification, 'policy');
});
