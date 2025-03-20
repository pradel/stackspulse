import { getOrCreateToken } from "~/lib/token";

export default defineEventHandler(async (event) => {
  await getOrCreateToken(
    "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex",
  );
  return "Start by editing <code>server/routes/index.ts</code>.";
});
