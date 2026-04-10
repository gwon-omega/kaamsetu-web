import { execFileSync } from "node:child_process";

const previousSha = process.env.VERCEL_GIT_PREVIOUS_SHA;
const currentSha = process.env.VERCEL_GIT_COMMIT_SHA;

if (!previousSha || !currentSha) {
  process.exit(1);
}

const relevantPaths = [
  "apps/web",
  "packages/shared",
  "packages/ui-tokens",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "turbo.json",
  "tsconfig.base.json",
];

const changedFiles = execFileSync(
  "git",
  ["diff", "--name-only", previousSha, currentSha, "--", ...relevantPaths],
  { encoding: "utf8" },
).trim();

if (!changedFiles) {
  process.exit(0);
}

process.exit(1);
