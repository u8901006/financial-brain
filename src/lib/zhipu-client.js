import { parseModelJson } from './json-repair.js';

const DEFAULT_MODELS = ['GLM-5-Turbo', 'GLM-4.7', 'GLM-4.7-Flash'];

function buildPrompt(paper) {
  return [
    'You are generating a finance literature digest in Traditional Chinese.',
    'Return strict JSON only with keys: summary, classification, significance.',
    'classification should be a short category label.',
    'summary and significance should each be concise Traditional Chinese paragraphs.',
    JSON.stringify({
      title: paper.title,
      abstract: paper.abstract,
      journal: paper.journal,
      publicationDate: paper.publicationDate,
      doi: paper.doi,
    }),
  ].join('\n');
}

async function requestModel({ apiKey, baseUrl, endpointPath, model, paper, timeoutMs, maxTokens, fetchImpl }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(`${baseUrl}${endpointPath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: 'You are a precise research summarizer.' },
          { role: 'user', content: buildPrompt(paper) },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Zhipu request failed: ${response.status}`);
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Zhipu response missing message content');
    }

    return parseModelJson(content);
  } finally {
    clearTimeout(timer);
  }
}

function wait(ms, sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))) {
  return sleep(ms);
}

async function requestWithRetry(params, runtime) {
  const retries = runtime.maxRetries ?? 2;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestModel({ ...params, fetchImpl: runtime.fetchImpl });
    } catch (error) {
      const status = error?.message?.match(/(\d{3})$/)?.[1];
      const shouldRetry = (status === '429' || Number(status) >= 500) && attempt < retries;
      if (!shouldRetry) {
        throw error;
      }

      await wait((attempt + 1) * (runtime.retryDelayMs ?? 1000), runtime.sleep);
    }
  }

  throw new Error('Zhipu request exhausted retries');
}

export function createZhipuSummarizer(env = process.env, overrides = {}) {
  const apiKey = env.ZHIPU_API_KEY;
  const baseUrl = env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/coding/paas/v4';
  const endpointPath = env.ZHIPU_CHAT_COMPLETIONS_PATH || '/chat/completions';
  const timeoutMs = Number(env.ZHIPU_TIMEOUT_MS || 660000);
  const maxTokens = Number(env.ZHIPU_MAX_TOKENS || 100000);
  const models = (env.ZHIPU_MODELS || DEFAULT_MODELS.join(',')).split(',').map((item) => item.trim()).filter(Boolean);
  const runtime = {
    fetchImpl: overrides.fetchImpl || fetch,
    sleep: overrides.sleep,
    maxRetries: overrides.maxRetries ?? 2,
    retryDelayMs: overrides.retryDelayMs ?? 1000,
  };

  if (!apiKey) {
    return async (papers) => papers.map((paper) => ({
      ...paper,
      summary: paper.abstract || '未提供摘要，請查看原始文獻。',
      classification: 'Uncategorized',
      significance: '未設定 Zhipu API 金鑰，已保留原始文獻資訊。',
      modelUsed: 'fallback-local',
    }));
  }

  return async (papers) => {
    const outputs = [];

    for (const paper of papers) {
      let lastError;

      for (const model of models) {
        try {
          const enriched = await requestWithRetry({ apiKey, baseUrl, endpointPath, model, paper, timeoutMs, maxTokens }, runtime);
          outputs.push({
            ...paper,
            ...enriched,
            modelUsed: model,
          });
          lastError = undefined;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (lastError) {
        outputs.push({
          ...paper,
          summary: paper.abstract || '模型輸出失敗，請查看原始文獻。',
          classification: 'Fallback',
          significance: `模型處理失敗：${lastError.message}`,
          modelUsed: 'fallback-local',
        });
      }
    }

    return outputs;
  };
}
