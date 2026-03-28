import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bodega",
  description: "Bodega — Kong Oscars Gate 23",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  );
}
