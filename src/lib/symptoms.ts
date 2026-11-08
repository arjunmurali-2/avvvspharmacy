import 'server-only';
import { MEDICINES, medicineName } from '@/content/medicines';
import { SYNONYMS } from '@/content/synonyms';
import { CONCERNS, type Concern } from './site';
import { loose } from './format';

/*
 * Search by symptom. "back pain" → the Pain management concern, plus every medicine whose own
 * AVVVS-listed uses mention back pain or backache. Matching is spelling-tolerant (loose()).
 * Medicine names are left to Shopify's search; this only adds what Shopify can't know.
 */

export type SymptomHit = { handle: string; why: string; score: number };
export type SymptomMatch = { concerns: Concern[]; hits: SymptomHit[]; phrase?: string };

const norm = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()} `;

export function matchSymptoms(term: string): SymptomMatch {
  const t = norm(term);
  const lt = loose(term);
  if (lt.length < 3) return { concerns: [], hits: [] };

  // 1) which everyday phrases does the search mention (or start to type)?
  const entries = SYNONYMS.filter((s) => s.say.some((say) => {
    const ls = loose(say);
    return t.includes(norm(say)) || (lt.length >= 4 && ls.startsWith(lt)) || (ls.length >= 4 && lt.includes(ls));
  }));

  // also allow a concern's own name ("skin", "digestive")
  const concernSlugs = new Set(entries.flatMap((e) => e.concerns));
  for (const c of CONCERNS) {
    const lname = loose(c.name);
    if (lt.length >= 4 && (lname.startsWith(lt) || lname.includes(lt))) concernSlugs.add(c.slug);
  }

  // 2) the words to look for in each medicine's uses
  const finds = [...new Set(entries.flatMap((e) => e.find))];
  if (!finds.length && lt.length >= 5) finds.push(term.toLowerCase().trim());
  if (!finds.length) return { concerns: CONCERNS.filter((c) => concernSlugs.has(c.slug)), hits: [] };

  const hits: SymptomHit[] = [];
  for (const [handle, m] of Object.entries(MEDICINES)) {
    let score = 0;
    let why = '';
    for (const use of m.uses) {
      const u = use.toLowerCase();
      const n = finds.filter((f) => u.includes(f)).length;
      if (n) { score += n; if (!why) why = use; }
    }
    if (score) hits.push({ handle, why, score });
  }
  hits.sort((a, b) => b.score - a.score || medicineName(a.handle, a.handle).localeCompare(medicineName(b.handle, b.handle)));

  return { concerns: CONCERNS.filter((c) => concernSlugs.has(c.slug)), hits, phrase: entries[0]?.say[0] };
}
