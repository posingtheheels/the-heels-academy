/**
 * Script to generate PWA icons from the favicon.png
 * Run: node scripts/generate-icons.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const input = path.join(__dirname, '..', 'public', 'favicon.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generate() {
  for (const size of sizes) {
    const out = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(input)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(out);
    console.log(`✅ ${out}`);
  }
  console.log('Done!');
}

generate().catch(console.error);
