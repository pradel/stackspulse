import { unstorageTursoDriver } from "~/lib/unstorage-turso-driver";

export default defineNitroPlugin(() => {
  const storage = useStorage();

  const driver = unstorageTursoDriver({
    config: {
      url: "file:sqlite.db",
    },
  });

  storage.mount("api", driver);
});
