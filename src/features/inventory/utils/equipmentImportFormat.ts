export function optional(value: string) {
  return value.trim() || undefined
}

export function optionalDate(value: string) {
  return value.trim() || undefined
}

export function normalizeImportValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

export function uniqueValues(values: readonly string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}
