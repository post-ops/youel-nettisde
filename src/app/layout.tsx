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
  },
  icons: { icon: "/icon.svg" },
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
              background: "#15171f",
              color: "#f5efe3",
              border: "1px solid #2a2d39",
            },
          }}
        />
      </body>
    </html>
  );
}
