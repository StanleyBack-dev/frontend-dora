import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

// Which build this is (shared/lib/app-version.ts): the version from
// package.json (bumped by release-please) and the commit the deploy
// workflow passes (APP_COMMIT_SHA); empty outside a deploy.
const appVersion: string = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf8"),
).version;
const appCommit = (
  process.env.APP_COMMIT_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  ""
).trim();

// Security headers for every page. The app only talks to its own origin
// (the BFF), so connect-src can stay 'self'.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // The gate reads invites' QR codes with the camera (this site only).
    value: "camera=(self), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

// `next dev` only: hosts allowed to load dev resources (HMR), e.g. the
// notebook's LAN IP to open the app on a phone on the same Wi-Fi.
const allowedDevOrigins = (process.env.DEV_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_APP_COMMIT: appCommit,
    // When this build was made (the deploy builds on Vercel): "Sobre o Dora".
    NEXT_PUBLIC_APP_BUILT_AT: new Date().toISOString(),
  },
  allowedDevOrigins,
  reactStrictMode: true,
  // Old addresses: the condominiums console and the members list now live
  // in the main menu.
  async redirects() {
    return [
      { source: "/plataforma", destination: "/condominios", permanent: true },
      {
        source: "/admin/condominios",
        destination: "/condominios",
        permanent: true,
      },
      { source: "/admin/usuarios", destination: "/moradores", permanent: true },
      {
        source: "/admin/usuarios/:id",
        destination: "/moradores/:id",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Service worker (Web Push): always the latest version, own origin
        // only (Next.js PWA guide).
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
