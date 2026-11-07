import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync, writeFileSync } from 'node:fs';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(rootDir, 'public');

// Sumber logo utama dari foto asli Gia's Patisserie
const srcWhatsApp = join(rootDir, 'WhatsApp Image 2026-11-06 at 21.01.10.jpeg');
const srcFallback = join(publicDir, 'logo-giaa.png');
const src = existsSync(srcWhatsApp) ? srcWhatsApp : srcFallback;

console.log('Menggunakan sumber logo:', src);

// Lingkaran stiker Gia's Patisserie di foto asli terletak persis di koordinat:
// left: 114, top: 114, size: 850x850 (diameter 850px, tanpa drop shadow abu-abu).
const croppedSticker = await sharp(src)
  .extract({ left: 114, top: 114, width: 850, height: 850 })
  .resize(512, 512)
  .toBuffer();

// Masking alpha lingkaran halus (anti-aliased) agar sudut transparan sempurna
const circleMask512 = Buffer.from(
  '<svg width="512" height="512"><circle cx="256" cy="256" r="255" fill="#fff"/></svg>'
);

// 1. Buat logo-giaa.png 512x512 berlatar transparan murni di luar lingkaran
const cleanRoundLogoBuffer = await sharp(croppedSticker)
  .composite([{ input: circleMask512, blend: 'dest-in' }])
  .png()
  .toBuffer();

await sharp(cleanRoundLogoBuffer)
  .toFile(join(publicDir, 'logo-giaa.png'));
console.log('✔ public/logo-giaa.png (512x512, clean circle) dibuat');

// 2. Favicon PNG (tab browser, pencarian Google, bookmark)
await sharp(cleanRoundLogoBuffer)
  .resize(32, 32)
  .png()
  .toFile(join(publicDir, 'favicon-32x32.png'));

await sharp(cleanRoundLogoBuffer)
  .resize(16, 16)
  .png()
  .toFile(join(publicDir, 'favicon-16x16.png'));

await sharp(cleanRoundLogoBuffer)
  .resize(48, 48)
  .png()
  .toFile(join(publicDir, 'favicon-48x48.png'));

// Favicon .ico standar
await sharp(cleanRoundLogoBuffer)
  .resize(32, 32)
  .toFile(join(publicDir, 'favicon.ico'));

console.log('✔ Favicon (32x32, 16x16, 48x48, .ico) dibuat');

// 3. Apple Touch Icon (180x180) untuk iOS Safari Home Screen
// iOS memotong squircle secara otomatis. Lingkaran logo di atas latar putih bersih
// dengan safe margin sedikit (156px) agar lingkaran logo pas di dalam squircle.
const appleLogo = await sharp(cleanRoundLogoBuffer)
  .resize(156, 156, { fit: 'contain' })
  .toBuffer();

await sharp({
  create: {
    width: 180,
    height: 180,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: appleLogo, gravity: 'centre' }])
  .png()
  .toFile(join(publicDir, 'apple-touch-icon.png'));
console.log('✔ public/apple-touch-icon.png (180x180) dibuat');

// 4. PWA Standard Icons (pwa-192.png & pwa-512.png)
const pwa192Logo = await sharp(cleanRoundLogoBuffer)
  .resize(164, 164, { fit: 'contain' })
  .toBuffer();

await sharp({
  create: {
    width: 192,
    height: 192,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: pwa192Logo, gravity: 'centre' }])
  .png()
  .toFile(join(publicDir, 'pwa-192.png'));

const pwa512Logo = await sharp(cleanRoundLogoBuffer)
  .resize(440, 440, { fit: 'contain' })
  .toBuffer();

await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: pwa512Logo, gravity: 'centre' }])
  .png()
  .toFile(join(publicDir, 'pwa-512.png'));

console.log('✔ public/pwa-192.png & pwa-512.png dibuat');

// 5. Maskable Icon (512x512)
// Safe-area adalah lingkaran tengah 80% (diameter ~400px).
const maskableLogo = await sharp(cleanRoundLogoBuffer)
  .resize(400, 400, { fit: 'contain' })
  .toBuffer();

await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: maskableLogo, gravity: 'centre' }])
  .png()
  .toFile(join(publicDir, 'maskable-512.png'));
console.log('✔ public/maskable-512.png dibuat');

// 6. SVG Icons dengan embedded PNG base64
const base64Png = cleanRoundLogoBuffer.toString('base64');
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="Gia's Patisserie">
  <image href="data:image/png;base64,${base64Png}" width="512" height="512" />
</svg>
`;
writeFileSync(join(publicDir, 'icon.svg'), svgIcon, 'utf-8');
writeFileSync(join(publicDir, 'icon-maskable.svg'), svgIcon, 'utf-8');
console.log('✔ public/icon.svg & icon-maskable.svg diperbarui');

console.log('Semua ikon berhasil digenerate ulang!');
