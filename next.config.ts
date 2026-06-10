import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js NOT to bundle these packages into the serverless function —
  // they ship native binaries (sharp) or large WASM payloads (@react-pdf
  // uses Yoga for layout) that must be loaded from node_modules at runtime
  // on the Netlify Linux container. Bundling them into the function output
  // causes the 500s we hit on the contract / syllabus / receipt PDF routes.
  serverExternalPackages: [
    'sharp',
    '@react-pdf/renderer',
    'react-pdf',
  ],

  // Loosen the Image optimizer so the Supabase Storage URLs we render in
  // /admin/staff and on the About page don't get rejected.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ggijavqgshazbctkwmwl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
