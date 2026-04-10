import { execSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = process.cwd();
const appDir = resolve(repoRoot, "apps/web");
const sourceDist = resolve(appDir, "dist");
const targetDist = resolve(repoRoot, "dist");

execSync("pnpm exec vite build", {
  cwd: appDir,
  stdio: "inherit",
});

if (!existsSync(sourceDist)) {
  throw new Error(`Build output not found at ${sourceDist}`);
}

rmSync(targetDist, { recursive: true, force: true });
cpSync(sourceDist, targetDist, { recursive: true });

console.log(`Copied ${sourceDist} to ${targetDist}`);
