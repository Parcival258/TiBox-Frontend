export function buildZip(files: Map<string, string | Uint8Array>) {
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
