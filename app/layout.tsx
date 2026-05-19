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
  title: "Soirée Villa — Des soirées pensées pour ton style social",
  description:
    "Découvre ton style social en 15 questions et rejoins des expériences animées qui te ressemblent. Lancement à Nice.",
  openGraph: {
    title: "Soirée Villa",
    description: "Pas une soirée au hasard. Une expérience où tu te sens à ta place.",
    siteName: "Soirée Villa",
    locale: "fr_FR",
    type: "website",
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
