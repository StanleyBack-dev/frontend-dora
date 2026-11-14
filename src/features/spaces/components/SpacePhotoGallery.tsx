import { SpacePhotoCarousel } from "@/features/spaces/components/SpacePhotoCarousel";
import type { SpacePhoto } from "@/shared/contracts/spaces";

// The space's photos on its pages (space and booking): a large carousel with
// the photo counter. Nothing when the space has no photos.
export function SpacePhotoGallery({
  photos,
  name,
}: {
  photos: SpacePhoto[];
  name: string;
}) {
  if (photos.length === 0) return null;
  return (
    <SpacePhotoCarousel
      photos={photos}
      name={name}
      variant="page"
      className="aspect-[16/9] max-h-[28rem] w-full rounded-[1.75rem] border border-border"
    />
  );
}
