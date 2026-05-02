import sharp from "sharp";

const LOGO = "C:/Users/Tobia/OneDrive/Dokumenter/Youel-nettside/molat-booking/public/logo.png";
const PUB = "C:/Users/Tobia/OneDrive/Dokumenter/Youel-nettside/molat-booking/public";
const APP = "C:/Users/Tobia/OneDrive/Dokumenter/Youel-nettside/molat-booking/src/app";

const BG = { r: 6, g: 20, b: 16, alpha: 1 };

async function favicon() {
  // PNG favicon (32x32) — flatet på mørkegrønn så det blir lesbart i fane.
  const buf = await sharp(LOGO)
    .resize(440, 440, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 36, bottom: 36, left: 36, right: 36, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .flatten({ background: BG })
    .resize(32, 32)
    .png()
    .toBuffer();
  // .ico er bare en PNG her — moderne nettlesere godtar PNG-favicon helt fint.
  const fs = await import("node:fs/promises");
  await fs.writeFile(`${APP}/favicon.ico`, buf);
  await sharp(LOGO)
    .resize(440, 440, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 36, bottom: 36, left: 36, right: 36, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .flatten({ background: BG })
    .resize(180, 180)
    .png()
    .toFile(`${PUB}/apple-icon.png`);
  await sharp(LOGO)
    .resize(440, 440, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 36, bottom: 36, left: 36, right: 36, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .flatten({ background: BG })
    .resize(512, 512)
    .png()
    .toFile(`${PUB}/icon-512.png`);
}

async function ogImage() {
  // 1200x630 OG/Twitter-kort — logo sentrert på mørkegrønn.
  const logoH = 360;
  const resized = await sharp(LOGO)
    .resize({ height: logoH, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const meta = await sharp(resized).metadata();
  const canvas = sharp({
    create: { width: 1200, height: 630, channels: 4, background: BG },
  });
  await canvas
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toFile(`${PUB}/og-image.png`);
  console.log(`og-image: 1200x630, logo ${meta.width}x${meta.height}`);
}

await favicon();
await ogImage();
console.log("done");
