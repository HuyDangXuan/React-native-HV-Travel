"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTourDetailDisplayState = exports.clampGalleryIndex = exports.buildTourGalleryImages = void 0;
const FALLBACK_TOUR_IMAGE = "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80&auto=format&fit=crop";
const buildTourGalleryImages = (images) => {
    const normalized = images?.filter((image) => typeof image === "string" && image.trim().length > 0) ??
        [];
    return normalized.length > 0 ? normalized : [FALLBACK_TOUR_IMAGE];
};
exports.buildTourGalleryImages = buildTourGalleryImages;
const clampGalleryIndex = (index, length) => {
    if (length <= 0)
        return 0;
    if (index < 0)
        return 0;
    if (index >= length)
        return length - 1;
    return index;
};
exports.clampGalleryIndex = clampGalleryIndex;
const getTourDetailDisplayState = ({ isLoading, tour, }) => {
    const hasTour = tour !== undefined && tour !== null;
    return {
        showContentSkeleton: isLoading && !hasTour,
        showBlockingOverlay: false,
        hasTour,
    };
};
exports.getTourDetailDisplayState = getTourDetailDisplayState;
