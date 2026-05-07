import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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
  title: "Naéa Beauty — Prestations beauté à Nantes",
  description:
    "Réhaussement de cils, Browlift et blanchiment dentaire à Nantes. Prenez rendez-vous avec Naéa Beauty, beauté sur-mesure à domicile.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-bordeaux-950">
        {children}
      </body>
    </html>
  );
}
