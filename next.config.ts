import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure App Router is used
  reactStrictMode: true,
  
  // Redirects for common paths
  async redirects() {
    return [
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
    ];
  },
};

export default nextConfig;
