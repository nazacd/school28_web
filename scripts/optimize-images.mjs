#!/usr/bin/env node
// Shrinks heavy photos in public/uploads (or the folder given as the first argument).
//
//   npm run optimize-images            # optimize files over the limit
//   npm run optimize-images -- --dry   # only report what would change
//
// Each JPEG/WebP that is over MAX_BYTES or wider/taller than MAX_EDGE is:
//   - rotated upright (phone EXIF orientation applied),
//   - resized so its longest side is at most MAX_EDGE,
//   - re-encoded at the highest quality that fits under MAX_BYTES,
//   - stripped of EXIF metadata (camera info and GPS location), keeping the colour profile.
// Files keep their names, so pages that use them don't need to change.

import sharp from 'sharp';
import { readdir, stat, writeFile, rename, unlink } from 'node:fs/promises';
import { join, extname } from 'node:path';

const MAX_BYTES = 1_000_000; // 1 MB
const MAX_EDGE = 2560; // px, sharp on large and high-DPI screens
const QUALITIES = [90, 88, 85, 82, 80, 78, 75, 72, 70];
const MIN_EDGE = 1280;

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const dir = args.find((a) => !a.startsWith('--')) ?? 'public/uploads';

const mb = (n) => `${(n / 1e6).toFixed(2)} MB`;

async function encode(input, format, edge, quality) {
  let img = sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true })
    .keepIccProfile();
  img = format === 'webp' ? img.webp({ quality, effort: 6 }) : img.jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:2:0' });
  return img.toBuffer({ resolveWithObject: true });
}

async function optimize(file) {
  const ext = extname(file).toLowerCase();
  const format = ext === '.webp' ? 'webp' : 'jpeg';
  const before = (await stat(file)).size;
  const meta = await sharp(file).metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
  if (before <= MAX_BYTES && longest <= MAX_EDGE) return null;

  for (let edge = Math.min(MAX_EDGE, longest); edge >= MIN_EDGE; edge = Math.round(edge * 0.85)) {
    for (const q of QUALITIES) {
      const { data, info } = await encode(file, format, edge, q);
      if (data.length <= MAX_BYTES) {
        if (!dry) {
          const tmp = `${file}.tmp`;
          await writeFile(tmp, data);
          await rename(tmp, file);
        }
        return { before, after: data.length, size: `${info.width}x${info.height}`, q };
      }
    }
  }
  throw new Error(`could not get ${file} under ${mb(MAX_BYTES)}`);
}

const files = (await readdir(dir)).filter((f) => /\.(jpe?g|webp)$/i.test(f)).sort();
let saved = 0;
for (const f of files) {
  const path = join(dir, f);
  try {
    const r = await optimize(path);
    if (!r) continue;
    saved += r.before - r.after;
    console.log(`${dry ? '[dry] ' : ''}${f}: ${mb(r.before)} -> ${mb(r.after)} (${r.size}, quality ${r.q})`);
  } catch (err) {
    console.error(`${f}: ${err.message}`);
    process.exitCode = 1;
    await unlink(`${path}.tmp`).catch(() => {});
  }
}
console.log(saved ? `Saved ${mb(saved)}.` : 'Nothing to optimize: all images are within limits.');
