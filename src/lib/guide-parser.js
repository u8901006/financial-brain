function cleanInlineMarkdown(value) {
  return value.replace(/`/g, '').replace(/\*\*/g, '').trim();
}

export function parseFinanceGuide(markdown) {
  const keywordGroups = [];
  const keywordSectionMatch = markdown.match(/## Master Keyword Bank([\s\S]*?)---/);

  if (keywordSectionMatch) {
    for (const line of keywordSectionMatch[1].split(/\r?\n/)) {
      const match = line.match(/^- \*\*(.+?)\*\*:\s*(.+)$/);
      if (!match) continue;

      keywordGroups.push({
        title: cleanInlineMarkdown(match[1]),
        keywords: match[2].split(',').map((item) => cleanInlineMarkdown(item)).filter(Boolean),
      });
    }
  }

  const journals = [];
  const journalPattern = /^###\s+\d+\)\s+(.+)$/gm;
  const journalMatches = [...markdown.matchAll(journalPattern)];

  for (let index = 0; index < journalMatches.length; index += 1) {
    const current = journalMatches[index];
    const start = current.index + current[0].length;
    const end = index + 1 < journalMatches.length ? journalMatches[index + 1].index : markdown.length;
    const block = markdown.slice(start, end);
    const templateMatch = block.match(/- \*\*PubMed template\*\*:\s*```text\s*([\s\S]*?)```/);
    const domainMatch = block.match(/- \*\*Domain\*\*:\s*(.+)/);
    const keywordsMatch = block.match(/- \*\*Common keywords\*\*:\s*(.+)/);

    journals.push({
      name: cleanInlineMarkdown(current[1]),
      domain: domainMatch ? cleanInlineMarkdown(domainMatch[1]) : '',
      keywords: keywordsMatch ? keywordsMatch[1].split(',').map((item) => cleanInlineMarkdown(item)).filter(Boolean) : [],
      template: templateMatch ? templateMatch[1].replace(/\s+/g, ' ').trim() : '',
    });
  }

  return { keywordGroups, journals };
}
