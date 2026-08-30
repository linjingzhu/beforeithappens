import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const PAPER = [0xf8, 0xf3, 0xed];
const INK = [0x2b, 0x25, 0x21];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function pngFromPixels(width, height, paint) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = paint(x, y);
      const offset = row + 1 + x * 3;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function circleMark(size, radiusRatio = 0.28) {
  const center = (size - 1) / 2;
  const radius = size * radiusRatio;
  return pngFromPixels(size, size, (x, y) => {
    const dx = x - center;
    const dy = y - center;
    return dx * dx + dy * dy <= radius * radius ? INK : PAPER;
  });
}

function solid(size, color) {
  return pngFromPixels(size, size, () => color);
}

writeFileSync("assets/icon.png", circleMark(1024));
writeFileSync("assets/splash-icon.png", circleMark(512, 0.18));
writeFileSync("assets/android-icon-foreground.png", circleMark(432, 0.22));
writeFileSync("assets/android-icon-background.png", solid(432, PAPER));
writeFileSync("assets/android-icon-monochrome.png", circleMark(432, 0.22));
writeFileSync("assets/favicon.png", circleMark(48));
console.log("Wrote LoveMe brand assets");
