import * as XLSX from 'xlsx'

export async function readImportRows(file: File) {
  return file.name.toLowerCase().endsWith('.xlsx')
    ? await parseXlsx(file)
    : parseCsv(await file.text())
}

function parseCsv(text: string) {
  const delimiter = detectDelimiter(text)
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const nextChar = text[index + 1]

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === delimiter && !inQuotes) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1
      }

      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  row.push(cell)
  rows.push(row)

  return rows.filter((currentRow) => currentRow.some((currentCell) => currentCell.trim()))
}

async function parseXlsx(file: File) {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = firstSheetName ? workbook.Sheets[firstSheetName] : null

  if (!worksheet) {
    return []
  }

  return XLSX.utils.sheet_to_json<string[]>(worksheet, {
    blankrows: false,
    defval: '',
    header: 1,
    raw: false,
  })
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const candidates = [';', ',', '\t']

  return candidates
    .map((delimiter) => ({
      delimiter,
      count: firstLine.split(delimiter).length,
    }))
    .sort((left, right) => right.count - left.count)[0].delimiter
}
