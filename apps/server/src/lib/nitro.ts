/**
 * Nitro utilities
 */

import type { H3Event } from "h3";
import type { z } from "zod";
import { fromError } from "zod-validation-error";

export const getValidatedQueryZod = async <T, Event extends H3Event = H3Event>(
  event: Event,
  schema: z.ZodType<T>,
) => {
  const query = getQuery(event);
  const response = schema.safeParse(query);

  if (!response.success) {
    throw createError({
      status: 400,
      statusMessage: "Validation Error",
      message: fromError(response.error).toString(),
      data: response.error,
    });
  }

  return response.data;
};
