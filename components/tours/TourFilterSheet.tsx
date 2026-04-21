import React from "react";
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../config/theme";
import { formatCompactSearchPrice, normalizeTourSearchPriceInput } from "../../utils/tourSearch";
import {
  TourUiColors,
  TourUiDurationOption,
  TourUiFilterState,
  TourUiPriceBounds,
  TourUiSortConfig,
  TourUiSortOption,
  TourUiTranslation,
} from "./tourUiTypes";

const { width } = Dimensions.get("window");
const SLIDER_LENGTH = width - 72;

const SORT_OPTIONS: TourUiSortConfig[] = [
  { key: "popular", label: "Popular", icon: "flame-outline" },
  { key: "price_asc", label: "Price ascending", icon: "trending-up-outline" },
  { key: "price_desc", label: "Price descending", icon: "trending-down-outline" },
  { key: "rating", label: "Top rated", icon: "star-outline" },
];

const DURATION_OPTIONS: { key: TourUiDurationOption; label: string }[] = [
  { key: "all", label: "All" },
  { key: "1", label: "1 day" },
  { key: "2_3", label: "2-3 days" },
  { key: "4_7", label: "4-7 days" },
  { key: "7_plus", label: "7+ days" },
];

const RATING_OPTIONS = [0, 3, 4, 5];

export const getTourFilterSortLabel = (t: TourUiTranslation, key: TourUiSortOption) => {
  switch (key) {
    case "price_asc":
      return t("search.sortPriceAsc");
    case "price_desc":
      return t("search.sortPriceDesc");
    case "rating":
      return t("search.sortRating");
    case "popular":
    default:
      return t("search.sortPopular");
  }
};

export const getTourFilterDurationLabel = (t: TourUiTranslation, key: TourUiDurationOption) => {
  switch (key) {
    case "1":
      return t("search.duration1");
    case "2_3":
      return t("search.duration2to3");
    case "4_7":
      return t("search.duration4to7");
    case "7_plus":
      return t("search.duration7plus");
    case "all":
    default:
      return t("home.all");
  }
};

export const getTourFilterActiveCount = (filters: TourUiFilterState, defaults: TourUiFilterState) => {
  let count = 0;
  if (filters.sortBy !== defaults.sortBy) count += 1;
  if (filters.minPrice !== defaults.minPrice || filters.maxPrice !== defaults.maxPrice) count += 1;
  if (filters.duration !== defaults.duration) count += 1;
  if (filters.minRating !== defaults.minRating) count += 1;
  return count;
};

type Props = {
  visible: boolean;
  ui: TourUiColors;
  themeName: string;
  t: TourUiTranslation;
  draftFilters: TourUiFilterState;
  normalizedDraftFilters: TourUiFilterState;
  draftPriceBounds: TourUiPriceBounds;
  resultCount: number;
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
  onDraftFiltersChange: (filters: TourUiFilterState) => void;
};

const PriceRangeSlider = ({
  bounds,
  minPrice,
  maxPrice,
  onValuesChange,
}: {
  bounds: TourUiPriceBounds;
  minPrice: number;
  maxPrice: number;
  onValuesChange: (newMin: number, newMax: number) => void;
}) => (
  <View style={sliderStyles.outerWrap}>
    <MultiSlider
      values={[minPrice, maxPrice]}
      min={bounds.minAvailablePrice}
      max={bounds.sliderMaxPrice}
      step={bounds.step}
      sliderLength={SLIDER_LENGTH}
      onValuesChange={(values) => onValuesChange(values[0], values[1])}
      allowOverlap={false}
      snapped
      selectedStyle={sliderStyles.activeTrack}
      unselectedStyle={sliderStyles.track}
      markerStyle={sliderStyles.thumb}
      pressedMarkerStyle={sliderStyles.thumbPressed}
      trackStyle={sliderStyles.trackStyle}
      containerStyle={sliderStyles.container}
    />
    <View style={sliderStyles.tickRow}>
      <Text style={sliderStyles.tickText}>{formatCompactSearchPrice(bounds.minAvailablePrice)}</Text>
      <Text style={sliderStyles.tickText}>{formatCompactSearchPrice(bounds.sliderMaxPrice)}</Text>
    </View>
  </View>
);

export default function TourFilterSheet({
  visible,
  ui,
  themeName,
  t,
  draftFilters,
  normalizedDraftFilters,
  draftPriceBounds,
  resultCount,
  onClose,
  onReset,
  onApply,
  onDraftFiltersChange,
}: Props) {
  const updateDraftPrice = (field: "minPrice" | "maxPrice", rawValue: string) => {
    onDraftFiltersChange({ ...draftFilters, [field]: normalizeTourSearchPriceInput(rawValue) });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: ui.overlay }]}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.filterSheet, { backgroundColor: ui.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: ui.border }]} />
          <View style={styles.filterHeader}>
            <View>
              <Text style={[styles.filterSheetTitle, { color: ui.textPrimary }]}>{t("home.filterTitle")}</Text>
              <Text style={[styles.filterSheetSubtitle, { color: ui.textSecondary }]}>{t("home.filterSubtitle")}</Text>
            </View>
            <Pressable style={[styles.closeIconBtn, { backgroundColor: ui.mutedSurface }]} onPress={onClose}>
              <Ionicons name="close" size={18} color={ui.textPrimary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: ui.textPrimary }]}>{t("home.sortBy")}</Text>
              <View style={styles.optionGrid}>
                {SORT_OPTIONS.map((option) => {
                  const active = draftFilters.sortBy === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      style={[
                        styles.optionChip,
                        { backgroundColor: ui.mutedSurface, borderColor: ui.border },
                        active && { backgroundColor: ui.primary, borderColor: ui.primary },
                      ]}
                      onPress={() => onDraftFiltersChange({ ...draftFilters, sortBy: option.key })}
                    >
                      <Ionicons name={option.icon} size={16} color={active ? ui.onPrimary : ui.textPrimary} />
                      <Text style={[styles.optionChipText, { color: active ? ui.onPrimary : ui.textPrimary }]}>
                        {getTourFilterSortLabel(t, option.key)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: ui.textPrimary }]}>{t("home.priceRange")}</Text>
              <View style={styles.rangeSummary}>
                <View style={[styles.rangeBadge, { backgroundColor: ui.mutedSurface, borderColor: ui.border }]}>
                  <Text style={[styles.rangeBadgeLabel, { color: ui.textSecondary }]}>{t("home.minPrice")}</Text>
                  <Text style={[styles.rangeBadgeValue, { color: ui.textPrimary }]}>
                    {formatCompactSearchPrice(normalizedDraftFilters.minPrice)}
                  </Text>
                </View>
                <View style={[styles.rangeTrack, { backgroundColor: ui.border }]} />
                <View
                  style={[
                    styles.rangeBadge,
                    {
                      backgroundColor: themeName === "dark" ? "rgba(34, 211, 238, 0.12)" : ui.mutedSurface,
                      borderColor: themeName === "dark" ? "rgba(34, 211, 238, 0.35)" : ui.border,
                    },
                  ]}
                >
                  <Text style={[styles.rangeBadgeLabel, { color: ui.textSecondary }]}>{t("home.maxPrice")}</Text>
                  <Text style={[styles.rangeBadgeValue, { color: ui.textPrimary }]}>
                    {formatCompactSearchPrice(normalizedDraftFilters.maxPrice)}
                  </Text>
                </View>
              </View>
              <PriceRangeSlider
                bounds={draftPriceBounds}
                minPrice={normalizedDraftFilters.minPrice}
                maxPrice={normalizedDraftFilters.maxPrice}
                onValuesChange={(min, max) => onDraftFiltersChange({ ...draftFilters, minPrice: min, maxPrice: max })}
              />
              <View style={styles.priceInputsRow}>
                <View style={[styles.priceInputCard, { backgroundColor: ui.mutedSurface, borderColor: ui.border }]}>
                  <Text style={[styles.priceInputLabel, { color: ui.textSecondary }]}>{t("home.minPrice")}</Text>
                  <TextInput
                    value={String(draftFilters.minPrice)}
                    onChangeText={(value) => updateDraftPrice("minPrice", value)}
                    keyboardType="numeric"
                    style={[styles.priceInput, { color: ui.textPrimary }]}
                    placeholder={String(draftPriceBounds.minAvailablePrice)}
                    placeholderTextColor={ui.placeholder}
                  />
                </View>
                <View style={[styles.priceInputCard, { backgroundColor: ui.mutedSurface, borderColor: ui.border }]}>
                  <Text style={[styles.priceInputLabel, { color: ui.textSecondary }]}>{t("home.maxPrice")}</Text>
                  <TextInput
                    value={String(draftFilters.maxPrice)}
                    onChangeText={(value) => updateDraftPrice("maxPrice", value)}
                    keyboardType="numeric"
                    style={[styles.priceInput, { color: ui.textPrimary }]}
                    placeholder={String(draftPriceBounds.sliderMaxPrice)}
                    placeholderTextColor={ui.placeholder}
                  />
                </View>
              </View>
              <Text style={[styles.rangeHint, { color: ui.textSecondary }]}>
                {t("home.availableRangeExpanded", {
                  min: formatCompactSearchPrice(draftPriceBounds.minAvailablePrice),
                  max: formatCompactSearchPrice(draftPriceBounds.maxAvailablePrice),
                  sliderMax: formatCompactSearchPrice(draftPriceBounds.sliderMaxPrice),
                })}
              </Text>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: ui.textPrimary }]}>{t("home.duration")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalOptions}>
                {DURATION_OPTIONS.map((option) => {
                  const active = draftFilters.duration === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      style={[
                        styles.durationChip,
                        { backgroundColor: ui.mutedSurface, borderColor: ui.border },
                        active && { backgroundColor: ui.primary, borderColor: ui.primary },
                      ]}
                      onPress={() => onDraftFiltersChange({ ...draftFilters, duration: option.key })}
                    >
                      <Text style={[styles.durationChipText, { color: active ? ui.onPrimary : ui.textPrimary }]}>
                        {getTourFilterDurationLabel(t, option.key)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: ui.textPrimary }]}>{t("home.rating")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalOptions}>
                {RATING_OPTIONS.map((rating) => {
                  const active = draftFilters.minRating === rating;
                  return (
                    <Pressable
                      key={String(rating)}
                      style={[
                        styles.ratingChip,
                        { backgroundColor: ui.mutedSurface, borderColor: ui.border },
                        active && { backgroundColor: ui.primary, borderColor: ui.primary },
                      ]}
                      onPress={() => onDraftFiltersChange({ ...draftFilters, minRating: rating })}
                    >
                      <Ionicons name="star" size={15} color={active ? "#fef08a" : "#f59e0b"} />
                      <Text style={[styles.ratingChipText, { color: active ? ui.onPrimary : ui.textPrimary }]}>
                        {rating === 0 ? t("home.all") : t("home.starsPlus", { count: rating })}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={[styles.sheetActionBar, { borderTopColor: ui.border, backgroundColor: ui.surface }]}>
            <Pressable style={[styles.resetBtn, { backgroundColor: ui.mutedSurface, borderColor: ui.border }]} onPress={onReset}>
              <Text style={[styles.resetBtnText, { color: ui.textPrimary }]}>{t("home.reset")}</Text>
            </Pressable>
            <Pressable style={[styles.applyBtn, { backgroundColor: ui.primary }]} onPress={onApply}>
              <Text style={[styles.applyBtnText, { color: ui.onPrimary }]}>{t("home.viewResults", { count: resultCount })}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const sliderStyles = StyleSheet.create({
  outerWrap: { marginTop: 4, marginBottom: 2 },
  container: { alignSelf: "center", height: 32 },
  trackStyle: { height: 5, borderRadius: 3 },
  track: { backgroundColor: "#e2e8f0", borderRadius: 3 },
  activeTrack: { backgroundColor: theme.colors.primary, borderRadius: 3 },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  thumbPressed: { transform: [{ scale: 1.08 }] },
  tickRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 2, marginTop: 2 },
  tickText: { fontSize: 11, fontWeight: "600", color: "#94a3b8" },
});

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "transparent" },
  modalBackdrop: { flex: 1, backgroundColor: "transparent" },
  filterSheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    maxHeight: "85%",
  },
  handleBar: {
    alignSelf: "center",
    width: 56,
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    marginBottom: 14,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterSheetTitle: { fontSize: 22, fontWeight: "900", color: theme.colors.text },
  filterSheetSubtitle: { marginTop: 4, fontSize: 13, lineHeight: 18, color: theme.colors.gray, maxWidth: 260 },
  closeIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  filterContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 20 },
  filterSection: { gap: 12 },
  filterSectionTitle: { fontSize: 16, fontWeight: "800", color: theme.colors.text },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionChipText: { fontSize: 13, fontWeight: "700", color: "#334155" },
  rangeSummary: { flexDirection: "row", alignItems: "center", gap: 10 },
  rangeBadge: { flex: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1 },
  rangeBadgeLabel: { fontSize: 11, fontWeight: "800", color: theme.colors.gray, textTransform: "uppercase" },
  rangeBadgeValue: { marginTop: 4, fontSize: 18, fontWeight: "900", color: theme.colors.text },
  rangeTrack: { width: 20, height: 2, backgroundColor: theme.colors.border },
  priceInputsRow: { flexDirection: "row", gap: 10 },
  priceInputCard: { flex: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1 },
  priceInputLabel: { fontSize: 12, fontWeight: "700", color: theme.colors.gray, marginBottom: 6 },
  priceInput: { fontSize: 17, fontWeight: "800", color: theme.colors.text, paddingVertical: 0 },
  rangeHint: { fontSize: 12, color: theme.colors.gray, lineHeight: 17 },
  horizontalOptions: { gap: 10, paddingRight: 4 },
  durationChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  durationChipText: { fontSize: 13, fontWeight: "700", color: "#334155" },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  ratingChipText: { fontSize: 13, fontWeight: "700", color: "#334155" },
  sheetActionBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  resetBtn: {
    width: 110,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnText: { fontSize: 14, fontWeight: "800", color: theme.colors.text },
  applyBtn: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  applyBtnText: { fontSize: 14, fontWeight: "800", color: theme.colors.white },
});
