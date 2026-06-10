import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev resources (HMR / static assets) to be requested from these hosts.
  // Needed when serving the Next.js dev server through an ngrok tunnel for
  // Telegram Mini App testing. Update or add entries each time ngrok rotates
  // your subdomain (free tier). Localhost is always allowed by default.
  allowedDevOrigins: [
    'unpleased-drapery-deletion.ngrok-free.dev',
    // Add more ngrok hosts here as needed, or paid static subdomains.
  ],
};

export default nextConfig;
