const FALLBACK_TOUR_IMAGE =
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80&auto=format&fit=crop";

export const buildTourGalleryImages = (images?: string[] | null) => {
  const normalized =
    images?.filter((image): image is string => typeof image === "string" && image.trim().length > 0) ??
    [];

  return normalized.length > 0 ? normalized : [FALLBACK_TOUR_IMAGE];
};

export const clampGalleryIndex = (index: number, length: number) => {
  if (length <= 0) return 0;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
};

export const getTourDetailDisplayState = ({
  isLoading,
  tour,
}: {
  isLoading: boolean;
  tour?: unknown | null;
}) => {
  const hasTour = tour !== undefined && tour !== null;

  return {
    showContentSkeleton: isLoading && !hasTour,
    showBlockingOverlay: false,
    hasTour,
  };
};
