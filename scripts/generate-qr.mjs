#!/usr/bin/env node
/**
 * Generate print-ready QR assets for the car show platform.
 *
 * Usage: node scripts/generate-qr.mjs <base-url>
 *   e.g. node scripts/generate-qr.mjs https://tke-ea.vercel.app
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const baseArg = process.argv[2];
if (!baseArg) {
  console.error('Usage: node scripts/generate-qr.mjs <base-url>');
  console.error('  e.g. node scripts/generate-qr.mjs https://tke-ea.vercel.app');
  process.exit(1);
}

const base = baseArg.replace(/\/+$/, '');
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'qr');
fs.mkdirSync(outDir, { recursive: true });

// High error correction for print reliability; pure black/white for print contrast.
const opts = {
  errorCorrectionLevel: 'H',
  margin: 2,
  color: { dark: '#000000', light: '#FFFFFF' },
};

const targets = [
  { name: 'carshow-qr', url: `${base}/carshow` },
  { name: 'donate-qr', url: `${base}/donate` },
];

const written = [];

for (const { name, url } of targets) {
  const svgPath = path.join(outDir, `${name}.svg`);
  const pngPath = path.join(outDir, `${name}-1200.png`);

  const svg = await QRCode.toString(url, { ...opts, type: 'svg' });
  fs.writeFileSync(svgPath, svg);
  written.push({ file: svgPath, url });

  await QRCode.toFile(pngPath, url, { ...opts, type: 'png', width: 1200 });
  written.push({ file: pngPath, url });
}

console.log('Generated QR assets:');
for (const { file, url } of written) {
  console.log(`  ${path.relative(process.cwd(), file)} -> ${url}`);
}
console.log(
  'NOTE: regenerate with the final domain before sending the flyer to print — QR targets are baked into the image.'
);
