import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/account/", "/checkout/"],
      },
      {
        userAgent: ["AhrefsBot", "AhrefsSiteAudit"],
        allow: "/",
        disallow: ["/api/", "/admin/", "/account/", "/checkout/"],
      },
    ],
    sitemap: "https://www.fayzee.store/sitemap.xml",
    host: "https://www.fayzee.store",
  };
}
