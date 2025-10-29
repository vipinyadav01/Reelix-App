#!/usr/bin/env node
/*
  Reset project helper:
  - removes caches and installations
  - reinstalls deps
  - advises next steps
*/

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function removeIfExists(targetPath) {
  try {
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
      console.log(`Removed ${targetPath}`);
    }
  } catch (err) {
    console.error(`Failed to remove ${targetPath}:`, err.message);
  }
}

function run(cmd, args, opts = {}) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: true,
    ...opts,
  });
  if (result.status !== 0) {
    process.exitCode = result.status || 1;
    throw new Error(`${cmd} exited with code ${result.status}`);
  }
}

(function main() {
  const cwd = process.cwd();

  // Remove typical caches and installs
  removeIfExists(path.join(cwd, "node_modules"));
  removeIfExists(path.join(cwd, "package-lock.json"));
  removeIfExists(path.join(cwd, "yarn.lock"));
  removeIfExists(path.join(cwd, "pnpm-lock.yaml"));
  removeIfExists(path.join(cwd, ".expo"));
  removeIfExists(path.join(cwd, ".turbo"));
  removeIfExists(path.join(cwd, ".cache"));

  // Clear Metro cache
  try {
    run(
      "npx",
      ["expo", "start", "-c", "--tunnel=false", "--no-dev", "--clear"],
      { env: { ...process.env, CI: "true" } },
    );
  } catch (_) {
    // We only care that cache clear attempt ran; ignore failures if expo isn't available yet
  }

  // Reinstall dependencies
  run("npm", ["install"]);

  console.log("\nReset complete. You can now start the app:");
  console.log("  - npx expo start -c");
})();
