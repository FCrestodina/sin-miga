import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sin Miga — Restaurantes sin TACC en Buenos Aires",
  description:
    "Encontrá restaurantes, cafés y locales con opciones sin TACC y sin gluten en CABA.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
