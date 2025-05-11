import { createConsola } from "consola";
import { env } from "~/env";

export const consola = createConsola({
  level: env.CONSOLA_LEVEL
    ? env.CONSOLA_LEVEL
    : env.NODE_ENV === "development"
      ? 4
      : 3,
});
