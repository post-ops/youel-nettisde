import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { About } from "@/components/site/About";
import { Service } from "@/components/site/Service";
import { Gallery } from "@/components/site/Gallery";
import { CTA } from "@/components/site/CTA";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { getAllContent, getAllImages } from "@/lib/content";

export const dynamic = "force-dynamic";

const GALLERY_META = [
  { slot: "gallery-1" as const, label: "Detaljer", alt: "Logo og merkevare" },
  { slot: "gallery-2" as const, label: "Atmosfære", alt: "Klassiske runde speil" },
  { slot: "gallery-3" as const, label: "Produkter", alt: "Utvalgte produkter" },
  { slot: "gallery-4" as const, label: "Komfort", alt: "Klassisk barber-stol" },
];

export default async function HomePage() {
  const [content, images] = await Promise.all([
    getAllContent(),
    getAllImages(),
  ]);

  const galleryImages = GALLERY_META.map((g) => ({
    slot: g.slot,
    src: images[g.slot],
    alt: g.alt,
    label: g.label,
  }));

  return (
    <>
      <Header />
      <main>
        <Hero
          title={content["hero.title"]}
          tagline={content["hero.tagline"]}
          subtitle={content["hero.subtitle"]}
        />
        <Marquee />
        <About
          eyebrow={content["about.eyebrow"]}
          title={content["about.title"]}
          titleAccent={content["about.titleAccent"]}
          description={content["about.description"]}
        />
        <Service
          eyebrow={content["service.eyebrow"]}
          title={content["service.title"]}
          description={content["service.description"]}
        />
        <Gallery
          eyebrow={content["gallery.eyebrow"]}
          title={content["gallery.title"]}
          description={content["gallery.description"]}
          images={galleryImages}
        />
        <CTA
          title={content["cta.title"]}
          description={content["cta.description"]}
        />
        <Contact
          eyebrow={content["contact.eyebrow"]}
          title={content["contact.title"]}
          description={content["contact.description"]}
          phone={content["contact.phone"]}
          email={content["contact.email"]}
          address={content["contact.address"]}
        />
      </main>
      <Footer />
    </>
  );
}
