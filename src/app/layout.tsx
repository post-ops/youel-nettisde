import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { BUSINESS } from "@/lib/config";
import { auth } from "@/lib/auth";
import { EditModeProvider } from "@/components/edit/EditModeProvider";
import { EditModeBar } from "@/components/edit/EditModeBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : new URL("https://molatfrisor.no"),
  title: {
    default: `${BUSINESS.name} — Bestill time på nett`,
    template: `%s · ${BUSINESS.name}`,
  },
  description: `${BUSINESS.tagline} Bestill din herreklipp på et øyeblikk hos ${BUSINESS.name}.`,
  openGraph: {
    title: `${BUSINESS.name} — Bestill time på nett`,
    description: BUSINESS.tagline,
    type: "website",
    locale: "nb_NO",
    siteName: BUSINESS.name,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${BUSINESS.name} — logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.name} — Bestill time på nett`,
    description: BUSINESS.tagline,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const isAdmin = !!session?.user;
  return (
    <html
      lang="nb"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <EditModeProvider isAdmin={isAdmin}>
          {children}
          <EditModeBar />
        </EditModeProvider>
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            style: {
              background: "#0c1f18",
              color: "#ecf3ec",
              border: "1px solid #1d3a2a",
            },
          }}
        />
      </body>
    </html>
  );
}
