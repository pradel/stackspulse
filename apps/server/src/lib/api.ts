import type { EventHandlerRequest, H3Event } from "h3";

export const apiCacheConfig = {
  swr: true,
  maxAge: 3 * 5 * 60,
  base: "api",

  /**
   * Passing the query param `noCache=true` will bypass the cache
   * and return the latest data.
   */
  shouldBypassCache(event: H3Event<EventHandlerRequest>) {
    const query = getQuery(event);
    if (query.noCache === "true") {
      return true;
    }
    return false;
  },
};
