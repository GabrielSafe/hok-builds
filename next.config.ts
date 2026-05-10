import type { NextConfig } from "next";

const SUPABASE_BASE = "https://shebnxyhiguhzosxeftm.supabase.co/storage/v1/object/public/hok-assets";

const nextConfig: NextConfig = {
  experimental: {
    serverBodySizeLimit: "200mb",
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
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
