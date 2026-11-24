// news-image-20261124 — "The World in One Image"
// -------------------------------------------------------
// A single 1024x1024 PNG that sums up Tuesday 24 November 2026,
// drawn from scratch with the Node standard library only (no
// network, no fonts, no image libraries): a hand-rolled PNG
// encoder, a tiny 5x7 bitmap font, and a newspaper front page
// layout — masthead, one hero story, four strip stories.
//
// Stories (verified against Reuters / AP reporting of 23 Nov 2026,
// the latest wire copy available when this ran at 00:08 UTC on 24 Nov):
//   1. Nvidia reinstates Jensen Huang as CEO; shares jump 31%,
//      Nasdaq-100 set for a $2 trillion surge.
//   2. Russia says Estonia's border closure is on the verge of
//      triggering open war.
//   3. Ukrainian sea drones sink the Russian corvette Merkury off
//      Benghazi, Libya; cargo ship Angara also hit.
//   4. Factory fire in Banten, Indonesia kills 24; ~30 missing.
//   5. COP31 ends without a climate deal.
//
// The program is deterministic: fixed strings, no clock, no random
// numbers, zlib level 9 — two runs write byte-identical files.
// Output: $MAKEFUN_OUTPUT_DIR/entry.png (default /output/entry.png).
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------- tiny 5x7 bitmap font ----------
// Each glyph is 7 rows of 5 bits ("1" = ink). Space is blank.
// Only the characters used by this page are defined; anything else
// renders as a blank so a typo can never print garbage.
const FONT: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  ';': ['00000', '01100', '01100', '00000', '01100', '00100', '01000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  $: ['00100', '01111', '10100', '01110', '00101', '11110', '00100'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '"': ['01010', '01010', '01010', '00000', '00000', '00000', '00000'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'],
};

// ---------- palette ----------
type RGB = [number, number, number];
const PAPER: RGB = [246, 241, 229];
const NAVY: RGB = [22, 35, 63];
const AMBER: RGB = [232, 163, 61];
const INK: RGB = [26, 26, 26];
const GREY: RGB = [90, 90, 90];
const WHITE: RGB = [255, 255, 255];
const BORDER: RGB = [216, 210, 192];
const GREEN: RGB = [14, 122, 61];
const GREEN_LT: RGB = [46, 160, 96];
const RED: RGB = [180, 35, 24];
const SEA: RGB = [29, 78, 137];
const ORANGE: RGB = [217, 72, 15];
const TEAL: RGB = [11, 114, 133];

// ---------- raster canvas ----------
class Canvas {
  readonly w: number;
  readonly h: number;
  readonly px: Uint8Array;
  constructor(w: number, h: number, bg: RGB) {
    this.w = w;
    this.h = h;
    this.px = new Uint8Array(w * h * 3);
    this.fillRect(0, 0, w, h, bg);
  }
  set(x: number, y: number, c: RGB): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 3;
    this.px[i] = c[0];
    this.px[i + 1] = c[1];
    this.px[i + 2] = c[2];
  }
  fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
    const x0 = Math.max(0, x);
    const y0 = Math.max(0, y);
    const x1 = Math.min(this.w, x + w);
    const y1 = Math.min(this.h, y + h);
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) this.set(xx, yy, c);
    }
  }
  border(x: number, y: number, w: number, h: number, t: number, c: RGB): void {
    this.fillRect(x, y, w, t, c);
    this.fillRect(x, y + h - t, w, t, c);
    this.fillRect(x, y, t, h, c);
    this.fillRect(x + w - t, y, t, h, c);
  }
  disc(cx: number, cy: number, r: number, c: RGB): void {
    for (let dy = -r; dy <= r; dy++) {
      const span = Math.floor(Math.sqrt(r * r - dy * dy));
      for (let dx = -span; dx <= span; dx++) this.set(cx + dx, cy + dy, c);
    }
  }
  hline(x0: number, x1: number, y: number, t: number, c: RGB): void {
    this.fillRect(Math.min(x0, x1), y, Math.abs(x1 - x0) + 1, t, c);
  }
  vline(x: number, y0: number, y1: number, t: number, c: RGB): void {
    this.fillRect(x, Math.min(y0, y1), t, Math.abs(y1 - y0) + 1, c);
  }
  // Bresenham line, any slope.
  line(x0: number, y0: number, x1: number, y1: number, t: number, c: RGB): void {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    for (;;) {
      this.fillRect(x - Math.floor(t / 2), y - Math.floor(t / 2), t, t, c);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }
  textWidth(s: string, scale: number): number {
    return s.length === 0 ? 0 : s.length * 6 * scale - scale;
  }
  text(s: string, x: number, y: number, scale: number, c: RGB): void {
    let cx = x;
    for (const ch of s) {
      const g = FONT[ch];
      if (g) {
        for (let r = 0; r < 7; r++) {
          for (let col = 0; col < 5; col++) {
            if (g[r][col] === '1') {
              this.fillRect(cx + col * scale, y + r * scale, scale, scale, c);
            }
          }
        }
      }
      cx += 6 * scale;
    }
  }
  textCentred(s: string, cx: number, y: number, scale: number, c: RGB): void {
    this.text(s, cx - Math.floor(this.textWidth(s, scale) / 2), y, scale, c);
  }
}

// ---------- PNG encoder (RGB, 8-bit, filter 0) ----------
const CRC_TABLE: Uint32Array = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}

function encodePNG(cv: Canvas): Buffer {
  const raw = Buffer.alloc(cv.h * (1 + cv.w * 3));
  for (let y = 0; y < cv.h; y++) {
    raw[y * (1 + cv.w * 3)] = 0; // filter: none
    Buffer.from(cv.px.buffer, y * cv.w * 3, cv.w * 3).copy(
      raw,
      y * (1 + cv.w * 3) + 1,
    );
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(cv.w, 0);
  ihdr.writeUInt32BE(cv.h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- story icons (simple flat pictograms) ----------
function iconChip(cv: Canvas, x: number, y: number): void {
  // Microchip: body, pins on all four sides, die, "NVDA" label.
  const bx = x + 10;
  const by = y + 20;
  const bw = 140;
  const bh = 100;
  for (let i = 0; i < 4; i++) {
    cv.fillRect(bx + 18 + i * 32, by - 12, 12, 12, GREEN);
    cv.fillRect(bx + 18 + i * 32, by + bh, 12, 12, GREEN);
    cv.fillRect(bx - 12, by + 16 + i * 24, 12, 12, GREEN);
    cv.fillRect(bx + bw, by + 16 + i * 24, 12, 12, GREEN);
  }
  cv.fillRect(bx, by, bw, bh, GREEN);
  cv.fillRect(bx + 30, by + 25, bw - 60, bh - 50, GREEN_LT);
  cv.border(bx + 30, by + 25, bw - 60, bh - 50, 3, WHITE);
  cv.textCentred('NVDA', bx + bw / 2, by + 42, 3, WHITE);
  cv.textCentred('NASDAQ: NVDA', x + 80, y + 136, 2, GREY);
}

function iconWarning(cv: Canvas, x: number, y: number, c: RGB): void {
  // Warning triangle with an exclamation mark.
  const cx = x + 40;
  cv.line(cx, y + 6, cx - 34, y + 70, 5, c);
  cv.line(cx, y + 6, cx + 34, y + 70, 5, c);
  cv.hline(cx - 34, cx + 34, y + 70, 5, c);
  cv.vline(cx, y + 26, y + 48, 6, c);
  cv.disc(cx, y + 60, 4, c);
}

function iconShip(cv: Canvas, x: number, y: number, c: RGB): void {
  // Warship silhouette on waves.
  cv.fillRect(x + 8, y + 34, 64, 18, c); // hull
  cv.line(x + 8, y + 34, x + 2, y + 52, 4, c); // bow
  cv.line(x + 72, y + 34, x + 78, y + 52, 4, c); // stern
  cv.fillRect(x + 34, y + 14, 6, 20, c); // mast
  cv.fillRect(x + 40, y + 18, 16, 6, c); // radar bar
  cv.fillRect(x + 18, y + 26, 10, 8, c); // bridge
  for (let i = 0; i < 3; i++) {
    cv.hline(x + 4 + i * 6, x + 74 - i * 6, y + 62 + i * 7, 4, c);
  }
}

function iconFlame(cv: Canvas, x: number, y: number): void {
  // Flame: outer orange teardrop, inner yellow core.
  const cx = x + 40;
  cv.disc(cx, y + 46, 24, ORANGE);
  cv.disc(cx - 12, y + 40, 14, ORANGE);
  cv.disc(cx + 12, y + 40, 14, ORANGE);
  cv.line(cx, y + 4, cx - 16, y + 40, 6, ORANGE);
  cv.line(cx, y + 4, cx + 16, y + 40, 6, ORANGE);
  cv.disc(cx, y + 54, 12, AMBER);
  cv.disc(cx, y + 46, 7, [255, 235, 150]);
}

function iconGlobe(cv: Canvas, x: number, y: number, c: RGB): void {
  // Globe: outer ring, equator, two parallels, three meridian
  // ellipses. Each meridian is the left and right arc of an ellipse
  // with horizontal radius rx, drawn by scanning rows.
  const cx = x + 40;
  const cy = y + 40;
  const drawEllipseArc = (rx: number, ry: number): void => {
    for (let dy = -ry; dy <= ry; dy++) {
      const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
      cv.set(cx - w, cy + dy, c);
      cv.set(cx + w, cy + dy, c);
    }
  };
  cv.disc(cx, cy, 32, c); // outer ring
  cv.disc(cx, cy, 29, PAPER); // paper face
  cv.hline(cx - 29, cx + 29, cy, 3, c); // equator
  cv.hline(cx - 22, cx + 22, cy - 16, 3, c); // parallels
  cv.hline(cx - 22, cx + 22, cy + 16, 3, c);
  cv.vline(cx, cy - 29, cy + 29, 3, c); // centre meridian
  drawEllipseArc(14, 29); // inner meridians
  drawEllipseArc(25, 29); // outer meridians
}

// ---------- the front page ----------
function drawPage(): Canvas {
  const cv = new Canvas(1024, 1024, PAPER);

  // Masthead.
  cv.fillRect(0, 0, 1024, 128, NAVY);
  cv.textCentred('THE WORLD IN ONE IMAGE', 512, 24, 6, WHITE);
  cv.textCentred('TUESDAY 24 NOVEMBER 2026', 512, 88, 3, AMBER);
  cv.fillRect(0, 128, 1024, 6, AMBER);

  // Hero story: Nvidia.
  const hx = 28;
  const hy = 150;
  const hw = 968;
  const hh = 302;
  cv.fillRect(hx, hy, hw, hh, WHITE);
  cv.border(hx, hy, hw, hh, 3, NAVY);
  cv.fillRect(hx, hy, hw, 8, GREEN);
  iconChip(cv, hx + 20, hy + 62);
  cv.text('MARKETS - TECH', hx + 292, hy + 22, 2, GREEN);
  cv.text('HUANG IS BACK', hx + 292, hy + 52, 6, NAVY);
  cv.text('AT NVIDIA', hx + 292, hy + 104, 6, NAVY);
  cv.text('BOARD REINSTATES CHIEF EXECUTIVE', hx + 292, hy + 172, 3, INK);
  cv.text('AFTER 11 DAYS OUT; SHARES JUMP 31%', hx + 292, hy + 204, 3, INK);
  cv.text('NASDAQ-100 SET FOR $2 TRILLION SURGE', hx + 292, hy + 236, 3, INK);

  // Four strip stories.
  type Strip = {
    y: number;
    accent: RGB;
    headline: string;
    body: [string, string];
    icon: (cv: Canvas, x: number, y: number) => void;
  };
  const strips: Strip[] = [
    {
      y: 468,
      accent: RED,
      headline: 'RUSSIA WARNS ESTONIA',
      body: [
        'MOSCOW SAYS BORDER CLOSURE IS',
        'ON THE VERGE OF TRIGGERING OPEN WAR',
      ],
      icon: (c, x, y) => iconWarning(c, x, y, RED),
    },
    {
      y: 592,
      accent: SEA,
      headline: 'UKRAINE SINKS WARSHIP',
      body: [
        'SEA DRONES SINK RUSSIAN CORVETTE MERKURY',
        'OFF LIBYA; CARGO SHIP ANGARA ALSO HIT',
      ],
      icon: (c, x, y) => iconShip(c, x, y, SEA),
    },
    {
      y: 716,
      accent: ORANGE,
      headline: 'FACTORY FIRE KILLS 24',
      body: [
        'BLAZE AT CANDY PLANT IN BANTEN, INDONESIA;',
        'ABOUT 30 WORKERS STILL MISSING',
      ],
      icon: (c, x, y) => iconFlame(c, x, y),
    },
    {
      y: 840,
      accent: TEAL,
      headline: 'COP31 ENDS WITHOUT A DEAL',
      body: [
        'NEARLY 200 NATIONS FAIL TO AGREE',
        'ON FOSSIL-FUEL PHASE-OUT LANGUAGE',
      ],
      icon: (c, x, y) => iconGlobe(c, x, y, TEAL),
    },
  ];
  for (const s of strips) {
    cv.fillRect(hx, s.y, hw, 112, WHITE);
    cv.border(hx, s.y, hw, 112, 2, BORDER);
    cv.fillRect(hx, s.y, 10, 112, s.accent);
    s.icon(cv, hx + 24, s.y + 16);
    cv.text(s.headline, hx + 124, s.y + 16, 4, NAVY);
    cv.text(s.body[0], hx + 124, s.y + 58, 3, INK);
    cv.text(s.body[1], hx + 124, s.y + 84, 3, INK);
  }

  // Footer: sources.
  cv.textCentred('SOURCES: REUTERS, AP - 23-24 NOV 2026', 512, 972, 2, GREY);
  return cv;
}

// ---------- run ----------
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const png = encodePNG(drawPage());
writeFileSync(join(outDir, 'entry.png'), png);
console.log(`wrote ${join(outDir, 'entry.png')} (${png.length} bytes, 1024x1024)`);
