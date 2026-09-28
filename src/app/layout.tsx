import type { Metadata } from "next";
import "./globals.css";

const BESKRIVELSE =
  "Bar og konsertlokale i Kong Oscars gate 23 i Bergen. Se hva som skjer.";

export const metadata: Metadata = {
  metadataBase: new URL("https://bodega.part.no"),
  title: "Bodega — bar i Bergen",
  description: BESKRIVELSE,
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Bodega",
    description: BESKRIVELSE,
    url: "/",
    siteName: "Bodega",
    locale: "nb_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bodega",
    description: BESKRIVELSE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <head>
        <meta name="format-detection" content="telephone=no, date=no, address=no" />
      </head>
      <body>{children}</body>
    </html>
  );
}
