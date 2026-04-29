import { getAllContent } from "@/lib/content";
import { ContentEditor } from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tekst" };

export default async function AdminContentPage() {
  const content = await getAllContent();
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl mb-2">Tekst på nettsiden</h1>
      <p className="text-[var(--color-muted)] mb-6">
        Endre overskrifter, ingresser og kontaktinfo som vises på forsiden.
      </p>
      <ContentEditor initial={content} />
    </div>
  );
}
