/**
 * Expand a free-text search query into the casing variants a skill might be
 * stored as. `requiredSkills` is a Postgres text[]; Prisma's array `hasSome`
 * matches exact, case-sensitive strings (there is no `mode: 'insensitive'` for
 * scalar-list filters), so a single lowercased query would miss "Python" or
 * "SQL". We match against the raw query plus lowercase, Title Case Per Word,
 * and UPPERCASE forms.
 *
 *   skillVariants('machine learning') -> ['machine learning', 'Machine Learning', 'MACHINE LEARNING']
 *   skillVariants('SQL')              -> ['SQL', 'sql', 'Sql']
 *   skillVariants('  Data  ')         -> ['Data', 'data', 'DATA']
 *   skillVariants('')                 -> []
 */
export function skillVariants(q: string): string[] {
  const raw = q.trim();
  if (!raw) return [];
  const lower = raw.toLowerCase();
  const titleCase = lower.replace(/\b\w/g, (c) => c.toUpperCase());
  const upper = raw.toUpperCase();
  // De-dupe while preserving order (raw first, so an already-title-cased query
  // isn't reordered).
  return [...new Set([raw, lower, titleCase, upper])];
}
