import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/components/seo/structured-data";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

// Inter for body + display, JetBrains Mono for tabular numerics.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  axes: ['opsz'],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Highscore Tech';
const DESCRIPTION =
  'Highscore Tech is an AI development studio building AI systems for clients, shipping software for organisations worldwide, and running an in-house academy that hires its best graduates.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — AI development studio + Academy`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  generator: 'Next.js',
  keywords: [
    'AI development',
    'AI consulting',
    'AI systems integration',
    'software development Nigeria',
    'Highscore Tech',
    'Highscore Tech Academy',
    'coding bootcamp Nigeria',
    'React Native course',
    'Python machine learning course',
    'full stack training',
    'frontend training',
    'backend training',
  ],
  category: 'business',
  classification: 'AI development and training',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: `${SITE_NAME} — AI development studio + Academy`,
    description: DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: '/full-logo.png',
        width: 440,
        height: 130,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — AI development studio + Academy`,
    description: DESCRIPTION,
    images: ['/full-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: { 'en-US': SITE_URL },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#18C2DC' },
    { media: '(prefers-color-scheme: dark)',  color: '#050E14' },
  ],
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-bg text-fg">
        {/* Top progress bar — visible during route transitions + slow loads */}
        <NextTopLoader
          color="#18C2DC"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #18C2DC, 0 0 5px #18C2DC"
          easing="ease"
          speed={400}
        />
        <ThemeProvider>
          <JsonLd data={organizationSchema(SITE_URL, SITE_NAME)} />
          <JsonLd data={websiteSchema(SITE_URL, SITE_NAME)} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
