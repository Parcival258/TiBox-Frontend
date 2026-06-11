const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/

function parseDate(value: string) {
  const dateOnly = value.match(dateOnlyPattern)

  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
  }

  return new Date(value)
}

export function formatDate(value: string | null | undefined, fallback = 'Sin fecha') {
  if (!value) return fallback

  const date = parseDate(value)
  if (Number.isNaN(date.getTime())) return fallback

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(value: string | null | undefined, fallback = 'Sin fecha') {
  if (!value) return fallback

  const date = parseDate(value)
  if (Number.isNaN(date.getTime())) return fallback

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function displayDateToIso(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null

  const [, day, month, year] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null
  }

  return `${year}-${month}-${day}`
}
