import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const sourceDir = process.argv[2] || "/tmp/gb_r001";
const outputPath = process.argv[3] || "data/gb_r001.json";

const files = await readdirLike(sourceDir);
const shpPath = files.find((file) => extname(file).toLowerCase() === ".shp");
const dbfPath = files.find((file) => extname(file).toLowerCase() === ".dbf");

if (!shpPath || !dbfPath) {
  throw new Error(`Missing .shp/.dbf in ${sourceDir}`);
}

const shapes = parseShp(await readFile(shpPath));
const records = parseDbf(await readFile(dbfPath));
const features = shapes.map((shape, index) => {
  const record = records[index] || {};
  return {
    bbox: roundList(shape.bbox),
    rings: shape.rings.map((ring) => ring.map((point) => roundList(point))),
    centroid: roundList(shape.centroid),
    score: toNumber(record.TOT_SCR),
    subwayDistance: toNumber(record.SBW_DST),
    usageScore: toNumber(record.USG_SCR),
    policeDistance: toNumber(record.PLD_DST),
    universityDistance: toNumber(record.UNV_DST),
    policeScore: toNumber(record.PLC_SCR),
    universityScore: toNumber(record.UNV_SCR),
  };
}).filter((feature) => Number.isFinite(feature.score));

const payload = {
  id: "gb_r001",
  name: "서울특별시 청년 1인 가구를 위한 주택 입지 선정",
  crs: "EPSG:4326",
  generatedAt: new Date().toISOString(),
  sourceFile: basename(shpPath),
  fields: ["TOT_SCR", "SBW_DST", "USG_SCR", "PLD_DST", "UNV_DST", "PLC_SCR", "UNV_SCR"],
  bbox: combineBbox(features.map((feature) => feature.bbox)),
  count: features.length,
  features,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload)}\n`);
console.log(`Wrote ${features.length} gb_r001 features to ${outputPath}`);

async function readdirLike(dir) {
  const { readdir } = await import("node:fs/promises");
  return (await readdir(dir)).map((file) => join(dir, file));
}

function dirname(path) {
  const index = path.lastIndexOf("/");
  return index === -1 ? "." : path.slice(0, index);
}

function parseShp(buffer) {
  const shapes = [];
  let offset = 100;
  while (offset + 8 <= buffer.length) {
    const contentLengthBytes = buffer.readInt32BE(offset + 4) * 2;
    offset += 8;
    const end = offset + contentLengthBytes;
    const shapeType = buffer.readInt32LE(offset);
    if (shapeType === 5 || shapeType === 15) {
      const bbox = [
        buffer.readDoubleLE(offset + 4),
        buffer.readDoubleLE(offset + 12),
        buffer.readDoubleLE(offset + 20),
        buffer.readDoubleLE(offset + 28),
      ];
      const numParts = buffer.readInt32LE(offset + 36);
      const numPoints = buffer.readInt32LE(offset + 40);
      const partsOffset = offset + 44;
      const parts = Array.from({ length: numParts }, (_, index) => buffer.readInt32LE(partsOffset + index * 4));
      const pointsOffset = partsOffset + numParts * 4;
      const points = Array.from({ length: numPoints }, (_, index) => [
        buffer.readDoubleLE(pointsOffset + index * 16),
        buffer.readDoubleLE(pointsOffset + index * 16 + 8),
      ]);
      const rings = parts.map((start, index) => {
        const next = parts[index + 1] ?? points.length;
        return points.slice(start, next);
      });
      shapes.push({ bbox, rings, centroid: centroidOfRings(rings) });
    }
    offset = end;
  }
  return shapes;
}

function parseDbf(buffer) {
  const recordCount = buffer.readUInt32LE(4);
  const headerLength = buffer.readUInt16LE(8);
  const recordLength = buffer.readUInt16LE(10);
  const fields = [];
  let offset = 32;
  while (buffer[offset] !== 0x0d) {
    const name = buffer.subarray(offset, offset + 11).toString("ascii").replace(/\0.*$/, "").trim();
    const type = String.fromCharCode(buffer[offset + 11]);
    const length = buffer[offset + 16];
    fields.push({ name, type, length });
    offset += 32;
  }

  const records = [];
  for (let index = 0; index < recordCount; index += 1) {
    const start = headerLength + index * recordLength;
    if (buffer[start] === 0x2a) continue;
    let cursor = start + 1;
    const record = {};
    fields.forEach((field) => {
      const raw = buffer.subarray(cursor, cursor + field.length).toString("utf8").trim();
      record[field.name] = raw;
      cursor += field.length;
    });
    records.push(record);
  }
  return records;
}

function centroidOfRings(rings) {
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  rings.forEach((ring) => {
    ring.forEach(([x, y]) => {
      sumX += x;
      sumY += y;
      count += 1;
    });
  });
  return count ? [sumX / count, sumY / count] : [0, 0];
}

function roundList(values) {
  return values.map((value) => Number(Number(value).toFixed(7)));
}

function toNumber(value) {
  const number = Number(String(value || "").replace(/,/g, ""));
  return Number.isFinite(number) ? Number(number.toFixed(3)) : null;
}

function combineBbox(boxes) {
  return roundList([
    Math.min(...boxes.map((box) => box[0])),
    Math.min(...boxes.map((box) => box[1])),
    Math.max(...boxes.map((box) => box[2])),
    Math.max(...boxes.map((box) => box[3])),
  ]);
}
