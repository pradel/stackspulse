/**
 * Next.js standalone build bundle all the dependencies into the output folder so
 * we can skip the node_modules folder to reduce the docker image size.
 * However we still need some runtime dependencies to run the migrations on start.
 * So we only copy the runtime dependencies to the docker image.
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const __dirname = dirname(new URL(import.meta.url).pathname);
const packageJsonPath = join(__dirname, "..", "package.json");
const dependenciesToInstall = [
  "husky",
  "@libsql/client",
  "drizzle-orm",
  "@dotenvx/dotenvx",
];

async function main() {
  // Only keep the dependencies we need
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const dependencies = packageJson.dependencies;
  packageJson.dependencies = Object.keys(dependencies)
    .filter((dep) => dependenciesToInstall.includes(dep))
    .reduce((acc, key) => {
      acc[key] = dependencies[key];
      return acc;
    }, {});
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("Docker runtime dependencies replaced");
}

main().catch((e) => {
  console.error("Docker runtime dependencies failed");
  console.error(e);
  process.exit(1);
});
