import type { EquipmentCatalogs, EquipmentPayload } from '../types/inventory'
import * as XLSX from 'xlsx'

export type EquipmentImportResult = {
  created: number
  errors: string[]
  total: number
}

export type EquipmentImportRow = {
  payload: EquipmentPayload
  rowNumber: number
}

const templateHeaders = [
  'codigo',
  'serial',
  'tipo',
  'placa_inventario',
  'marca',
  'modelo',
  'estado',
  'propiedad',
  'sede',
  'ubicacion',
  'responsable',
  'responsable_secundario',
  'ip',
  'mac',
  'procesador',
  'almacenamiento_tipo',
  'almacenamiento_gb',
  'fecha_compra',
  'garantia_hasta',
  'proveedor_arriendo',
  'contrato_arriendo',
  'fin_arriendo',
  'notas',
]

const statusAliases: Record<string, string> = {
  activo: 'active',
  active: 'active',
  danado: 'damaged',
  damaged: 'damaged',
  'en mantenimiento': 'in_maintenance',
  inactive: 'inactive',
  inactivo: 'inactive',
  in_maintenance: 'in_maintenance',
  lost: 'lost',
  perdido: 'lost',
  retired: 'retired',
  retirado: 'retired',
}

const ownershipAliases: Record<string, 'owned' | 'leased'> = {
  arrendado: 'leased',
  leased: 'leased',
  owned: 'owned',
  propio: 'owned',
}

export function downloadEquipmentImportTemplate(catalogs: EquipmentCatalogs | null) {
  downloadBlob(
    'formato-carga-equipos.xlsx',
    createTemplateWorkbook(catalogs),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
}

export async function readEquipmentImportFile(file: File, catalogs: EquipmentCatalogs | null) {
  const rows = file.name.toLowerCase().endsWith('.xlsx')
    ? await parseXlsx(file)
    : parseCsv(await file.text())
  const [headers, ...dataRows] = rows
  const errors: string[] = []

  if (!headers || headers.length === 0) {
    return { errors: ['El archivo no tiene encabezados.'], rows: [] }
  }

  const headerIndex = new Map(headers.map((header, index) => [normalize(header), index]))
  const mappedRows = dataRows
    .map((row, index) => ({ row, rowNumber: index + 2 }))
    .filter(({ row }) => row.some((cell) => cell.trim()))
    .map(({ row, rowNumber }) => {
      const payload = rowToPayload(row, headerIndex, catalogs, rowNumber, errors)

      return payload ? { payload, rowNumber } : null
    })
    .filter((row): row is EquipmentImportRow => Boolean(row))

  return {
    errors,
    rows: mappedRows,
  }
}

function rowToPayload(
  row: string[],
  headerIndex: Map<string, number>,
  catalogs: EquipmentCatalogs | null,
  rowNumber: number,
  errors: string[]
) {
  const get = (header: string) => row[headerIndex.get(header) ?? -1]?.trim() ?? ''
  const internalCode = get('codigo')
  const serial = get('serial')
  const type = get('tipo')
  const rowErrors: string[] = []

  if (!internalCode || !serial || !type) {
    errors.push(`Fila ${rowNumber}: codigo, serial y tipo son obligatorios.`)
    return null
  }

  const ownershipType = mapOwnership(get('propiedad'), rowNumber, rowErrors)
  const storageCapacityGb = mapNumber(get('almacenamiento_gb'), rowNumber, rowErrors)
  const status = mapStatus(get('estado'), rowNumber, rowErrors)
  const headquarterId = findHeadquarterId(get('sede'), catalogs)
  const locationId = findLocationId(get('ubicacion'), headquarterId, catalogs)
  const currentResponsibleId = findResponsibleId(get('responsable'), catalogs)
  const secondaryResponsibleId = findResponsibleId(get('responsable_secundario'), catalogs)

  if (get('sede') && !headquarterId) {
    rowErrors.push(`Fila ${rowNumber}: sede no encontrada (${get('sede')}).`)
  }

  if (get('ubicacion') && !locationId) {
    rowErrors.push(`Fila ${rowNumber}: ubicacion no encontrada (${get('ubicacion')}).`)
  }

  if (get('responsable') && !currentResponsibleId) {
    rowErrors.push(`Fila ${rowNumber}: responsable no encontrado (${get('responsable')}).`)
  }

  if (get('responsable_secundario') && !secondaryResponsibleId) {
    rowErrors.push(`Fila ${rowNumber}: responsable secundario no encontrado (${get('responsable_secundario')}).`)
  }

  if (rowErrors.length > 0) {
    errors.push(...rowErrors)
    return null
  }

  const payload: EquipmentPayload = {
    internalCode,
    serial,
    type,
    assetTag: optional(get('placa_inventario')),
    brand: optional(get('marca')),
    currentResponsibleId,
    headquarterId,
    ipAddresses: optional(get('ip')),
    leaseContractNumber: optional(get('contrato_arriendo')),
    leaseProvider: optional(get('proveedor_arriendo')),
    leaseUntil: optionalDate(get('fin_arriendo')),
    locationId,
    macAddress: optional(get('mac')),
    model: optional(get('modelo')),
    notes: optional(get('notas')),
    ownershipType,
    processor: optional(get('procesador')),
    purchaseDate: optionalDate(get('fecha_compra')),
    secondaryResponsibleId,
    status,
    storageCapacityGb,
    storageType: optional(get('almacenamiento_tipo')),
    warrantyUntil: optionalDate(get('garantia_hasta')),
  }

  return payload
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

function downloadBlob(fileName: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function createTemplateWorkbook(catalogs: EquipmentCatalogs | null) {
  const listValues = {
    brands: catalogs?.brands ?? [],
    headquarters: catalogs?.headquarters.map((item) => item.name) ?? [],
    locations: catalogs?.locations.map((item) =>
      [item.area, item.office, item.floor].filter(Boolean).join(' / ')
    ) ?? [],
    ownershipTypes: ['Propio', 'Arrendado'],
    responsibles: catalogs?.responsibles.map((item) => item.name) ?? [],
    statuses: ['Activo', 'Inactivo', 'En mantenimiento', 'Danado', 'Retirado', 'Perdido'],
    types: catalogs?.types ?? [],
  }
  const listRows = maxLength([
    listValues.statuses,
    listValues.ownershipTypes,
    listValues.headquarters,
    listValues.locations,
    listValues.responsibles,
    listValues.types,
    listValues.brands,
  ])
  const files = new Map<string, string | Uint8Array>([
    ['[Content_Types].xml', contentTypesXml()],
    ['_rels/.rels', rootRelsXml()],
    ['docProps/app.xml', appXml()],
    ['docProps/core.xml', coreXml()],
    ['xl/workbook.xml', workbookXml()],
    ['xl/_rels/workbook.xml.rels', workbookRelsXml()],
    ['xl/styles.xml', stylesXml()],
    ['xl/worksheets/sheet1.xml', equipmentSheetXml()],
    ['xl/worksheets/sheet2.xml', listsSheetXml(listValues, listRows)],
  ])

  return buildZip(files)
}

function equipmentSheetXml() {
  const headerCells = templateHeaders
    .map((header, index) => cellXml(columnName(index + 1), 1, header))
    .join('')
  const emptyRowCells = templateHeaders
    .map((_, index) => cellXml(columnName(index + 1), 2, ''))
    .join('')

  return xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:W200"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>
    <col min="1" max="23" width="22" customWidth="1"/>
  </cols>
  <sheetData>
    <row r="1">${headerCells}</row>
    <row r="2">${emptyRowCells}</row>
  </sheetData>
  <dataValidations count="7">
    <dataValidation type="list" allowBlank="1" sqref="G2:G200"><formula1>Listas!$A$2:$A$7</formula1></dataValidation>
    <dataValidation type="list" allowBlank="1" sqref="H2:H200"><formula1>Listas!$B$2:$B$3</formula1></dataValidation>
    <dataValidation type="list" allowBlank="1" sqref="I2:I200"><formula1>Listas!$C$2:$C$500</formula1></dataValidation>
    <dataValidation type="list" allowBlank="1" sqref="J2:J200"><formula1>Listas!$D$2:$D$500</formula1></dataValidation>
    <dataValidation type="list" allowBlank="1" sqref="K2:K200"><formula1>Listas!$E$2:$E$500</formula1></dataValidation>
    <dataValidation type="list" allowBlank="1" sqref="L2:L200"><formula1>Listas!$E$2:$E$500</formula1></dataValidation>
    <dataValidation type="list" allowBlank="1" sqref="C2:C200"><formula1>Listas!$F$2:$F$500</formula1></dataValidation>
  </dataValidations>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`)
}

function listsSheetXml(
  lists: {
    brands: string[]
    headquarters: string[]
    locations: string[]
    ownershipTypes: string[]
    responsibles: string[]
    statuses: string[]
    types: string[]
  },
  rowCount: number
) {
  const rows = [
    ['estado', 'propiedad', 'sede', 'ubicacion', 'responsable', 'tipo', 'marca'],
    ...Array.from({ length: rowCount }, (_, index) => [
      lists.statuses[index] ?? '',
      lists.ownershipTypes[index] ?? '',
      lists.headquarters[index] ?? '',
      lists.locations[index] ?? '',
      lists.responsibles[index] ?? '',
      lists.types[index] ?? '',
      lists.brands[index] ?? '',
    ]),
  ]
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1
      const cells = row.map((value, columnIndex) =>
        cellXml(columnName(columnIndex + 1), rowNumber, value)
      ).join('')

      return `<row r="${rowNumber}">${cells}</row>`
    })
    .join('')

  return xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>${rows}</sheetData>
</worksheet>`)
}

function contentTypesXml() {
  return xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`)
}

function rootRelsXml() {
  return xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`)
}

function workbookXml() {
  return xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Equipos" sheetId="1" r:id="rId1"/>
    <sheet name="Listas" sheetId="2" state="hidden" r:id="rId2"/>
  </sheets>
</workbook>`)
}

function workbookRelsXml() {
  return xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`)
}

function stylesXml() {
  return xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>`)
}

function appXml() {
  return xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>TIBOX</Application>
</Properties>`)
}

function coreXml() {
  return xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Formato carga equipos</dc:title>
  <dc:creator>TIBOX</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
</cp:coreProperties>`)
}

function buildZip(files: Map<string, string | Uint8Array>) {
  const encoder = new TextEncoder()
  const chunks: Uint8Array[] = []
  const centralDirectory: Uint8Array[] = []
  let offset = 0

  files.forEach((content, fileName) => {
    const nameBytes = encoder.encode(fileName)
    const data = typeof content === 'string' ? encoder.encode(content) : content
    const crc = crc32(data)
    const localHeader = zipHeader(0x04034b50, [
      20, 0, 0, 0, 0, crc, data.length, data.length, nameBytes.length, 0,
    ])
    chunks.push(localHeader, nameBytes, data)

    const centralHeader = zipHeader(0x02014b50, [
      20, 20, 0, 0, 0, 0, crc, data.length, data.length, nameBytes.length, 0, 0, 0, 0, 0, offset,
    ])
    centralDirectory.push(centralHeader, nameBytes)
    offset += localHeader.length + nameBytes.length + data.length
  })

  const centralOffset = offset
  const centralSize = centralDirectory.reduce((size, chunk) => size + chunk.length, 0)
  const fileCount = files.size
  const endHeader = zipHeader(0x06054b50, [
    0, 0, fileCount, fileCount, centralSize, centralOffset, 0,
  ])

  return concatBytes([...chunks, ...centralDirectory, endHeader])
}

function zipHeader(signature: number, values: number[]) {
  const sizes = signature === 0x02014b50
    ? [2, 2, 2, 2, 2, 2, 4, 4, 4, 2, 2, 2, 2, 2, 4, 4]
    : signature === 0x06054b50
      ? [2, 2, 2, 2, 4, 4, 2]
      : [2, 2, 2, 2, 2, 4, 4, 4, 2, 2]
  const length = 4 + sizes.reduce((sum, size) => sum + size, 0)
  const bytes = new Uint8Array(length)
  const view = new DataView(bytes.buffer)
  let offset = 0
  view.setUint32(offset, signature, true)
  offset += 4

  values.forEach((value, index) => {
    if (sizes[index] === 4) {
      view.setUint32(offset, value >>> 0, true)
    } else {
      view.setUint16(offset, value, true)
    }
    offset += sizes[index]
  })

  return bytes
}

function concatBytes(chunks: Uint8Array[]) {
  const length = chunks.reduce((size, chunk) => size + chunk.length, 0)
  const result = new Uint8Array(length)
  let offset = 0

  chunks.forEach((chunk) => {
    result.set(chunk, offset)
    offset += chunk.length
  })

  return result
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff

  bytes.forEach((byte) => {
    crc ^= byte
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  })

  return (crc ^ 0xffffffff) >>> 0
}

function xmlFile(xml: string) {
  return xml.trim()
}

function cellXml(column: string, row: number, value: string) {
  if (!value) {
    return `<c r="${column}${row}"/>`
  }

  return `<c r="${column}${row}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`
}

function columnName(index: number) {
  let name = ''
  let current = index

  while (current > 0) {
    const remainder = (current - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    current = Math.floor((current - 1) / 26)
  }

  return name
}

function maxLength(lists: string[][]) {
  return Math.max(1, ...lists.map((list) => list.length))
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function optional(value: string) {
  return value.trim() || undefined
}

function optionalDate(value: string) {
  return value.trim() || undefined
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function mapStatus(value: string, rowNumber: number, errors: string[]) {
  if (!value) {
    return 'active'
  }

  const status = statusAliases[normalize(value)]

  if (!status) {
    errors.push(`Fila ${rowNumber}: estado no valido (${value}).`)
    return 'active'
  }

  return status
}

function mapOwnership(value: string, rowNumber: number, errors: string[]) {
  if (!value) {
    return 'owned'
  }

  const ownershipType = ownershipAliases[normalize(value)]

  if (!ownershipType) {
    errors.push(`Fila ${rowNumber}: propiedad no valida (${value}).`)
    return 'owned'
  }

  return ownershipType
}

function mapNumber(value: string, rowNumber: number, errors: string[]) {
  if (!value) {
    return undefined
  }

  const number = Number(value.replace(',', '.'))

  if (Number.isNaN(number)) {
    errors.push(`Fila ${rowNumber}: almacenamiento_gb debe ser numerico.`)
    return undefined
  }

  return number
}

function findHeadquarterId(value: string, catalogs: EquipmentCatalogs | null) {
  if (!value) {
    return undefined
  }

  const normalizedValue = normalize(value)
  const headquarter = catalogs?.headquarters.find(
    (item) => normalize(item.id) === normalizedValue || normalize(item.name) === normalizedValue
  )

  return headquarter?.id
}

function findLocationId(
  value: string,
  headquarterId: string | undefined,
  catalogs: EquipmentCatalogs | null
) {
  if (!value) {
    return undefined
  }

  const normalizedValue = normalize(value)
  const locations = catalogs?.locations.filter(
    (location) => !headquarterId || location.headquarterId === headquarterId
  )
  const location = locations?.find((item) => {
    const label = [item.area, item.office, item.floor].filter(Boolean).join(' / ')

    return normalize(item.id) === normalizedValue || normalize(label) === normalizedValue
  })

  return location?.id
}

function findResponsibleId(value: string, catalogs: EquipmentCatalogs | null) {
  if (!value) {
    return undefined
  }

  const normalizedValue = normalize(value)
  const responsible = catalogs?.responsibles.find(
    (item) =>
      normalize(item.id) === normalizedValue ||
      normalize(item.name) === normalizedValue ||
      normalize(item.email ?? '') === normalizedValue
  )

  return responsible?.id
}
