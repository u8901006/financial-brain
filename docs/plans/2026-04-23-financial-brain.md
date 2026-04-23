# Financial Brain Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and deploy a GitHub Pages site that publishes a daily finance literature digest from PubMed using Zhipu summarization and 7-day deduplication.

**Architecture:** A Node.js 24 static-site generator runs in GitHub Actions on a schedule. It parses the finance guide into PubMed queries, fetches and deduplicates papers, enriches results through Zhipu with model fallbacks and JSON repair, renders HTML plus JSON artifacts, and deploys the generated site to GitHub Pages.

**Tech Stack:** Node.js 24, native `fetch`, `node:test`, GitHub Actions, GitHub Pages, PubMed E-utilities, Zhipu Coding Plan API.

---

### Task 1: Initialize project and lock test harness

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `nodejs-test` via `node:test` usage in `tests/**/*.test.js`
- Create: `.gitignore`

**Step 1: Write the failing test**

Create `tests/smoke/project-structure.test.js` to assert the package exposes a `generate` script and uses Node 24.

**Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern "project metadata"`
Expected: FAIL because `package.json` does not exist yet.

**Step 3: Write minimal implementation**

Add `package.json` with scripts for `test` and `generate`, mark package as ESM, and set `engines.node` to `>=24`.

**Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern "project metadata"`
Expected: PASS.

### Task 2: Parse finance guide into search config

**Files:**
- Create: `src/lib/guide-parser.js`
- Create: `tests/guide-parser.test.js`

**Step 1: Write the failing test**

Add tests that verify the parser extracts master keywords, journal names, and PubMed templates from `finance_related_journals_pubmed_guide.md`.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/guide-parser.test.js`
Expected: FAIL because parser does not exist.

**Step 3: Write minimal implementation**

Implement a markdown parser that collects keyword bullets and journal sections into a structured config object.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/guide-parser.test.js`
Expected: PASS.

### Task 3: Build deduplication and issue loading

**Files:**
- Create: `src/lib/dedupe.js`
- Create: `tests/dedupe.test.js`
- Create: `src/lib/issues.js`

**Step 1: Write the failing test**

Add tests that verify existing records are matched by `PMID`, then `DOI`, then normalized title, and only the latest 7 days are considered.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/dedupe.test.js`
Expected: FAIL because dedupe utilities do not exist.

**Step 3: Write minimal implementation**

Implement issue loading, date filtering, key normalization, and deduplication helpers.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/dedupe.test.js`
Expected: PASS.

### Task 4: Build Zhipu response parsing and repair

**Files:**
- Create: `src/lib/json-repair.js`
- Create: `src/lib/zhipu-client.js`
- Create: `tests/json-repair.test.js`

**Step 1: Write the failing test**

Add tests that cover valid JSON, fenced JSON, prefix/suffix text, and truncated malformed payloads that can still be repaired.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/json-repair.test.js`
Expected: FAIL because the parser does not exist.

**Step 3: Write minimal implementation**

Implement JSON extraction and repair helpers, plus a Zhipu client with timeout, token budget, retry, and model fallback order.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/json-repair.test.js`
Expected: PASS.

### Task 5: Render finance pages

**Files:**
- Create: `src/templates/site.js`
- Create: `src/lib/render.js`
- Create: `tests/render.test.js`

**Step 1: Write the failing test**

Add tests that verify the home page and daily issue page contain the expected warm palette, page title, issue links, and footer links.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/render.test.js`
Expected: FAIL because renderers do not exist.

**Step 3: Write minimal implementation**

Implement HTML renderers for the index page and daily issue page, including empty-day handling and the required footer links.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/render.test.js`
Expected: PASS.

### Task 6: Build the generator entrypoint

**Files:**
- Create: `src/cli/generate.js`
- Modify: `package.json`
- Create: `tests/generate.test.js`

**Step 1: Write the failing test**

Add a fixture-driven integration test that runs the generator with mock fetch handlers and verifies `site/index.html`, a daily HTML file, and a JSON issue file are emitted.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/generate.test.js`
Expected: FAIL because the generator entrypoint does not exist.

**Step 3: Write minimal implementation**

Implement the CLI orchestration for guide parsing, PubMed fetch, dedupe, Zhipu enrichment, and output writing.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/generate.test.js`
Expected: PASS.

### Task 7: Add GitHub Actions and Pages deployment

**Files:**
- Create: `.github/workflows/daily.yml`
- Create: `README.md`

**Step 1: Write the failing test**

Add a smoke test or config assertion that checks the workflow exists and uses Node 24, scheduled UTC 03:00, and Pages deploy steps.

**Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern "workflow configuration"`
Expected: FAIL because the workflow does not exist.

**Step 3: Write minimal implementation**

Add the workflow with schedule, manual dispatch, tests, site generation, Pages upload, and deployment. Document secrets and setup in `README.md`.

**Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern "workflow configuration"`
Expected: PASS.

### Task 8: Verify end-to-end and publish

**Files:**
- Modify: repository settings and secrets via `gh`
- Create: generated `site/` and `data/issues/` outputs

**Step 1: Run full verification**

Run: `npm test`
Expected: all tests pass.

**Step 2: Run generator**

Run: `npm run generate`
Expected: generated site and issue JSON written successfully.

**Step 3: Create the GitHub repository and push**

Run non-interactive `gh repo create`, `git init`, `git add`, `git commit`, `git branch -M main`, `git remote add origin`, `git push -u origin main`.

**Step 4: Configure Pages and secrets**

Use `gh secret set ZHIPU_API_KEY` and GitHub API / `gh` commands to enable Pages deployment from Actions.

**Step 5: Trigger manual workflow and inspect result**

Run: `gh workflow run daily.yml` then check run status.
Expected: workflow succeeds and Pages URL becomes available.
