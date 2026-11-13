// Dora mark: a lowercase "d" (a round bowl and a stem, like a ball next to a
// post) in black on the Dora orange tile. Drawn as SVG so it stays sharp at
// any size: the UI renders it inline (LogoMark), the generated images (app
// icons, link previews) read it as a data: URL (brand-logo.ts).

// Mirrors the brand and chrome tokens (app/globals.css).
export const BRAND_COLORS = {
  orange: "#ff6b1a",
  black: "#0a0a0a",
  white: "#ffffff",
  muted: "#b5b0a9",
} as const;

/** The "d" alone, centered in a 64×64 box (for tiles drawn elsewhere). */
export const GLYPH_PATHS = `<circle cx="31" cy="38" r="11" fill="none" stroke="${BRAND_COLORS.black}" stroke-width="7"/><rect x="40" y="12" width="7" height="40.5" rx="3.5" fill="${BRAND_COLORS.black}"/>`;

export const glyphSvg = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${GLYPH_PATHS}</svg>`;

/** The full mark: orange rounded tile + the "d". */
export const markSvg = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${BRAND_COLORS.orange}"/>${GLYPH_PATHS}</svg>`;
