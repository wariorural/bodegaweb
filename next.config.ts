import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      // Permanent adresse for kompasset (QR-koder peker hit).
      // 307 med vilje: kan repekes senere uten at nettlesere har cachet en 308.
      {
        source: "/compass",
        destination: "https://bodega-kompass.netlify.app",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
