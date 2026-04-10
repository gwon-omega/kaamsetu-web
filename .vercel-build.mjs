import { execSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = process.cwd();
const appDir = resolve(repoRoot, "apps/web");
const targetDist = resolve(repoRoot, "dist");

execSync("pnpm exec vite build", {
  cwd: appDir,
  stdio: "inherit",
  env: {
    ...process.env,
    VITE_CJS_IGNORE_WARNING: "true",
  },
});

const candidateDists = [
  resolve(appDir, "dist"),
  resolve(repoRoot, "dist"),
  resolve(appDir, "apps/web/dist"),
];

const sourceDist = candidateDists.find((path) => existsSync(path));

if (!sourceDist) {
  throw new Error(
    `Build output not found. Checked: ${candidateDists.join(", ")}`,
  );
}

if (sourceDist !== targetDist) {
  rmSync(targetDist, { recursive: true, force: true });
  cpSync(sourceDist, targetDist, { recursive: true });
}

console.log(`Using build output from ${sourceDist}`);
