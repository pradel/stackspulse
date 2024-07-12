import { createStorage } from "unstorage";
import lruCacheDriver from "unstorage/drivers/lru-cache";

export const storage = createStorage({
  driver: lruCacheDriver({
    max: 1000,
  }),
});
