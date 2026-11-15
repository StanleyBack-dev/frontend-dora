// Which build of the web app is running. Both values are inlined at build
// time (next.config.ts): the version from package.json (bumped by
// release-please) and the deploy's git commit (empty outside a deploy).

export type BuildInfo = {
  version: string;
  /** Full commit SHA; null outside a deploy (local dev). */
  commit: string | null;
};

export const APP_BUILD: BuildInfo = {
  version: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
  commit: process.env.NEXT_PUBLIC_APP_COMMIT || null,
};

/** "v0.2.0", or "v0.2.0 · a1b2c3d" with the commit. */
export function versionLabel(build: BuildInfo, withCommit = false): string {
  const version = build.version === "dev" ? "dev" : `v${build.version}`;
  return withCommit && build.commit
    ? `${version} · ${build.commit.slice(0, 7)}`
    : version;
}
