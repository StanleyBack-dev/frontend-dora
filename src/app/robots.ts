import type { MetadataRoute } from "next";

// Private app for residents: nothing here is meant for search engines.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
