# Financial Brain Design

## Goal

Build `u8901006/financial-brain` as a GitHub Pages site that publishes a daily finance-literature digest. The site should query PubMed using the finance-focused journal and keyword guidance in `finance_related_journals_pubmed_guide.md`, skip studies already included in the last 7 days of reports, send new study data to Zhipu Coding Plan with `GLM-5-Turbo` and fallbacks, and render a polished HTML site with the same palette and typography layout as `Psychiatry-brain`.

## Constraints

- Use Node.js 24 in GitHub Actions.
- Use environment variables and GitHub secrets; do not hardcode API keys.
- Use `GLM-5-Turbo` with fallbacks `GLM-4.7` then `GLM-4.7-Flash`.
- Increase model token budget to 100000.
- Increase request timeout to 660 seconds.
- Harden JSON parsing and repair so malformed model output does not fail the full run.
- Append clinic, newsletter, and Buy Me a Coffee links to each daily report.

## Architecture

The project will be a small static-site generator driven by a scheduled GitHub Actions workflow. One Node entrypoint will orchestrate the run: load search configuration from the markdown guide, query PubMed, normalize candidate papers, deduplicate against the latest 7 daily issues, enrich and classify them through Zhipu, and render the issue page plus the home page. The generated site and daily JSON data live inside the repository and are published through GitHub Pages.

## Data Flow

1. Parse `finance_related_journals_pubmed_guide.md` into a search configuration with a master keyword bank and journal-specific PubMed query templates.
2. Query PubMed for recent literature and normalize each record into a stable internal schema.
3. Load the most recent daily issue JSON files and build a deduplication index using `PMID`, then `DOI`, then normalized title.
4. Keep only papers not already included in the last 7 days.
5. Send the remaining papers to Zhipu Coding Plan, request strict JSON output, and attempt structured repair if parsing fails.
6. Render `index.html`, one `financial-YYYY-MM-DD.html` issue page, and machine-readable JSON data files.
7. Commit generated output back to the repository and let GitHub Pages publish it.

## Reliability

- Retry Zhipu requests with model fallback order.
- Use large timeout and explicit abort handling.
- Separate data collection from rendering so partial failures can still produce a valid site.
- If model formatting is invalid after repair, keep the original paper metadata and mark the item as a fallback summary instead of aborting the whole issue.
- If no new papers are found, still generate a daily issue page that clearly says no new eligible studies were identified.

## Site Structure

- `src/config/`: runtime config, environment parsing, search settings
- `src/lib/`: PubMed client, Zhipu client, parser, deduper, renderer helpers
- `src/templates/`: HTML templates for the home page and daily issue page
- `src/cli/`: generation entrypoint
- `data/issues/`: generated daily JSON snapshots
- `site/`: generated HTML output for GitHub Pages
- `.github/workflows/`: CI schedule and deployment

## Visual Design

Keep the same warm palette and text hierarchy as `Psychiatry-brain`:

- Background: `#f6f1e8` family with warm radial gradient
- Surface: `#fffaf2`
- Lines: `#d8c5ab`
- Text: `#2b2118`
- Accent: `#8c4f2b`

The finance site will keep the same typography proportions and centered index layout while using finance-specific copy and a distinct logo/title.

## Testing

- Unit test markdown parsing from the guide.
- Unit test deduplication priority rules.
- Unit test JSON repair / extraction logic for malformed model output.
- Unit test issue rendering for normal and empty-result days.
- Smoke test the full generator with fixture input.

## Deployment

GitHub Actions will run daily at 03:00 UTC, which maps to 11:00 in Taiwan. A manual workflow dispatch will also be available. The workflow installs Node.js 24, runs tests, generates the site, uploads Pages artifacts, and deploys with the official Pages actions. Repository secrets will store the Zhipu API key.
