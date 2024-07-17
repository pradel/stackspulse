import { sql } from "~/lib/db";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hookOnce("close", async () => {
    await sql.end();
  });
});
