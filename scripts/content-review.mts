/*
 * Builds docs/CONTENT_MISTAKES.md: the hand-written findings (scripts/mistakes-intro.md), then a
 * table of every medicine's review note from src/content/medicines.ts.
 *   npm run content-review
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { MEDICINES } from '../src/content/medicines.ts';
import { CONCERNS_BY_HANDLE } from '../src/content/concernMap.ts';

const intro = readFileSync('scripts/mistakes-intro.md', 'utf8');
const nameOf = (h: string) => MEDICINES[h].name ?? h.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const esc = (s: string) => s.replace(/\|/g, '\\|');

const rows = Object.keys(MEDICINES).sort((a, b) => nameOf(a).localeCompare(nameOf(b)))
  .filter((h) => MEDICINES[h].review)
  .map((h) => `| ${esc(nameOf(h))} | ${esc(MEDICINES[h].review!)} | ${(CONCERNS_BY_HANDLE[h] ?? []).join(', ') || '(none yet)'} |`);

const out = `${intro}| Medicine | Review note | Listed under |\n|---|---|---|\n${rows.join('\n')}\n\n*${rows.length} of ${Object.keys(MEDICINES).length} medicines have a note.*\n`;
mkdirSync('docs', { recursive: true });
writeFileSync('docs/CONTENT_MISTAKES.md', out);
console.log(`docs/CONTENT_MISTAKES.md written: ${rows.length} notes.`);
