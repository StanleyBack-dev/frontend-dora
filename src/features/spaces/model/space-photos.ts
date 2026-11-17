import type { Space, SpacePhoto } from "@/shared/contracts/spaces";

/** The photos of each space, by its id (to show them beside its events). */
export const photosBySpace = (spaces: Space[]): Record<string, SpacePhoto[]> =>
  Object.fromEntries(spaces.map((space) => [space.id, space.photos]));
