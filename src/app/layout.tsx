import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { connection } from "next/server";
import { AppSplash } from "@/features/layout/components/AppSplash";
import { NavigationProgress } from "@/features/layout/components/NavigationProgress";
import { ToastProvider } from "@/shared/toast/ToastProvider";
import { requestOrigin } from "@/server/http/request-origin";
import { SITE_DESCRIPTION, SITE_NAME } from "@/shared/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const baseMetadata: Metadata = {
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  // Private app: no page is offered to search engines.
  robots: { index: false, follow: false },
  // Link previews (WhatsApp, Instagram, Facebook, X): the image comes from
  // app/opengraph-image.tsx; pages without their own inherit these.
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} · Reservas do seu condomínio`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · Reservas do seu condomínio`,
    description: SITE_DESCRIPTION,
  },
  // Title and status bar of the installed app on iOS.
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
};

// Absolute addresses (og:image) on the domain the page was opened on.
export async function generateMetadata(): Promise<Metadata> {
  return { ...baseMetadata, metadataBase: new URL(await requestOrigin()) };
}

export const viewport: Viewport = {
  // The chrome color (globals.css): the installed app's status bar.
  themeColor: "#0a0a0a",
};

// Every page renders per request: the CSP nonce (proxy.ts) can only be
// applied to dynamically rendered HTML.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  return (
    <html lang="pt-BR" className={jakarta.variable}>
      <body>
        <AppSplash />
        <NavigationProgress />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
