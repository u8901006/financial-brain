function stripCodeFence(value) {
  return value.replace(/```json\s*/i, '').replace(/```/g, '').trim();
}

function extractJsonCandidate(value) {
  const cleaned = stripCodeFence(value);
  const objectStart = cleaned.indexOf('{');
  const arrayStart = cleaned.indexOf('[');
  const start = [objectStart, arrayStart].filter((item) => item >= 0).sort((a, b) => a - b)[0];

  if (start === undefined) {
    return cleaned;
  }

  return cleaned.slice(start).trim();
}

function repairJson(candidate) {
  let output = candidate.trim();
  const openCurly = (output.match(/\{/g) || []).length;
  const closeCurly = (output.match(/\}/g) || []).length;
  const openSquare = (output.match(/\[/g) || []).length;
  const closeSquare = (output.match(/\]/g) || []).length;
  const quoteCount = (output.match(/(?<!\\)"/g) || []).length;

  if (quoteCount % 2 === 1) {
    output += '"';
  }

  output += ']'.repeat(Math.max(0, openSquare - closeSquare));
  output += '}'.repeat(Math.max(0, openCurly - closeCurly));

  return output;
}

export function parseModelJson(value) {
  const candidate = extractJsonCandidate(value);

  try {
    return JSON.parse(candidate);
  } catch {
    return JSON.parse(repairJson(candidate));
  }
}
