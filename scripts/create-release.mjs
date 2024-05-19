import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const __dirname = dirname(new URL(import.meta.url).pathname);
const packageJsonPath = join(__dirname, "..", "package.json");
const flyTomlPath = join(__dirname, "..", "fly.toml");

/**
 * Take the current version from package.json and replace the version in the
 * fly.toml file.
 */
async function main() {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const flyToml = readFileSync(flyTomlPath, "utf8");

  const updatedFlyToml = flyToml.replace(
    /"ghcr.io\/pradel\/stackspulse:.*/,
    `"ghcr.io/pradel/stackspulse:${packageJson.version}"`,
  );

  writeFileSync(flyTomlPath, updatedFlyToml);
  console.info(`Updated fly.toml version to ${packageJson.version}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Release failed");
  console.error(e);
  process.exit(1);
});
