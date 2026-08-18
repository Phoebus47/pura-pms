import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const BRAND = '#1E4B8E';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'apps/web/public/icons');

async function writeIcon(size, filename, maskable = false) {
  const inset = maskable ? Math.round(size * 0.1) : 0;
  const inner = size - inset * 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${inner}" height="${inner}" viewBox="0 0 ${inner} ${inner}">
  <rect width="${inner}" height="${inner}" rx="${Math.round(inner * 0.12)}" fill="${BRAND}"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="${Math.round(inner * 0.34)}" font-weight="700">P</text>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(join(outDir, filename));
}

await mkdir(outDir, { recursive: true });
await writeIcon(192, 'icon-192.png');
await writeIcon(512, 'icon-512.png');
await writeIcon(512, 'icon-512-maskable.png', true);
await writeIcon(180, 'apple-touch-icon.png');
