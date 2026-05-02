import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SRC = "C:/Users/Tobia/OneDrive/Dokumenter/Youel-nettside/image1.png";
const OUT = "C:/Users/Tobia/OneDrive/Dokumenter/Youel-nettside/molat-booking/public/logo.png";

// Skanner kun et rektangel inne i logokortet — unngår iPhone-chrome,
// nedre logo-design og bunnbar.
const fullMeta = await sharp(SRC).metadata();
const SEARCH_TOP = 380;
const SEARCH_BOTTOM = 1500;
const SEARCH_LEFT = 180;
const SEARCH_RIGHT = 1110;
const SEARCH_W = SEARCH_RIGHT - SEARCH_LEFT;
const SEARCH_H = SEARCH_BOTTOM - SEARCH_TOP;

const { data, info } = await sharp(SRC)
  .extract({ left: SEARCH_LEFT, top: SEARCH_TOP, width: SEARCH_W, height: SEARCH_H })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

// Mørkest piksel-terskel — alt under denne luminosity regnes som "logo-blekk".
const DARK = 90;
let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * info.channels;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum < DARK) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
// Konverter til full bilde-koord.
minX += SEARCH_LEFT;
maxX += SEARCH_LEFT;
minY += SEARCH_TOP;
maxY += SEARCH_TOP;

// Padding rundt bounding box.
const PAD = 40;
const left = Math.max(0, minX - PAD);
const top = Math.max(0, minY - PAD);
const right = Math.min(fullMeta.width, maxX + PAD);
const bottom = Math.min(fullMeta.height, maxY + PAD);
const w = right - left;
const h = bottom - top;
console.log(`bbox: ${minX},${minY} -> ${maxX},${maxY}`);
console.log(`crop: left=${left} top=${top} w=${w} h=${h}`);

// Hent crop som RGB.
const cropped = await sharp(SRC)
  .extract({ left, top, width: w, height: h })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

// Bygg en RGBA-buffer der lys bakgrunn blir transparent og det mørke blekket
// blir hvitt — slik at logoen fungerer på mørkegrønn bakgrunn.
const px = cropped.info.width * cropped.info.height;
const out = Buffer.alloc(px * 4);
for (let i = 0; i < px; i++) {
  const r = cropped.data[i * 3];
  const g = cropped.data[i * 3 + 1];
  const b = cropped.data[i * 3 + 2];
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  // Alpha følger hvor mørk pikselen er: 0 (hvit bakgrunn) → 255 (rent svart blekk).
  // Lin map 230 (lys) → 0, 70 (mørk) → 255.
  let a;
  if (lum >= 230) a = 0;
  else if (lum <= 70) a = 255;
  else a = Math.round(((230 - lum) / (230 - 70)) * 255);
  // Selve pikselen settes hvit; alfa bærer formen.
  out[i * 4] = 255;
  out[i * 4 + 1] = 255;
  out[i * 4 + 2] = 255;
  out[i * 4 + 3] = a;
}

await sharp(out, { raw: { width: cropped.info.width, height: cropped.info.height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const finalMeta = await sharp(OUT).metadata();
console.log(`saved ${OUT} (${finalMeta.width}x${finalMeta.height})`);
