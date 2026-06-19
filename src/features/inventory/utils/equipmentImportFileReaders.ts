import { strFromU8, unzipSync, type UnzipFileInfo } from 'fflate'

const MAX_XLSX_FILE_BYTES = 5 * 1024 * 1024
const MAX_XLSX_UNCOMPRESSED_BYTES = 20 * 1024 * 1024
const MAX_XLSX_ENTRY_BYTES = 10 * 1024 * 1024
const MAX_XLSX_ENTRIES = 200
const MAX_IMPORT_ROWS = 10_000
const MAX_IMPORT_COLUMNS = 100

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
  if (file.size > MAX_XLSX_FILE_BYTES) {
    throw new Error('El archivo Excel supera el limite de 5 MB.')
  }

  let entryCount = 0
  let uncompressedBytes = 0
  const files = unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter: (entry) => shouldExtractXlsxEntry(entry, () => {
      entryCount += 1
      uncompressedBytes += entry.originalSize

      if (entryCount > MAX_XLSX_ENTRIES || uncompressedBytes > MAX_XLSX_UNCOMPRESSED_BYTES) {
        throw new Error('El archivo Excel contiene demasiados datos.')
      }
    }),
  })
  const workbookXml = readXml(files, 'xl/workbook.xml')
  const relationshipsXml = readXml(files, 'xl/_rels/workbook.xml.rels')
  const firstSheet = workbookXml.getElementsByTagName('sheet')[0]
  const relationshipId = firstSheet?.getAttribute('r:id')
  const relationship = Array.from(relationshipsXml.getElementsByTagName('Relationship'))
    .find((item) => item.getAttribute('Id') === relationshipId)
  const sheetPath = normalizeWorksheetPath(relationship?.getAttribute('Target'))

  if (!sheetPath || !files[sheetPath]) {
    return []
  }

  const sharedStrings = files['xl/sharedStrings.xml']
    ? parseSharedStrings(readXml(files, 'xl/sharedStrings.xml'))
    : []
  const dateStyles = files['xl/styles.xml']
    ? parseDateStyles(readXml(files, 'xl/styles.xml'))
    : new Set<number>()

  return parseWorksheet(readXml(files, sheetPath), sharedStrings, dateStyles)
}

function shouldExtractXlsxEntry(entry: UnzipFileInfo, countEntry: () => void) {
  countEntry()

  if (entry.originalSize > MAX_XLSX_ENTRY_BYTES) {
    throw new Error('El archivo Excel contiene una entrada demasiado grande.')
  }

  return [
    'xl/workbook.xml',
    'xl/_rels/workbook.xml.rels',
    'xl/sharedStrings.xml',
    'xl/styles.xml',
  ].includes(entry.name) || /^xl\/worksheets\/[^/]+\.xml$/.test(entry.name)
}

function readXml(files: Record<string, Uint8Array>, path: string) {
  const content = files[path]

  if (!content) {
    throw new Error('El archivo Excel no tiene una estructura valida.')
  }

  const document = new DOMParser().parseFromString(strFromU8(content), 'application/xml')

  if (document.getElementsByTagName('parsererror').length > 0) {
    throw new Error('El archivo Excel contiene XML invalido.')
  }

  return document
}

function normalizeWorksheetPath(target: string | null | undefined) {
  if (!target) {
    return null
  }

  const normalized = target.replace(/\\/g, '/').replace(/^\//, '')
  const path = normalized.startsWith('xl/') ? normalized : `xl/${normalized}`

  return path.includes('../') ? null : path
}

function parseSharedStrings(document: XMLDocument) {
  return Array.from(document.getElementsByTagName('si')).map((item) =>
    Array.from(item.getElementsByTagName('t')).map((text) => text.textContent ?? '').join('')
  )
}

function parseWorksheet(
  document: XMLDocument,
  sharedStrings: string[],
  dateStyles: Set<number>
) {
  const rows: string[][] = []

  for (const rowElement of Array.from(document.getElementsByTagName('row'))) {
    if (rows.length >= MAX_IMPORT_ROWS) {
      throw new Error(`El archivo Excel supera el limite de ${MAX_IMPORT_ROWS} filas.`)
    }

    const row: string[] = []

    for (const cell of Array.from(rowElement.getElementsByTagName('c'))) {
      const columnIndex = columnIndexFromReference(cell.getAttribute('r'))

      if (columnIndex < 0 || columnIndex >= MAX_IMPORT_COLUMNS) {
        continue
      }

      while (row.length <= columnIndex) {
        row.push('')
      }

      row[columnIndex] = cellValue(cell, sharedStrings, dateStyles)
    }

    if (row.some((value) => value.trim())) {
      rows.push(row)
    }
  }

  return rows
}

function cellValue(cell: Element, sharedStrings: string[], dateStyles: Set<number>) {
  const type = cell.getAttribute('t')

  if (type === 'inlineStr') {
    return Array.from(cell.getElementsByTagName('t')).map((text) => text.textContent ?? '').join('')
  }

  const value = cell.getElementsByTagName('v')[0]?.textContent ?? ''

  if (type === 's') {
    return sharedStrings[Number(value)] ?? ''
  }

  if (type === 'b') {
    return value === '1' ? 'TRUE' : 'FALSE'
  }

  const styleIndex = Number(cell.getAttribute('s') ?? -1)
  return dateStyles.has(styleIndex) ? excelDate(value) : value
}

function columnIndexFromReference(reference: string | null) {
  const column = reference?.match(/^[A-Z]+/i)?.[0].toUpperCase()

  if (!column) {
    return -1
  }

  return [...column].reduce((index, character) => index * 26 + character.charCodeAt(0) - 64, 0) - 1
}

function parseDateStyles(document: XMLDocument) {
  const customDateFormats = new Set(
    Array.from(document.getElementsByTagName('numFmt'))
      .filter((format) => isDateFormat(format.getAttribute('formatCode') ?? ''))
      .map((format) => Number(format.getAttribute('numFmtId')))
  )
  const builtInDateFormats = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 45, 46, 47])
  const dateStyles = new Set<number>()
  const cellFormats = document.getElementsByTagName('cellXfs')[0]

  Array.from(cellFormats?.children ?? []).forEach((format, index) => {
    const numberFormatId = Number(format.getAttribute('numFmtId'))
    if (builtInDateFormats.has(numberFormatId) || customDateFormats.has(numberFormatId)) {
      dateStyles.add(index)
    }
  })

  return dateStyles
}

function isDateFormat(format: string) {
  const normalized = format.replace(/"[^"]*"|\[[^\]]*\]/g, '')
  return /[ymdhis]/i.test(normalized)
}

function excelDate(value: string) {
  const serial = Number(value)

  if (!Number.isFinite(serial)) {
    return value
  }

  const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86_400_000)
  return date.toISOString().slice(0, 10)
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
