import { Ionicons } from "@expo/vector-icons";
import {
  TourSearchDurationOption,
  TourSearchFilters,
  TourSearchPriceBounds,
  TourSearchSortOption,
} from "../../utils/tourSearch";

export type TourUiColors = {
  bg: string;
  surface: string;
  mutedSurface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  placeholder: string;
  onPrimary: string;
  overlay: string;
};

export type TourUiCard = {
  id: string;
  name: string;
  rating?: number;
  displayPrice: number;
  originalPrice?: number;
  discountPercent?: number;
  thumbnail: string;
  durationText: string;
  durationDays: number;
  category: string;
  destinationCity?: string;
  destinationCountry?: string;
};

export type TourUiFilterState = TourSearchFilters;
export type TourUiPriceBounds = TourSearchPriceBounds;
export type TourUiSortOption = TourSearchSortOption;
export type TourUiDurationOption = TourSearchDurationOption;

export type TourUiTranslation = (
  key: string,
  params?: Record<string, string | number>
) => string;

export type TourUiSortConfig = {
  key: TourUiSortOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};
