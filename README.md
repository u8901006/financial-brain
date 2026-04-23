# Financial Brain

Daily finance literature digest site built from PubMed and Zhipu AI, published on GitHub Pages.

## Setup

1. Add repository secret `ZHIPU_API_KEY`.
2. GitHub Actions uses Node.js 24.
3. Daily workflow runs at 03:00 UTC, which is 11:00 in Taiwan.

## Commands

- `npm test`
- `npm run generate`

## Notes

- Source search guidance comes from `finance_related_journals_pubmed_guide.md`.
- The generator skips papers already included in the previous 7 days of issue JSON files.
- The site is rendered into `site/` and daily machine-readable data is stored in `data/issues/`.
