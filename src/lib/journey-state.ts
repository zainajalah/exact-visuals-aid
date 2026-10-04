/** Status kecil yang dibagi antar bab (pecahan kosmik yang dikumpulkan). */
export const FRAGMENT_TOTAL = 10;
/** fragments: energi tersimpan (selalu 0..10). gates: berapa kali gerbang kosmik diaktifkan. */
export const journey = { fragments: 0, gates: 0 };

export const clampFragments = (n: number) =>
  Math.max(0, Math.min(FRAGMENT_TOTAL, Math.floor(Number.isFinite(n) ? n : 0)));
