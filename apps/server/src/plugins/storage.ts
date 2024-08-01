import { env } from "~/env";
import { unstorageTursoDriver } from "~/lib/unstorage-turso-driver";

export default defineNitroPlugin(() => {
  const storage = useStorage();

  const driver = unstorageTursoDriver({
    config: {
      url: "file:sqlite.db",
    },
  });

  if (env.NODE_ENV === "development") {
    // biome-ignore lint/suspicious/noExplicitAny: we know init exists
    (driver as any).init();
  }

  storage.mount("api", driver);
});
