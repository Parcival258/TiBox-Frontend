import type { EquipmentCatalogs } from '../types/equipmentCatalogs'
import { equipmentStatusLabel, ownershipTypeLabel } from '@/shared/utils/enumLabels'
import { uniqueValues } from './equipmentImportFormat'
import { equipmentImportTemplateHeaders } from './equipmentImportTypes'
import { buildZip } from './equipmentImportZip'

type ImportTemplateLists = {
  areas: string[]
  brands: string[]
  floors: string[]
  headquarters: string[]
  offices: string[]
  ownershipTypes: string[]
  responsibles: string[]
  statuses: string[]
  types: string[]
}

export function downloadEquipmentImportTemplate(catalogs: EquipmentCatalogs | null) {
  downloadBlob(
    'formato-carga-equipos.xlsx',
    createTemplateWorkbook(catalogs),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
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
  const listValues: ImportTemplateLists = {
    areas: uniqueValues(catalogs?.locations.map((item) => item.area ?? '') ?? []),
    brands: uniqueValues(catalogs?.brands ?? []),
    floors: uniqueValues(catalogs?.locations.map((item) => item.floor ?? '') ?? []),
    headquarters: uniqueValues(catalogs?.headquarters.map((item) => item.name) ?? []),
    offices: uniqueValues(catalogs?.locations.map((item) => item.office ?? '') ?? []),
    ownershipTypes: uniqueValues(
      (catalogs?.ownershipTypes ?? ['owned', 'leased']).map(ownershipTypeLabel)
    ),
    responsibles: uniqueValues(catalogs?.responsibles.map((item) => item.name) ?? []),
    statuses: uniqueValues(
      (catalogs?.statuses ?? [
        'active',
        'inactive',
        'in_maintenance',
        'damaged',
        'retired',
        'lost',
      ]).map(equipmentStatusLabel)
    ),
    types: uniqueValues(catalogs?.types ?? []),
  }
  const listRows = maxLength([
    listValues.statuses,
    listValues.ownershipTypes,
    listValues.headquarters,
    listValues.floors,
    listValues.areas,
    listValues.offices,
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
    ['xl/worksheets/sheet1.xml', equipmentSheetXml(listValues)],
    ['xl/worksheets/sheet2.xml', listsSheetXml(listValues, listRows)],
  ])

  return buildZip(files)
}

function equipmentSheetXml(lists: ImportTemplateLists) {
  const headerCells = equipmentImportTemplateHeaders
    .map((header, index) => cellXml(columnName(index + 1), 1, header))
    .join('')
  const emptyRowCells = equipmentImportTemplateHeaders
    .map((_, index) => cellXml(columnName(index + 1), 2, ''))
    .join('')

  return xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:Y200"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>
    <col min="1" max="25" width="22" customWidth="1"/>
  </cols>
  <sheetData>
    <row r="1">${headerCells}</row>
    <row r="2">${emptyRowCells}</row>
  </sheetData>
  <dataValidations count="9">
    ${dataValidationXml('C2:C200', 'H', lists.types.length, 'tipo')}
    ${dataValidationXml('E2:E200', 'I', lists.brands.length, 'marca')}
    ${dataValidationXml('G2:G200', 'A', lists.statuses.length, 'estado')}
    ${dataValidationXml('H2:H200', 'B', lists.ownershipTypes.length, 'propiedad')}
    ${dataValidationXml('I2:I200', 'C', lists.headquarters.length, 'sede')}
    ${dataValidationXml('J2:J200', 'D', lists.floors.length, 'piso')}
    ${dataValidationXml('K2:K200', 'E', lists.areas.length, 'area')}
    ${dataValidationXml('L2:L200', 'F', lists.offices.length, 'oficina')}
    ${dataValidationXml('M2:M200', 'G', lists.responsibles.length, 'responsable')}
    ${dataValidationXml('N2:N200', 'G', lists.responsibles.length, 'responsable secundario')}
  </dataValidations>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`)
}

function dataValidationXml(range: string, listColumn: string, listLength: number, field: string) {
  const lastRow = Math.max(2, listLength + 1)

  return `<dataValidation type="list" errorStyle="stop" allowBlank="1" showErrorMessage="1" errorTitle="Valor no valido" error="Selecciona un ${field} de la lista." sqref="${range}"><formula1>Listas!$${listColumn}$2:$${listColumn}$${lastRow}</formula1></dataValidation>`
}

function listsSheetXml(lists: ImportTemplateLists, rowCount: number) {
  const rows = [
    ['estado', 'propiedad', 'sede', 'piso', 'area', 'oficina', 'responsable', 'tipo', 'marca'],
    ...Array.from({ length: rowCount }, (_, index) => [
      lists.statuses[index] ?? '',
      lists.ownershipTypes[index] ?? '',
      lists.headquarters[index] ?? '',
      lists.floors[index] ?? '',
      lists.areas[index] ?? '',
      lists.offices[index] ?? '',
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
