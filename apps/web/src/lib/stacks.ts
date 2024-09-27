import { TokensApi } from "@hirosystems/token-metadata-api-client";

export const stacksTokensApi = new TokensApi({}, "https://api.hiro.so", fetch);
