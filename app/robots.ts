import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/seller/",
          "/account/",
          "/checkout/",
          "/cart/",
        ],
      },
      {
        userAgent: [
          "Bytespider",
          "PetalBot",
          "Amazonbot",
          "SemrushBot",
          "DotBot",
          "MJ12bot",
          "ClaudeBot",
          "AhrefsBot",
          "AhrefsSiteAudit",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: "https://www.fayzee.store/sitemap.xml",
    host: "https://www.fayzee.store",
  };
}
