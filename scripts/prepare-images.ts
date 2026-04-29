/**
 * Forbered bilder: kopier logo og kropp salong-bildet i flere ikke-menneskelige
 * detalj-bilder for galleri og hero.
 * Kjøres én gang manuelt: `npx tsx scripts/prepare-images.ts`
 */
import sharp from "sharp";
import { mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..");
const LOGO = join(ROOT, "Gemini_Generated_Image_e7prlne7prlne7pr.png");

const PUBLIC = join(__dirname, "..", "public");
const GALLERY = join(PUBLIC, "gallery");

async function main() {
  mkdirSync(GALLERY, { recursive: true });

  // Logo som-er — full kopi for header/favicon
  copyFileSync(LOGO, join(PUBLIC, "logo.png"));
  console.log("✓ logo.png");

  const meta = await sharp(LOGO).metadata();
  const W = meta.width ?? 2816;
  const H = meta.height ?? 1536;

  // Kvadratisk logo-kort for OG/social
  await sharp(LOGO)
    .resize(800, 800, { fit: "cover", position: "center" })
    .png()
    .toFile(join(PUBLIC, "logo-square.png"));
  console.log("✓ logo-square.png");

  // === HERO ===
  // Høyre tredjedel: dyp salong-utsikt med stol og runde speil. Ingen person.
  const heroLeft = Math.floor(W * 0.62);
  await sharp(LOGO)
    .extract({ left: heroLeft, top: 0, width: W - heroLeft, height: H })
    .jpeg({ quality: 92 })
    .toFile(join(PUBLIC, "hero.jpg"));
  console.log("✓ hero.jpg (salong-detalj — ingen person)");

  // === GALLERI: 4 detalj-crops fra salong-interiøret ===
  // Salongsbildet ligger på venstre/høyre side av logo-papiret.
  // Vi kropper ulike detaljer som ikke viser mennesker.

  // 1. Venstre side: glass-flasker og produkter på hyllen
  const leftPanelW = Math.floor(W * 0.16);
  await sharp(LOGO)
    .extract({
      left: 0,
      top: Math.floor(H * 0.25),
      width: leftPanelW,
      height: Math.floor(H * 0.6),
    })
    .resize(900, 1200, { fit: "cover", position: "center" })
    .jpeg({ quality: 90 })
    .toFile(join(GALLERY, "1.jpg"));
  console.log("✓ gallery/1.jpg (produkter)");

  // 2. Høyre side topp: speil-rammen, dyp og atmosfærisk
  const mirrorLeft = Math.floor(W * 0.66);
  await sharp(LOGO)
    .extract({
      left: mirrorLeft,
      top: 0,
      width: Math.floor(W * 0.25),
      height: Math.floor(H * 0.55),
    })
    .resize(900, 1200, { fit: "cover", position: "center" })
    .jpeg({ quality: 90 })
    .toFile(join(GALLERY, "2.jpg"));
  console.log("✓ gallery/2.jpg (speil)");

  // 3. Høyre side bunn: skinnstolen
  await sharp(LOGO)
    .extract({
      left: Math.floor(W * 0.78),
      top: Math.floor(H * 0.45),
      width: Math.floor(W * 0.2),
      height: Math.floor(H * 0.55),
    })
    .resize(900, 1200, { fit: "cover", position: "center" })
    .jpeg({ quality: 90 })
    .toFile(join(GALLERY, "3.jpg"));
  console.log("✓ gallery/3.jpg (stol)");

  // 4. Logoen selv som papir-detaljbilde
  await sharp(LOGO)
    .extract({
      left: Math.floor(W * 0.18),
      top: Math.floor(H * 0.1),
      width: Math.floor(W * 0.4),
      height: Math.floor(H * 0.85),
    })
    .resize(900, 1200, { fit: "cover", position: "center" })
    .jpeg({ quality: 92 })
    .toFile(join(GALLERY, "4.jpg"));
  console.log("✓ gallery/4.jpg (logo-papir)");

  // Atmosfære-bilde til paralax/midtbåndet
  await sharp(LOGO)
    .extract({
      left: 0,
      top: Math.floor(H * 0.2),
      width: Math.floor(W * 0.18),
      height: Math.floor(H * 0.7),
    })
    .resize(1200, 800, { fit: "cover", position: "center" })
    .jpeg({ quality: 90 })
    .toFile(join(PUBLIC, "atmosphere.jpg"));
  console.log("✓ atmosphere.jpg");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
