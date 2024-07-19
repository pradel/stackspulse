import { sql } from "~/db/db";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hookOnce("close", async () => {
    await sql.end();
  });
});
