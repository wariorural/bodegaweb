import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bodega",
  description: "Bodega — Kong Oscars Gate 23",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <head>
        <meta name="format-detection" content="telephone=no, date=no, address=no" />
      </head>
      <body>{children}</body>
    </html>
  );
}
