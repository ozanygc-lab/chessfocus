import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure App Router is used
  reactStrictMode: true,
  
  // Redirects for common paths and old URLs
  async redirects() {
    return [
      // Home page redirects
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      // Old analysis routes (if they existed)
      {
        source: "/analyse",
        destination: "/analyze",
        permanent: true,
      },
      {
        source: "/analysis",
        destination: "/analyze",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
