/**
 * Bundle all the chainhooks into a single file that can be uploaded to the Hiro platform dashboard.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const env = createEnv({
  server: {
    CHAINHOOKS_API_TOKEN: z.string().min(1),
    NEXT_PUBLIC_BASE_URL: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

// Function to recursively traverse directories and collect JSON files
function collectJsonFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      collectJsonFiles(filePath, fileList); // Recursively search subdirectories
    } else if (extname(file) === ".json") {
      fileList.push(filePath); // Add JSON files to the list
    }
  }
  return fileList;
}

const __dirname = dirname(new URL(import.meta.url).pathname);
const chainhooksDirPath = join(__dirname, "..", "chainhooks");

async function main() {
  const filterProtocol = process.argv[2];

  const files = collectJsonFiles(chainhooksDirPath);
  const chainhooks = files
    .map((filePath) => {
      const chainhookFile = JSON.parse(readFileSync(filePath, "utf8"));
      const protocolName = filePath.split("/")[filePath.split("/").length - 2];
      if (filterProtocol && protocolName !== filterProtocol) {
        return;
      }
      // Prefix the chainhook name with the protocol name
      chainhookFile.name = `${protocolName}.${chainhookFile.name}`;
      // Replace the correct params with production values
      chainhookFile.networks.mainnet.then_that.http_post.url =
        chainhookFile.networks.mainnet.then_that.http_post.url.replace(
          "http://localhost:3000",
          env.NEXT_PUBLIC_BASE_URL,
        );
      chainhookFile.networks.mainnet.then_that.http_post.authorization_header =
        chainhookFile.networks.mainnet.then_that.http_post.authorization_header.replace(
          "Bearer dev-api-token",
          `Bearer ${env.CHAINHOOKS_API_TOKEN}`,
        );
      return chainhookFile;
    })
    .filter(Boolean);

  const chainhooksString = JSON.stringify(chainhooks, null, 2);
  writeFileSync(
    join(__dirname, "..", "chainhooks.production.json"),
    chainhooksString,
  );
  console.info(
    `Generated chainhooks.production.json with ${chainhooks.length} chainhooks`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("Generation failed");
  console.error(e);
  process.exit(1);
});
