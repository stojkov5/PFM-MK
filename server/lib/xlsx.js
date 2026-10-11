// server/lib/xlsx.js
// Minimal .xlsx writer: one sheet of text cells with a bold, frozen header row.
// An .xlsx file is a ZIP of a few XML parts, so no spreadsheet library is needed.
import { deflateRawSync } from "node:zlib";

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

// files: [{ name, data }] where data is a UTF-8 string.
const zip = (files) => {
  const chunks = [];
  const directory = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const raw = Buffer.from(file.data, "utf8");
    const packed = deflateRawSync(raw);

    // Fields shared by the local header and the central directory entry.
    const meta = Buffer.alloc(26);
    meta.writeUInt16LE(20, 0); // version needed (2.0)
    meta.writeUInt16LE(0x0800, 2); // flags: UTF-8 file names
    meta.writeUInt16LE(8, 4); // method: deflate
    meta.writeUInt16LE(0, 6); // time
    meta.writeUInt16LE(0x21, 8); // date: 1980-01-01
    meta.writeUInt32LE(crc32(raw), 10);
    meta.writeUInt32LE(packed.length, 14);
    meta.writeUInt32LE(raw.length, 18);
    meta.writeUInt16LE(name.length, 22);
    meta.writeUInt16LE(0, 24); // extra field length

    const local = Buffer.alloc(4);
    local.writeUInt32LE(0x04034b50, 0);
    chunks.push(local, meta, name, packed);

    const central = Buffer.alloc(6);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    const tail = Buffer.alloc(14); // comment len, disk, attrs (all zero) + offset
    tail.writeUInt32LE(offset, 10);
    directory.push(central, meta, tail, name);

    offset += 4 + meta.length + name.length + packed.length;
  }

  const directorySize = directory.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directorySize, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...chunks, ...directory, end]);
};

const escapeXml = (value) =>
  String(value ?? "")
    // Control characters are not allowed in XML 1.0.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const columnName = (index) => {
  let name = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  }
  return name;
};

// Every cell is written as text, so Excel never reinterprets a time such as
// "0:26.34" as a clock value.
const rowXml = (cells, rowNumber, style) =>
  `<row r="${rowNumber}">${cells
    .map(
      (cell, i) =>
        `<c r="${columnName(i)}${rowNumber}" t="inlineStr"${style ? ` s="${style}"` : ""}>` +
        `<is><t xml:space="preserve">${escapeXml(cell)}</t></is></c>`
    )
    .join("")}</row>`;

const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";

/**
 * @param sheetName  tab name (max 31 chars, none of []:*?/\)
 * @param columns    [{ header, width }] — width in characters
 * @param rows       array of arrays, one value per column
 * @returns Buffer with the .xlsx file
 */
export const buildXlsx = ({ sheetName, columns, rows }) => {
  const safeName = String(sheetName).replace(/[[\]:*?/\\]/g, " ").slice(0, 31) || "Sheet1";

  const sheet =
    `${XML}<worksheet xmlns="${MAIN_NS}">` +
    '<sheetViews><sheetView workbookViewId="0">' +
    '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' +
    "</sheetView></sheetViews>" +
    `<cols>${columns
      .map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.width ?? 20}" customWidth="1"/>`)
      .join("")}</cols>` +
    `<sheetData>${rowXml(columns.map((c) => c.header), 1, 1)}${rows
      .map((row, i) => rowXml(row, i + 2))
      .join("")}</sheetData></worksheet>`;

  return zip([
    {
      name: "[Content_Types].xml",
      data:
        `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        "</Types>",
    },
    {
      name: "_rels/.rels",
      data:
        `${XML}<Relationships xmlns="${PKG_REL_NS}">` +
        `<Relationship Id="rId1" Type="${REL_NS}/officeDocument" Target="xl/workbook.xml"/>` +
        "</Relationships>",
    },
    {
      name: "xl/workbook.xml",
      data:
        `${XML}<workbook xmlns="${MAIN_NS}" xmlns:r="${REL_NS}">` +
        "<bookViews><workbookView/></bookViews>" +
        `<sheets><sheet name="${escapeXml(safeName)}" sheetId="1" r:id="rId1"/></sheets>` +
        "</workbook>",
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data:
        `${XML}<Relationships xmlns="${PKG_REL_NS}">` +
        `<Relationship Id="rId1" Type="${REL_NS}/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="${REL_NS}/styles" Target="styles.xml"/>` +
        "</Relationships>",
    },
    {
      name: "xl/styles.xml",
      // Style 0 = normal, style 1 = bold (header row).
      data:
        `${XML}<styleSheet xmlns="${MAIN_NS}">` +
        '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>' +
        '<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
        '<fills count="2"><fill><patternFill patternType="none"/></fill>' +
        '<fill><patternFill patternType="gray125"/></fill></fills>' +
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
        '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
        "</styleSheet>",
    },
    { name: "xl/worksheets/sheet1.xml", data: sheet },
  ]);
};
