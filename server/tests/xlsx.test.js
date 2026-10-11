// server/tests/xlsx.test.js
import { describe, it, expect } from "vitest";
import { inflateRawSync } from "node:zlib";
import { buildXlsx } from "../lib/xlsx.js";

// Reads the archive back through its central directory.
const unzip = (buf) => {
  const end = buf.length - 22;
  const count = buf.readUInt16LE(end + 10);
  let pos = buf.readUInt32LE(end + 16);
  const files = {};
  for (let i = 0; i < count; i++) {
    expect(buf.readUInt32LE(pos)).toBe(0x02014b50);
    const packedSize = buf.readUInt32LE(pos + 20);
    const nameLength = buf.readUInt16LE(pos + 28);
    const localOffset = buf.readUInt32LE(pos + 42);
    const name = buf.toString("utf8", pos + 46, pos + 46 + nameLength);
    const dataStart = localOffset + 30 + nameLength;
    files[name] = inflateRawSync(buf.subarray(dataStart, dataStart + packedSize)).toString("utf8");
    pos += 46 + nameLength;
  }
  return files;
};

describe("buildXlsx", () => {
  const file = buildXlsx({
    sheetName: "25m Women",
    columns: [{ header: "Discipline", width: 20 }, { header: "Time" }, { header: "Athlete" }],
    rows: [["50m Freestyle", "0:26.34", "Богдановска <A&B>"]],
  });
  const parts = unzip(file);

  it("contains the parts Excel needs", () => {
    expect(Object.keys(parts)).toEqual([
      "[Content_Types].xml",
      "_rels/.rels",
      "xl/workbook.xml",
      "xl/_rels/workbook.xml.rels",
      "xl/styles.xml",
      "xl/worksheets/sheet1.xml",
    ]);
    expect(parts["xl/workbook.xml"]).toContain('name="25m Women"');
  });

  it("writes a header row and text cells, escaping XML", () => {
    const sheet = parts["xl/worksheets/sheet1.xml"];
    expect(sheet).toContain('<c r="A1" t="inlineStr" s="1"><is><t xml:space="preserve">Discipline</t>');
    expect(sheet).toContain('<c r="B2" t="inlineStr"><is><t xml:space="preserve">0:26.34</t>');
    expect(sheet).toContain("Богдановска &lt;A&amp;B&gt;");
  });
});
