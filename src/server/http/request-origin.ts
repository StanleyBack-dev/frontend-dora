import "server-only";
import { headers } from "next/headers";
import { siteUrl } from "@/shared/lib/site";

const HOST = /^[a-z0-9.-]+(:\d{1,5})?$/i;
const LOCAL = /^(localhost|127\.|10\.|192\.168\.|\[::1\])/;

/**
 * The origin this request came to (e.g. https://doragestao.vercel.app), for
 * absolute links: link previews (og:image) and the invite QR code. Follows
 * whatever domain the app is opened on, so a wrong SITE_URL can't break
 * them; SITE_URL is only the fallback outside a request.
 */
export async function requestOrigin(): Promise<string> {
  const list = await headers();
  const host = (list.get("x-forwarded-host") ?? list.get("host") ?? "")
    .split(",")[0]
    .trim();
  if (!HOST.test(host)) return siteUrl();
  const forwarded = list.get("x-forwarded-proto")?.split(",")[0].trim();
  const protocol =
    forwarded === "http" || forwarded === "https"
      ? forwarded
      : LOCAL.test(host)
        ? "http"
        : "https";
  return `${protocol}://${host}`;
}
