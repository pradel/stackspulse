import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const __dirname = dirname(new URL(import.meta.url).pathname);
const packageJsonPath = join(__dirname, "..", "apps", "web", "package.json");
const flyTomlWebPath = join(__dirname, "..", "apps", "web", "fly.toml");
const flyTomlServerPath = join(__dirname, "..", "apps", "server", "fly.toml");

/**
 * Take the current version from package.json and replace the version in the
 * fly.toml file.
 */
async function main() {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const flyTomlWeb = readFileSync(flyTomlWebPath, "utf8");

  let updatedFlyToml = flyTomlWeb.replace(
    /"ghcr.io\/pradel\/stackspulse:.*/,
    `"ghcr.io/pradel/stackspulse:${packageJson.version}"`,
  );
  writeFileSync(flyTomlWebPath, updatedFlyToml);

  const flyTomlServer = readFileSync(flyTomlServerPath, "utf8");

  updatedFlyToml = flyTomlServer.replace(
    /"ghcr.io\/pradel\/stackspulse\/server:.*/,
    `"ghcr.io/pradel/stackspulse/server:${packageJson.version}"`,
  );
  writeFileSync(flyTomlServerPath, updatedFlyToml);

  console.info(`Updated fly.toml version to ${packageJson.version}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Release failed");
  console.error(e);
  process.exit(1);
});
