import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('project metadata defines Node 24-compatible generate workflow', () => {
  assert.equal(existsSync(new URL('../../package.json', import.meta.url)), true);

  const packageJson = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
  );

  assert.equal(packageJson.type, 'module');
  assert.match(packageJson.engines.node, /24|>=24/);
  assert.equal(typeof packageJson.scripts.test, 'string');
  assert.equal(typeof packageJson.scripts.generate, 'string');
});

test('workflow configuration exists for Pages deployment', () => {
  assert.equal(existsSync(new URL('../../.github/workflows/daily.yml', import.meta.url)), true);

  const workflow = readFileSync(new URL('../../.github/workflows/daily.yml', import.meta.url), 'utf8');
  assert.match(workflow, /node-version:\s*'24'/);
  assert.match(workflow, /cron:\s*'0 3 \* \* \*'/);
  assert.match(workflow, /uses:\s+actions\/deploy-pages@v4/);
  assert.match(workflow, /continue-on-error:\s*true/);
});
