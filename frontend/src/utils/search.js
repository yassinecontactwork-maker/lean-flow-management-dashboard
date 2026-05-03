export function normalizeSearch(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function matchesSearch(item, query, accessors = []) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return true;

  const values = accessors.length
    ? accessors.map((accessor) => (typeof accessor === 'function' ? accessor(item) : item?.[accessor]))
    : [item];

  return values.some((value) => normalizeSearch(value).includes(normalizedQuery));
}
