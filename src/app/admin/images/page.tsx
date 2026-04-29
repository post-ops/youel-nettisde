import { getAllImages } from "@/lib/content";
import { IMAGE_SLOTS } from "@/lib/config";
import { ImageManager } from "@/components/admin/ImageManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bilder" };

export default async function AdminImagesPage() {
  const urls = await getAllImages();
  const slots = IMAGE_SLOTS.map((s) => ({
    key: s.key,
    label: s.label,
    url: urls[s.key],
    isDefault: urls[s.key] === s.default,
  }));
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl mb-2">Bilder på forsiden</h1>
      <p className="text-[var(--color-muted)] mb-6">
        Bytt ut galleri-bildene. Last opp JPG, PNG eller WEBP (maks 8 MB). Bildene
        vises i 3:4-format på forsiden.
      </p>
      <ImageManager slots={slots} />
    </div>
  );
}
