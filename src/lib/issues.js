import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function issuesDir(rootDir) {
  return join(rootDir, 'data', 'issues');
}

export function loadIssues(rootDir) {
  const directory = issuesDir(rootDir);
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => JSON.parse(readFileSync(join(directory, file), 'utf8')));
}

export function writeIssue(rootDir, issue) {
  const directory = issuesDir(rootDir);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, `${issue.date}.json`), `${JSON.stringify(issue, null, 2)}\n`, 'utf8');
}
