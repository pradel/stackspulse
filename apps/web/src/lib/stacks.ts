import { createClient } from "@hirosystems/token-metadata-api-client";

export const tokenMetadataClient = createClient({
  baseUrl: "https://api.mainnet.hiro.so",
});

// TODO remove this type once https://github.com/hirosystems/token-metadata-api/issues/275 is fixed
export interface FtMetadataResponse {
  decimals?: number;
  name?: string;
  symbol?: string;
  description?: string;
  image_uri?: string;
  image_thumbnail_uri?: string;
  asset_identifier: string;
}
