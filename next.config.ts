import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Grunnleggende sikkerhetsheadere. X-Frame-Options hindrer at siden (og
  // utleieskjemaet) bakes inn i en fremmed side for å lure fram klikk.
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    }];
  },
  async redirects() {
    return [
      // Permanent adresse for kompasset (QR-koder peker hit).
      // 307 med vilje: kan repekes senere uten at nettlesere har cachet en 308.
      {
        source: "/compass",
        destination: "https://bodega-kompass.netlify.app",
        permanent: false,
      },
      // Permanent adresse for ruletten (QR-koder peker hit).
      {
        source: "/rulett",
        destination: "https://bodega-rulett.netlify.app",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
