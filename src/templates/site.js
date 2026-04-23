export const siteStyles = `
  :root { --bg: #f6f1e8; --surface: #fffaf2; --line: #d8c5ab; --text: #2b2118; --muted: #766453; --accent: #8c4f2b; --accent-soft: #ead2bf; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: radial-gradient(circle at top, #fff6ea 0, var(--bg) 55%, #ead8c6 100%); color: var(--text); font-family: "Noto Sans TC", "PingFang TC", "Helvetica Neue", Arial, sans-serif; min-height: 100vh; }
  .container { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; padding: 72px 24px; }
  .logo { font-size: 48px; text-align: center; margin-bottom: 16px; }
  h1 { text-align: center; font-size: 24px; color: var(--text); margin-bottom: 8px; }
  .subtitle { text-align: center; color: var(--accent); font-size: 14px; margin-bottom: 40px; }
  .count { text-align: center; color: var(--muted); font-size: 13px; margin-bottom: 32px; }
  .lead { margin: 0 auto 24px; max-width: 680px; color: var(--muted); line-height: 1.8; text-align: center; }
  ul { list-style: none; }
  li { margin-bottom: 10px; }
  a { color: var(--text); text-decoration: none; }
  .issue-link { display: block; padding: 14px 20px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; transition: all 0.2s; font-size: 15px; }
  .issue-link:hover { background: var(--accent-soft); border-color: var(--accent); transform: translateX(4px); }
  .paper { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 24px; margin-bottom: 18px; box-shadow: 0 8px 30px rgba(140, 79, 43, 0.08); }
  .paper h2 { font-size: 20px; margin-bottom: 12px; }
  .meta, .tagline, .empty { color: var(--muted); font-size: 14px; line-height: 1.7; }
  .section-label { display: inline-block; margin-top: 16px; margin-bottom: 8px; padding: 4px 10px; border-radius: 999px; background: var(--accent-soft); color: var(--accent); font-size: 12px; letter-spacing: 0.04em; }
  .paper p { line-height: 1.8; }
  .back-link { display: inline-block; margin-bottom: 24px; color: var(--accent); }
  footer { margin-top: 56px; text-align: center; font-size: 12px; color: var(--muted); }
  footer a { color: var(--muted); }
  footer a:hover { color: var(--accent); }
`;

export function wrapHtml({ title, body }) {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title>
<style>${siteStyles}</style>
</head>
<body>
${body}
</body>
</html>`;
}
