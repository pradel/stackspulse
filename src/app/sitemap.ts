import { env } from "@/env";
import { protocolsInfo } from "@/lib/protocols";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [
    {
      url: env.NEXT_PUBLIC_BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  Object.keys(protocolsInfo).forEach((protocol) => {
    urls.push({
      url: `${env.NEXT_PUBLIC_BASE_URL}/protocols/${protocol}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    });
  });

  return urls;
}
