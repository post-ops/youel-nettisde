import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { EditableText } from "@/components/edit/EditableText";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bestill time" };

export default async function BookingPage() {
  const [eyebrow, title, subtitle] = await Promise.all([
    getContent("booking.eyebrow"),
    getContent("booking.title"),
    getContent("booking.subtitle"),
  ]);

  return (
    <>
      <Header />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-8 max-w-2xl">
            <EditableText
              contentKey="booking.eyebrow"
              initial={eyebrow}
              as="div"
              className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3 inline-block"
            />
            <EditableText
              contentKey="booking.title"
              initial={title}
              as="h1"
              className="text-4xl md:text-5xl text-balance leading-tight block"
            />
            <EditableText
              contentKey="booking.subtitle"
              initial={subtitle}
              as="p"
              multiline
              className="mt-3 text-[var(--color-muted)] block"
            />
          </div>
          <BookingFlow />
        </div>
      </main>
      <Footer />
    </>
  );
}
