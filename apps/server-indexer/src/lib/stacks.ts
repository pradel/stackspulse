import { createClient } from "@stacks/blockchain-api-client";
import {
  type ReadOnlyFunctionOptions,
  fetchCallReadOnlyFunction,
} from "@stacks/transactions";
import { env } from "~/env";
import { consola } from "./consola";

export const stacksApiClient = createClient({
  headers: {
    "x-api-key": env.HIRO_API_KEY,
  },
});

/**
 * Fetches a read-only function with retry mechanism
 * @param options - The options for the read-only function call
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in ms between retries (default: 1000)
 * @returns Promise with the result of the function call
 */
export async function fetchCallReadOnlyFunctionRetry(
  options: ReadOnlyFunctionOptions,
  maxRetries = 3,
  initialDelay = 1000,
) {
  let lastError: Error | null = null;
  let currentDelay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Attempt to call the function
      const result = await fetchCallReadOnlyFunction(options);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt, don't wait
      if (attempt === maxRetries) break;

      consola.warn(
        `Retry attempt ${attempt + 1}/${maxRetries} for function ${
          options.contractName
        }.${options.functionName}: ${lastError.message}`,
      );

      // Wait before next retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      // Increase delay for next attempt (exponential backoff)
      currentDelay *= 2;
    }
  }

  // If we've exhausted all retries, throw the last error
  throw new Error(
    `Failed to call ${options.contractName}.${options.functionName} after ${maxRetries} retries: ${lastError?.message}`,
  );
}
