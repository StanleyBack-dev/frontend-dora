// Which build of the web app is running. All values are inlined at build
// time (next.config.ts): the version from package.json (bumped by
// release-please), the deploy's git commit (empty outside a deploy) and
// when the build was made.

export type BuildInfo = {
  version: string;
  /** Full commit SHA; null outside a deploy (local dev). */
  commit: string | null;
  /** When this version went live (ISO 8601); null when unknown. */
  updatedAt: string | null;
};

export const APP_BUILD: BuildInfo = {
  version: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
  commit: process.env.NEXT_PUBLIC_APP_COMMIT || null,
  updatedAt: process.env.NEXT_PUBLIC_APP_BUILT_AT || null,
};

/** "v0.2.0" ("dev" outside a release). */
export function versionLabel(build: Pick<BuildInfo, "version">): string {
  return build.version === "dev" ? "dev" : `v${build.version}`;
}
