import { describe, expect, it } from 'vitest'
import { strToU8, zipSync } from 'fflate'
import { readImportRows } from './equipmentImportFileReaders'

function xlsxFile() {
  const archive = zipSync({
    'xl/workbook.xml': strToU8(`
      <workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
        <sheets><sheet name="Equipos" r:id="rId1"/></sheets>
      </workbook>`),
    'xl/_rels/workbook.xml.rels': strToU8(`
      <Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>`),
    'xl/sharedStrings.xml': strToU8(`
      <sst><si><t>codigo</t></si><si><t>EQ-001</t></si></sst>`),
    'xl/styles.xml': strToU8(`
      <styleSheet><cellXfs count="2"><xf numFmtId="0"/><xf numFmtId="14"/></cellXfs></styleSheet>`),
    'xl/worksheets/sheet1.xml': strToU8(`
      <worksheet><sheetData>
        <row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="inlineStr"><is><t>fecha_compra</t></is></c></row>
        <row r="2"><c r="A2" t="s"><v>1</v></c><c r="B2" s="1"><v>45461</v></c></row>
      </sheetData></worksheet>`),
  })

  return {
    name: 'equipos.xlsx',
    size: archive.byteLength,
    arrayBuffer: async () => archive.buffer.slice(
      archive.byteOffset,
      archive.byteOffset + archive.byteLength
    ),
  } as File
}

describe('Excel inventory reader', () => {
  it('reads shared strings, inline strings and formatted dates without evaluating formulas', async () => {
    await expect(readImportRows(xlsxFile())).resolves.toEqual([
      ['codigo', 'fecha_compra'],
      ['EQ-001', '2024-06-18'],
    ])
  })

  it('rejects oversized files before opening the ZIP', async () => {
    const file = {
      name: 'oversized.xlsx',
      size: 5 * 1024 * 1024 + 1,
      arrayBuffer: async () => new ArrayBuffer(0),
    } as File

    await expect(readImportRows(file)).rejects.toThrow('supera el limite de 5 MB')
  })
})
