import test from 'node:test';
import assert from 'node:assert/strict';
import { createZhipuSummarizer } from '../src/lib/zhipu-client.js';

test('zhipu summarizer retries transient failures before succeeding', async () => {
  let attempts = 0;
  const summarize = createZhipuSummarizer({
    ZHIPU_API_KEY: 'secret',
    ZHIPU_MODELS: 'GLM-5-Turbo',
    ZHIPU_TIMEOUT_MS: '1000',
    ZHIPU_MAX_TOKENS: '100000',
  }, {
    fetchImpl: async () => {
      attempts += 1;
      if (attempts < 3) {
        return { ok: false, status: 429, json: async () => ({}) };
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: '{"summary":"摘要","classification":"Policy","significance":"重要"}' } }],
        }),
      };
    },
    sleep: async () => {},
  });

  const result = await summarize([{ title: 'Paper', abstract: 'Abstract', journal: 'Journal', publicationDate: '2026-04-23' }]);
  assert.equal(result[0].summary, '摘要');
  assert.equal(attempts, 3);
});
