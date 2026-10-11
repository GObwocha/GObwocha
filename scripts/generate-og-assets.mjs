import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicOgDir = path.resolve(rootDir, 'public', 'og');
const projectsOgDir = path.resolve(publicOgDir, 'projects');

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_BYTES = 300 * 1024; // 300 KB release gate

const COLORS = {
  obsidian: [10, 10, 9], // #0A0A09
  charcoal: [18, 18, 16], // #121210
  surface: [26, 26, 23], // #1A1A17
  border: [38, 37, 34], // #262522
  borderStrong: [62, 60, 55], // #3E3C37
  alabaster: [245, 243, 239], // #F5F3EF
  stone: [166, 162, 154], // #A6A29A
  ash: [110, 106, 99], // #6E6A63
  vermilion: [255, 77, 28], // #FF4D1C
  amber: [226, 160, 63], // #E2A03F
  emerald: [40, 199, 128], // #28C780
};

// 5x7 bitmap glyphs for crisp architectural headlines and telemetry labels
const GLYPHS = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10011', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
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
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['10010', '10010', '10010', '11111', '00010', '00010', '00010'],
  5: ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  6: ['01111', '10000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00001', '11110'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '00110', '00100', '01000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  '/': ['00001', '00010', '00100', '00100', '01000', '10000', '00000'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '~': ['00000', '00000', '01101', '10010', '00000', '00000', '00000'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgbPixels) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 2; // Color type 2: Truecolor RGB
  ihdr[10] = 0; // Compression: Deflate
  ihdr[11] = 0; // Filter: Standard
  ihdr[12] = 0; // Interlace: None

  const rowStride = width * 3;
  const rawScanlines = Buffer.alloc((rowStride + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const outRowStart = y * (rowStride + 1);
    rawScanlines[outRowStart] = 0; // Filter type 0 (None)
    const srcStart = y * rowStride;
    rgbPixels.copy(rawScanlines, outRowStart + 1, srcStart, srcStart + rowStride);
  }

  const compressedIdat = zlib.deflateSync(rawScanlines, { level: 9 });

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressedIdat),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function fillRect(pixels, x0, y0, w, h, color) {
  const xStart = Math.max(0, Math.floor(x0));
  const yStart = Math.max(0, Math.floor(y0));
  const xEnd = Math.min(WIDTH, Math.floor(x0 + w));
  const yEnd = Math.min(HEIGHT, Math.floor(y0 + h));

  const [r, g, b] = color;
  for (let y = yStart; y < yEnd; y += 1) {
    let idx = (y * WIDTH + xStart) * 3;
    for (let x = xStart; x < xEnd; x += 1) {
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      idx += 3;
    }
  }
}

function strokeRect(pixels, x, y, w, h, thickness, color) {
  fillRect(pixels, x, y, w, thickness, color);
  fillRect(pixels, x, y + h - thickness, w, thickness, color);
  fillRect(pixels, x, y, thickness, h, color);
  fillRect(pixels, x + w - thickness, y, thickness, h, color);
}

function drawText(pixels, text, x, y, scale, color, letterSpacing = 1) {
  const upper = text.toUpperCase();
  let cursorX = x;
  for (let i = 0; i < upper.length; i += 1) {
    const ch = upper[i];
    const glyph = GLYPHS[ch] ?? GLYPHS[' '];
    for (let row = 0; row < 7; row += 1) {
      const bits = glyph[row];
      for (let col = 0; col < 5; col += 1) {
        if (bits[col] === '1') {
          fillRect(pixels, cursorX + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursorX += (5 + letterSpacing) * scale;
  }
}

function drawCardMotif(pixels, variant, primaryAccent) {
  const panelX = 768;
  const panelY = 148;
  const panelW = 344;
  const panelH = 320;

  fillRect(pixels, panelX, panelY, panelW, panelH, COLORS.obsidian);
  strokeRect(pixels, panelX, panelY, panelW, panelH, 2, COLORS.borderStrong);

  // Subtle internal grid inside motif panel
  for (let gx = panelX + 34; gx < panelX + panelW; gx += 34) {
    fillRect(pixels, gx, panelY + 2, 1, panelH - 4, COLORS.surface);
  }
  for (let gy = panelY + 32; gy < panelY + panelH; gy += 32) {
    fillRect(pixels, panelX + 2, gy, panelW - 4, 1, COLORS.surface);
  }

  if (variant === 'default') {
    fillRect(pixels, panelX + 40, panelY + 42, 264, 24, COLORS.vermilion);
    fillRect(pixels, panelX + 40, panelY + 84, 190, 18, COLORS.alabaster);
    fillRect(pixels, panelX + 40, panelY + 118, 224, 14, COLORS.stone);
    strokeRect(pixels, panelX + 40, panelY + 158, 264, 120, 2, COLORS.amber);
    fillRect(pixels, panelX + 64, panelY + 182, 84, 72, COLORS.vermilion);
    fillRect(pixels, panelX + 168, panelY + 182, 112, 30, COLORS.emerald);
    fillRect(pixels, panelX + 168, panelY + 224, 112, 30, COLORS.borderStrong);
  } else if (variant === 'halisi-app') {
    strokeRect(pixels, panelX + 48, panelY + 36, 248, 248, 3, primaryAccent);
    fillRect(pixels, panelX + 76, panelY + 64, 76, 76, COLORS.vermilion);
    fillRect(pixels, panelX + 172, panelY + 64, 96, 32, COLORS.emerald);
    fillRect(pixels, panelX + 172, panelY + 108, 96, 32, COLORS.amber);
    fillRect(pixels, panelX + 76, panelY + 164, 192, 18, COLORS.alabaster);
    fillRect(pixels, panelX + 76, panelY + 196, 148, 18, COLORS.stone);
    fillRect(pixels, panelX + 76, panelY + 228, 192, 28, COLORS.emerald);
  } else if (variant === 'greenroute') {
    fillRect(pixels, panelX + 56, panelY + 236, 140, 8, COLORS.emerald);
    fillRect(pixels, panelX + 188, panelY + 124, 8, 120, COLORS.emerald);
    fillRect(pixels, panelX + 188, panelY + 124, 96, 8, COLORS.emerald);
    fillRect(pixels, panelX + 56, panelY + 80, 220, 6, COLORS.vermilion);
    fillRect(pixels, panelX + 44, panelY + 224, 32, 32, COLORS.alabaster);
    fillRect(pixels, panelX + 176, panelY + 112, 32, 32, COLORS.emerald);
    fillRect(pixels, panelX + 268, panelY + 112, 32, 32, COLORS.amber);
  } else if (variant === 'kula-kwa-macho') {
    fillRect(pixels, panelX + 42, panelY + 40, 122, 108, COLORS.vermilion);
    fillRect(pixels, panelX + 180, panelY + 40, 122, 108, COLORS.amber);
    fillRect(pixels, panelX + 42, panelY + 166, 260, 52, COLORS.surface);
    strokeRect(pixels, panelX + 42, panelY + 166, 260, 52, 2, COLORS.alabaster);
    fillRect(pixels, panelX + 42, panelY + 236, 184, 44, COLORS.emerald);
  } else if (variant === 'somastar') {
    fillRect(pixels, panelX + 52, panelY + 196, 36, 84, COLORS.stone);
    fillRect(pixels, panelX + 108, panelY + 152, 36, 128, COLORS.amber);
    fillRect(pixels, panelX + 164, panelY + 108, 36, 172, COLORS.vermilion);
    fillRect(pixels, panelX + 220, panelY + 60, 36, 220, COLORS.emerald);
    fillRect(pixels, panelX + 36, panelY + 280, 272, 4, COLORS.alabaster);
  } else if (variant === 'geliscope') {
    const tiers = 6;
    for (let t = 0; t < tiers; t += 1) {
      const w = 252 - t * 32;
      const x = panelX + 46 + t * 16;
      const y = panelY + 248 - t * 36;
      const col = t === tiers - 1 ? COLORS.vermilion : t % 2 === 0 ? COLORS.amber : COLORS.emerald;
      fillRect(pixels, x, y, w, 24, col);
    }
  } else if (variant === 'email-analyzer') {
    for (let row = 0; row < 4; row += 1) {
      const y = panelY + 42 + row * 62;
      fillRect(pixels, panelX + 44, y, 24, 40, row === 0 ? COLORS.vermilion : COLORS.emerald);
      fillRect(pixels, panelX + 80, y, 220, 40, COLORS.surface);
      strokeRect(pixels, panelX + 80, y, 220, 40, 2, COLORS.borderStrong);
      fillRect(pixels, panelX + 96, y + 14, 144 - row * 20, 12, COLORS.alabaster);
    }
  } else if (variant === 'ole-ken-hotel') {
    fillRect(pixels, panelX + 44, panelY + 42, 256, 40, COLORS.amber);
    fillRect(pixels, panelX + 44, panelY + 100, 74, 172, COLORS.surface);
    strokeRect(pixels, panelX + 44, panelY + 100, 74, 172, 2, COLORS.amber);
    fillRect(pixels, panelX + 135, panelY + 100, 74, 172, COLORS.surface);
    strokeRect(pixels, panelX + 135, panelY + 100, 74, 172, 2, COLORS.vermilion);
    fillRect(pixels, panelX + 226, panelY + 100, 74, 172, COLORS.surface);
    strokeRect(pixels, panelX + 226, panelY + 100, 74, 172, 2, COLORS.emerald);
  }
}

function renderOgCard({ eyebrow, title, subtitle, stack, variant, accent }) {
  const pixels = Buffer.alloc(WIDTH * HEIGHT * 3);

  // 1. Warm Obsidian background (#0A0A09)
  fillRect(pixels, 0, 0, WIDTH, HEIGHT, COLORS.obsidian);

  // 2. Elevated Charcoal architectural frame (#121210)
  const frameX = 48;
  const frameY = 48;
  const frameW = WIDTH - 96;
  const frameH = HEIGHT - 96;
  fillRect(pixels, frameX, frameY, frameW, frameH, COLORS.charcoal);
  strokeRect(pixels, frameX, frameY, frameW, frameH, 2, COLORS.border);

  // 3. Architectural Swiss grid hairlines
  fillRect(pixels, frameX, 128, frameW, 2, COLORS.border);
  fillRect(pixels, frameX, 488, frameW, 2, COLORS.border);
  fillRect(pixels, 736, 128, 2, 360, COLORS.border);

  // 4. Bold International Vermilion top bar + primary accent bar
  fillRect(pixels, frameX, frameY, frameW, 10, COLORS.vermilion);
  fillRect(pixels, frameX, frameY, 10, frameH, accent);

  // 5. Top telemetry bar text
  drawText(pixels, eyebrow, 88, 82, 3, accent, 1);
  drawText(pixels, '1200X630 // OG', 864, 82, 3, COLORS.stone, 1);

  // 6. Main headline & subtitle
  drawText(pixels, title, 88, 178, 6, COLORS.alabaster, 1);
  drawText(pixels, subtitle, 88, 252, 2, COLORS.stone, 1);

  // Accent divider rule
  fillRect(pixels, 88, 296, 160, 6, COLORS.vermilion);

  // Stack / domain pill strip
  fillRect(pixels, 88, 332, 608, 52, COLORS.surface);
  strokeRect(pixels, 88, 332, 608, 52, 2, COLORS.borderStrong);
  drawText(pixels, stack, 108, 351, 2, COLORS.alabaster, 1);

  // Owner signature in main chamber
  drawText(pixels, 'GEOFFREY OBWOCHA // NAIROBI, KENYA', 88, 424, 2, COLORS.amber, 1);

  // 7. Right-hand geometric motif
  drawCardMotif(pixels, variant, accent);

  // 8. Footer ledger bar
  drawText(pixels, 'GOBWOCHA.VERCEL.APP', 88, 524, 3, COLORS.alabaster, 1);
  drawText(pixels, 'SYSTEMS ARCHITECT & FULL-STACK ENGINEER', 520, 528, 2, COLORS.stone, 1);

  return encodePng(WIDTH, HEIGHT, pixels);
}

const OG_ASSETS = [
  {
    outputPath: path.join(publicOgDir, 'default.png'),
    eyebrow: 'PORTFOLIO // NAIROBI, KENYA (EAT)',
    title: 'GEOFFREY OBWOCHA',
    subtitle: 'SYSTEMS ARCHITECT & FULL-STACK PRODUCT ENGINEER',
    stack: 'FASTAPI / SUPABASE PGVECTOR / NEXT.JS / REACT 19',
    variant: 'default',
    accent: COLORS.vermilion,
  },
  {
    outputPath: path.join(projectsOgDir, 'halisi-app.png'),
    eyebrow: 'CASE STUDY 01 // CYBERSECURITY & AI',
    title: 'HALISI',
    subtitle: 'AI BRAND IMPERSONATION & M-PESA FRAUD DETECTION',
    stack: 'FASTAPI / SUPABASE PGVECTOR / CLIP / LLAMA 3.1 8B',
    variant: 'halisi-app',
    accent: COLORS.vermilion,
  },
  {
    outputPath: path.join(projectsOgDir, 'greenroute.png'),
    eyebrow: 'CASE STUDY 02 // GEOSPATIAL & CLIMATE',
    title: 'GREENROUTE',
    subtitle: 'CARBON-AWARE ECO-ROUTING ENGINE FOR NAIROBI',
    stack: 'DJANGO / OSMNX / NETWORKX A* / TOMTOM / LEAFLET',
    variant: 'greenroute',
    accent: COLORS.emerald,
  },
  {
    outputPath: path.join(projectsOgDir, 'kula-kwa-macho.png'),
    eyebrow: 'CASE STUDY 03 // CONSUMER WEB PRODUCT',
    title: 'KULA-KWA-MACHO',
    subtitle: 'INTERACTIVE KENYAN CULINARY DISCOVERY PLATFORM',
    stack: 'NEXT.JS APP ROUTER / TYPESCRIPT / SUPABASE SSR',
    variant: 'kula-kwa-macho',
    accent: COLORS.amber,
  },
  {
    outputPath: path.join(projectsOgDir, 'somastar.png'),
    eyebrow: 'CASE STUDY 04 // EDTECH & ANALYTICS',
    title: 'SOMASTAR',
    subtitle: 'ADAPTIVE LEARNING & AI EXAM INTELLIGENCE PLATFORM',
    stack: 'REACT 19 / FASTAPI / SQLALCHEMY 2.0 / RECHARTS',
    variant: 'somastar',
    accent: COLORS.vermilion,
  },
  {
    outputPath: path.join(projectsOgDir, 'geliscope.png'),
    eyebrow: 'CASE STUDY 05 // MULTIMODAL AI PORTAL',
    title: 'GELISCOPE',
    subtitle: 'SOCRATIC TUTORING & RUBRIC DIAGNOSTICS PORTAL',
    stack: 'VUE 3 / VUETIFY 3 / PINIA / GOOGLE GEMINI VISION',
    variant: 'geliscope',
    accent: COLORS.amber,
  },
  {
    outputPath: path.join(projectsOgDir, 'email-analyzer.png'),
    eyebrow: 'CASE STUDY 06 // WORKFLOW AUTOMATION',
    title: 'EMAIL ANALYZER',
    subtitle: 'AUTOMATED AI ACADEMIC INBOX DIGEST PIPELINE',
    stack: 'GOOGLE APPS SCRIPT / NODE.JS / GEMINI 1.5 FLASH',
    variant: 'email-analyzer',
    accent: COLORS.emerald,
  },
  {
    outputPath: path.join(projectsOgDir, 'ole-ken-hotel.png'),
    eyebrow: 'CASE STUDY 07 // HOSPITALITY REDESIGN',
    title: 'OLE~KEN HOTEL',
    subtitle: 'CONTEMPORARY HOSPITALITY WEB & WHATSAPP BOOKING',
    stack: 'NEXT.JS 14 / TYPESCRIPT / TAILWIND / FRAMER MOTION',
    variant: 'ole-ken-hotel',
    accent: COLORS.amber,
  },
];

async function generateOgAssets() {
  await fs.mkdir(projectsOgDir, { recursive: true });

  for (const asset of OG_ASSETS) {
    const pngBuffer = renderOgCard(asset);
    if (pngBuffer.byteLength > MAX_BYTES) {
      throw new Error(
        `Generated OG image ${asset.outputPath} exceeds 300 KB budget (${pngBuffer.byteLength} bytes)`,
      );
    }
    await fs.writeFile(asset.outputPath, pngBuffer);
    const relPath = path.relative(rootDir, asset.outputPath).replace(/\\/g, '/');
    console.log(`Generated ${relPath} (${pngBuffer.byteLength} bytes, ${WIDTH}x${HEIGHT})`);
  }
}

generateOgAssets().catch((error) => {
  console.error('Failed to generate Open Graph PNG assets:', error);
  process.exit(1);
});
