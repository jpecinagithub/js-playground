// Generates PWA icons (public/icons/icon-192.png, icon-512.png) with zero dependencies.
import { writeFileSync, mkdirSync } from 'fs';
import { deflateSync } from 'zlib';

function crc32(buf) {
  let table = crc32.t;
  if (!table) {
    table = crc32.t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([td, data])));
  return Buffer.concat([len, td, data, crc]);
}

function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const idat = deflateSync(raw, { level: 9 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function drawIcon(size, padScale) {
  const buf = Buffer.alloc(size * size * 4);
  const px = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const o = (y * size + x) * 4;
    buf[o] = r; buf[o + 1] = g; buf[o + 2] = b; buf[o + 3] = a;
  };
  const rect = (x0, y0, x1, y1, c) => {
    for (let y = Math.max(0, y0 | 0); y < Math.min(size, y1 | 0); y++)
      for (let x = Math.max(0, x0 | 0); x < Math.min(size, x1 | 0); x++) px(x, y, ...c);
  };
  const circle = (cx, cy, r, c) => {
    for (let y = Math.max(0, (cy - r) | 0); y < Math.min(size, (cy + r) | 0); y++)
      for (let x = Math.max(0, (cx - r) | 0); x < Math.min(size, (cx + r) | 0); x++)
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) px(x, y, ...c);
  };
  const rrect = (x0, y0, x1, y1, rad, c) => {
    rect(x0 + rad, y0, x1 - rad, y1, c);
    rect(x0, y0 + rad, x1, y1 - rad, c);
    circle(x0 + rad, y0 + rad, rad, c);
    circle(x1 - rad, y0 + rad, rad, c);
    circle(x0 + rad, y1 - rad, rad, c);
    circle(x1 - rad, y1 - rad, rad, c);
  };

  const Y = [247, 223, 30];
  const D = [20, 20, 22];
  const pad = ((1 - padScale) / 2) * size;
  const s = padScale * size;
  const X = (v) => pad + v * s;
  const W = (v) => v * s;

  // yellow rounded background
  rrect(X(0.02), X(0.02), X(0.98), X(0.98), W(0.22), Y);
  // dark "screen"
  rrect(X(0.17), X(0.2), X(0.83), X(0.8), W(0.09), D);
  // window dots
  circle(X(0.245), X(0.285), W(0.028), [255, 95, 87]);
  circle(X(0.315), X(0.285), W(0.028), [254, 188, 46]);
  circle(X(0.385), X(0.285), W(0.028), [40, 200, 64]);
  // code lines
  const lines = [
    [0.245, 0.42, 0.34, [158, 206, 106]],
    [0.245, 0.51, 0.46, [122, 162, 247]],
    [0.245, 0.60, 0.28, [199, 146, 234]],
    [0.245, 0.69, 0.40, [247, 223, 30]],
  ];
  for (const [lx, ly, lw, c] of lines) rrect(X(lx), X(ly), X(lx + lw), X(ly + 0.045), W(0.022), c);

  return buf;
}

mkdirSync('public/icons', { recursive: true });
for (const size of [192, 512]) {
  const png = encodePNG(size, size, drawIcon(size, size === 512 ? 0.8 : 1));
  writeFileSync(`public/icons/icon-${size}.png`, png);
  console.log(`icon-${size}.png written (${png.length} bytes)`);
}
