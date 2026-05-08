import type { NextConfig } from "next";

const SUPABASE_BASE = "https://shebnxyhiguhzosxeftm.supabase.co/storage/v1/object/public/hok-assets";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.com",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/img/:path*",
        destination: `${SUPABASE_BASE}/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
