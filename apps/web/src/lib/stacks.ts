import { createClient } from "@hirosystems/token-metadata-api-client";

export const tokenMetadataClient = createClient({
  baseUrl: "https://api.mainnet.hiro.so",
});

export interface FtMetadataResponse {
  decimals?: number;
  name?: string;
  symbol?: string;
  description?: string;
  image_uri?: string;
  image_thumbnail_uri?: string;
  asset_identifier: string;
}
