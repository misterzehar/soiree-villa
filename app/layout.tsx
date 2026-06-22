import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Soirée Villa — La soirée qui te ressemble existe.",
    template: "%s — Soirée Villa",
  },
  description:
    "Découvre ton style social en 15 questions. Rejoins des expériences animées pensées pour qui tu es. Comprendre · Vivre · Oser.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://soireevilla.com"),
  openGraph: {
    title: "Soirée Villa — La soirée qui te ressemble existe.",
    description: "Pas une soirée au hasard. Une expérience où tu te sens à ta place.",
    siteName: "Soirée Villa",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Soirée Villa — Comprendre · Vivre · Oser",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Soirée Villa",
    description: "La soirée qui te ressemble existe.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${inter.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
