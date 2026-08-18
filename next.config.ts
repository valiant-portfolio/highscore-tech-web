import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js NOT to bundle these packages — they ship native binaries
  // (sharp) or WASM payloads (@react-pdf/renderer uses Yoga for layout)
  // that must be loaded from node_modules at runtime on the Netlify
  // Linux container. Bundling them into the function output causes 500s
  // on the PDF + image-processing routes.
  serverExternalPackages: [
    'sharp',
    '@react-pdf/renderer',
    'react-pdf',
  ],

  // Portfolio media uploads go through a Server Action; the default 1 MB body
  // limit would reject them. Allow headroom for a 50 MB video (the bucket
  // ceiling) plus the images + form fields in the same submit.
  experimental: {
    serverActions: {
      bodySizeLimit: '60mb',
    },
  },

  // Force the bundler to include @fontsource woff files in the function
  // output. Without this, react-pdf can't find them at runtime even
  // though we createRequire.resolve() them. We bundle Inter (400/600/800)
  // for body + headings, and Allura for the cursive signature fallback.
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/@fontsource/inter/files/inter-latin-400-normal.woff',
      './node_modules/@fontsource/inter/files/inter-latin-600-normal.woff',
      './node_modules/@fontsource/inter/files/inter-latin-800-normal.woff',
      './node_modules/@fontsource/allura/files/allura-latin-400-normal.woff',
    ],
  },

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

  // Teaching is retired from the public site. 301 (308 permanent) every old
  // academy URL so we keep the search authority instead of throwing 404s:
  // course browsing goes home, an enrolment attempt goes to contact.
  async redirects() {
    return [
      { source: '/academy', destination: '/', permanent: true },
      { source: '/academy/:slug*', destination: '/', permanent: true },
      { source: '/enrol/:slug*', destination: '/contact', permanent: true },
    ];
  },
};

export default nextConfig;
