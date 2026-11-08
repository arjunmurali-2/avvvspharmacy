import type { Metafield } from './shopify/types';

/*
 * Medicine information comes only from Shopify product metafields in the `pharmacy` namespace.
 * The store never writes its own. A section appears only when its metafield has a value.
 */
export const PHARMACY_FIELDS = [
  { key: 'indications', label: 'Indications' },
  { key: 'dosage', label: 'Dosage' },
  { key: 'anupana', label: 'Anupana (taken with)' },
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'contraindications', label: 'Cautions' },
  { key: 'storage', label: 'Storage' },
  { key: 'pack_size', label: 'Pack size' },
  { key: 'shelf_life', label: 'Shelf life' },
  { key: 'licence_no', label: 'Manufacturing licence' },
] as const;

export const PHARMACY_KEYS = [
  ...PHARMACY_FIELDS.map((f) => f.key),
  'malayalam_name', 'sanskrit_name', 'rx_recommended', 'reference_text',
] as const;

export type MedicineInfo = {
  sections: { key: string; label: string; value: string; list?: string[] }[];
  malayalam?: string;
  sanskrit?: string;
  reference?: string;
  rxRecommended: boolean;
};

/** Turns a metafield value into display text; list types arrive as JSON arrays. */
function text(m: NonNullable<Metafield>): { value: string; list?: string[] } {
  if (m.type.startsWith('list.')) {
    try { const arr = JSON.parse(m.value) as unknown[]; const list = arr.map(String).filter(Boolean); return { value: list.join(', '), list }; } catch { /* fall through */ }
  }
  if (m.type === 'rich_text_field') {
    try { return { value: richToText(JSON.parse(m.value)) }; } catch { /* fall through */ }
  }
  return { value: m.value };
}

type RichNode = { type?: string; value?: string; children?: RichNode[] };
function richToText(n: RichNode): string {
  if (n.value) return n.value;
  const inner = (n.children ?? []).map(richToText).join(n.type === 'root' || n.type === 'list' ? '\n' : '');
  return inner;
}

export function readMedicine(metafields?: Metafield[]): MedicineInfo {
  const by = new Map<string, NonNullable<Metafield>>();
  for (const m of metafields ?? []) if (m && m.value?.trim()) by.set(m.key, m);
  const sections = PHARMACY_FIELDS.flatMap((f) => {
    const m = by.get(f.key);
    return m ? [{ key: f.key, label: f.label, ...text(m) }] : [];
  });
  return {
    sections,
    malayalam: by.get('malayalam_name')?.value,
    sanskrit: by.get('sanskrit_name')?.value,
    reference: by.get('reference_text')?.value,
    rxRecommended: by.get('rx_recommended')?.value === 'true',
  };
}
