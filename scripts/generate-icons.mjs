import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const iconAny = readFileSync(join(publicDir, 'icon.svg'));
const iconMaskable = readFileSync(join(publicDir, 'icon-maskable.svg'));

async function render(svg, size, nama) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(join(publicDir, nama));
  console.log('tulis', nama, `${size}px`);
}

await render(iconAny, 192, 'pwa-192.png');
await render(iconAny, 512, 'pwa-512.png');
await render(iconMaskable, 512, 'maskable-512.png');
await render(iconMaskable, 180, 'apple-touch-icon.png');
console.log('selesai');
