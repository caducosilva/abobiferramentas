// Minimal JPEG/EXIF reader — just enough to surface the fields that matter for
// privacy (GPS location, camera make/model, capture date). Runs entirely in
// the browser on an ArrayBuffer the user picked locally; nothing is uploaded.

export interface ExifData {
  make?: string;
  model?: string;
  dateTaken?: string;
  software?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
}

const TAG_MAKE = 0x010f;
const TAG_MODEL = 0x0110;
const TAG_DATETIME = 0x0132;
const TAG_SOFTWARE = 0x0131;
const TAG_EXIF_IFD_POINTER = 0x8769;
const TAG_GPS_IFD_POINTER = 0x8825;
const TAG_DATETIME_ORIGINAL = 0x9003;
const TAG_GPS_LAT_REF = 0x0001;
const TAG_GPS_LAT = 0x0002;
const TAG_GPS_LON_REF = 0x0003;
const TAG_GPS_LON = 0x0004;

function readString(view: DataView, offset: number, length: number): string {
  let str = '';
  for (let i = 0; i < length; i++) {
    const code = view.getUint8(offset + i);
    if (code === 0) break;
    str += String.fromCharCode(code);
  }
  return str.trim();
}

function readRational(view: DataView, offset: number, littleEndian: boolean): number {
  const numerator = view.getUint32(offset, littleEndian);
  const denominator = view.getUint32(offset + 4, littleEndian);
  return denominator === 0 ? 0 : numerator / denominator;
}

interface IfdEntry {
  tag: number;
  type: number;
  count: number;
  valueOffset: number; // absolute offset within the DataView where the value/offset field starts
}

function readIfdEntries(view: DataView, ifdOffset: number, tiffStart: number, littleEndian: boolean): IfdEntry[] {
  const entryCount = view.getUint16(ifdOffset, littleEndian);
  const entries: IfdEntry[] = [];
  for (let i = 0; i < entryCount; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    entries.push({
      tag: view.getUint16(entryOffset, littleEndian),
      type: view.getUint16(entryOffset + 2, littleEndian),
      count: view.getUint32(entryOffset + 4, littleEndian),
      valueOffset: entryOffset + 8,
    });
  }
  return entries;
}

function typeSize(type: number): number {
  switch (type) {
    case 1: // BYTE
    case 2: // ASCII
    case 7: // UNDEFINED
      return 1;
    case 3: // SHORT
      return 2;
    case 4: // LONG
    case 9: // SLONG
      return 4;
    case 5: // RATIONAL
    case 10: // SRATIONAL
      return 8;
    default:
      return 4;
  }
}

function resolveDataOffset(view: DataView, entry: IfdEntry, tiffStart: number, littleEndian: boolean): number {
  const totalSize = typeSize(entry.type) * entry.count;
  return totalSize > 4 ? tiffStart + view.getUint32(entry.valueOffset, littleEndian) : entry.valueOffset;
}

export function parseExif(buffer: ArrayBuffer): ExifData | null {
  const view = new DataView(buffer);
  if (view.getUint16(0) !== 0xffd8) return null; // not a JPEG

  let offset = 2;
  while (offset < view.byteLength - 1) {
    const marker = view.getUint16(offset);
    if ((marker & 0xff00) !== 0xff00) break;
    if (marker === 0xffe1) {
      const segmentLength = view.getUint16(offset + 2);
      const exifHeaderOffset = offset + 4;
      const header = readString(view, exifHeaderOffset, 6);
      if (header.startsWith('Exif')) {
        return parseTiff(view, exifHeaderOffset + 6);
      }
      offset += 2 + segmentLength;
    } else if (marker === 0xffd8 || marker === 0xffd9) {
      offset += 2;
    } else {
      const segmentLength = view.getUint16(offset + 2);
      offset += 2 + segmentLength;
    }
  }
  return null;
}

function parseTiff(view: DataView, tiffStart: number): ExifData | null {
  const byteOrder = view.getUint16(tiffStart);
  const littleEndian = byteOrder === 0x4949; // 'II'
  if (byteOrder !== 0x4949 && byteOrder !== 0x4d4d) return null;

  const magic = view.getUint16(tiffStart + 2, littleEndian);
  if (magic !== 42) return null;

  const ifd0Offset = tiffStart + view.getUint32(tiffStart + 4, littleEndian);
  const result: ExifData = {};

  const ifd0Entries = readIfdEntries(view, ifd0Offset, tiffStart, littleEndian);
  let exifIfdOffset: number | null = null;
  let gpsIfdOffset: number | null = null;

  for (const entry of ifd0Entries) {
    if (entry.tag === TAG_MAKE) {
      result.make = readString(view, resolveDataOffset(view, entry, tiffStart, littleEndian), entry.count);
    } else if (entry.tag === TAG_MODEL) {
      result.model = readString(view, resolveDataOffset(view, entry, tiffStart, littleEndian), entry.count);
    } else if (entry.tag === TAG_SOFTWARE) {
      result.software = readString(view, resolveDataOffset(view, entry, tiffStart, littleEndian), entry.count);
    } else if (entry.tag === TAG_DATETIME) {
      result.dateTaken = readString(view, resolveDataOffset(view, entry, tiffStart, littleEndian), entry.count);
    } else if (entry.tag === TAG_EXIF_IFD_POINTER) {
      exifIfdOffset = tiffStart + view.getUint32(entry.valueOffset, littleEndian);
    } else if (entry.tag === TAG_GPS_IFD_POINTER) {
      gpsIfdOffset = tiffStart + view.getUint32(entry.valueOffset, littleEndian);
    }
  }

  if (exifIfdOffset !== null) {
    const exifEntries = readIfdEntries(view, exifIfdOffset, tiffStart, littleEndian);
    for (const entry of exifEntries) {
      if (entry.tag === TAG_DATETIME_ORIGINAL) {
        result.dateTaken = readString(view, resolveDataOffset(view, entry, tiffStart, littleEndian), entry.count);
      }
    }
  }

  if (gpsIfdOffset !== null) {
    const gpsEntries = readIfdEntries(view, gpsIfdOffset, tiffStart, littleEndian);
    let latRef = 'N';
    let lonRef = 'E';
    let lat: number[] | null = null;
    let lon: number[] | null = null;

    for (const entry of gpsEntries) {
      const dataOffset = resolveDataOffset(view, entry, tiffStart, littleEndian);
      if (entry.tag === TAG_GPS_LAT_REF) latRef = readString(view, dataOffset, entry.count);
      else if (entry.tag === TAG_GPS_LON_REF) lonRef = readString(view, dataOffset, entry.count);
      else if (entry.tag === TAG_GPS_LAT) {
        lat = [0, 1, 2].map((i) => readRational(view, dataOffset + i * 8, littleEndian));
      } else if (entry.tag === TAG_GPS_LON) {
        lon = [0, 1, 2].map((i) => readRational(view, dataOffset + i * 8, littleEndian));
      }
    }

    if (lat) {
      const decimal = lat[0] + lat[1] / 60 + lat[2] / 3600;
      result.gpsLatitude = latRef === 'S' ? -decimal : decimal;
    }
    if (lon) {
      const decimal = lon[0] + lon[1] / 60 + lon[2] / 3600;
      result.gpsLongitude = lonRef === 'W' ? -decimal : decimal;
    }
  }

  const hasData = Object.values(result).some((v) => v !== undefined);
  return hasData ? result : null;
}

export async function stripMetadata(file: File, quality = 0.92): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D não suportado neste navegador.');
  ctx.drawImage(bitmap, 0, 0);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar a imagem limpa.'))),
      outputType,
      quality
    );
  });
}
