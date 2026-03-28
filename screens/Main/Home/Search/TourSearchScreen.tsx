import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import {
  ExploreTourSkeletonList,
  TourSearchSuggestionsSkeleton,
} from "../../../../components/skeleton/MainTabSkeletons";
import AppHeader from "../../../../components/ui/AppHeader";
import EmptyState from "../../../../components/ui/EmptyState";
import theme from "../../../../config/theme";
import { Tour } from "../../../../models/Tour";
import { TourService } from "../../../../services/TourService";
import { extractNumber } from "../../../../utils/PriceUtils";
import { getPullRefreshDisplayState } from "../../../../utils/loadingState";
import { shouldTriggerOverlayRefresh } from "../../../../utils/pullToRefresh";
import {
  TourSearchCard,
  TourSearchDurationOption,
  TourSearchFilters,
  TourSearchPriceBounds,
  TourSearchSortOption,
  applyTourSearchFilters,
  buildSuggestedCategories,
  buildSuggestedTours,
  createDefaultTourSearchFilters,
  formatCompactSearchPrice,
  getTourSearchPriceBounds,
  hasActiveTourSearchFilters,
  normalizeTourSearchFilters,
  normalizeTourSearchPriceInput,
  shouldShowTourSearchSuggestions,
} from "../../../../utils/tourSearch";
import LoadingOverlay from "../../../Loading/LoadingOverlay";
import { MessageBoxService } from "../../../MessageBox/MessageBoxService";

const { width } = Dimensions.get("window");
const SLIDER_LENGTH = width - 72;
const PULL_REFRESH_THRESHOLD = 72;

type SearchTourCard = TourSearchCard & {
  price: { adult: number; child: number; infant: number; discount?: number };
  originalPrice?: number;
  thumbnail: string;
  durationText: string;
};

const UI = {
  primary: theme.colors.primary,
  bgLight: theme.colors.background,
  slate900: theme.colors.text,
  slate700: "#334155",
  slate500: theme.colors.gray,
  slate400: theme.colors.placeholder,
  slate200: theme.colors.border,
  slate100: theme.colors.surface,
  white: theme.colors.white,
};

const SORT_OPTIONS: { key: TourSearchSortOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "popular", label: "Phổ biến", icon: "flame-outline" },
  { key: "price_asc", label: "Giá tăng dần", icon: "trending-up-outline" },
  { key: "price_desc", label: "Giá giảm dần", icon: "trending-down-outline" },
  { key: "rating", label: "Đánh giá cao", icon: "star-outline" },
];

const DURATION_OPTIONS: { key: TourSearchDurationOption; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "1", label: "1 ngày" },
  { key: "2_3", label: "2-3 ngày" },
  { key: "4_7", label: "4-7 ngày" },
  { key: "7_plus", label: "7+ ngày" },
];

const RATING_OPTIONS = [0, 3, 4, 5];

const getCategoryMaterialIcon = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes("biển") || normalized.includes("beach")) return "beach";
  if (normalized.includes("thiên nhiên") || normalized.includes("rừng") || normalized.includes("nature")) return "pine-tree";
  if (normalized.includes("văn hóa") || normalized.includes("lịch sử") || normalized.includes("cultural")) return "bank";
  if (normalized.includes("khám phá") || normalized.includes("adventure")) return "hiking";
  if (normalized.includes("thành phố") || normalized.includes("city")) return "city";
  if (normalized.includes("cao cấp") || normalized.includes("luxury")) return "diamond-stone";
  if (normalized.includes("sông") || normalized.includes("lake") || normalized.includes("nước")) return "waves";
  return "map";
};

const getDurationDays = (tour: Tour) => {
  if (typeof tour?.duration?.days === "number") return tour.duration.days;
  const match = String(tour?.duration?.text ?? "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const mapTourToSearchCard = (tour: Tour): SearchTourCard => {
  const adultPrice = extractNumber(tour?.price?.adult);
  const discountPercent = extractNumber(tour?.price?.discount);
  const displayPrice = discountPercent > 0 ? Math.round(adultPrice * (1 - discountPercent / 100)) : adultPrice;

  return {
    id: tour.id,
    name: tour?.name ?? "",
    rating: extractNumber(tour?.rating),
    displayPrice,
    category: tour?.category ?? "",
    durationDays: getDurationDays(tour),
    destinationCity: tour?.destination?.city,
    destinationCountry: tour?.destination?.country,
    discountPercent: discountPercent > 0 ? discountPercent : undefined,
    price: {
      adult: adultPrice,
      child: extractNumber(tour?.price?.child),
      infant: extractNumber(tour?.price?.infant),
      discount: discountPercent,
    },
    originalPrice: discountPercent > 0 ? adultPrice : undefined,
    thumbnail: tour?.images?.[0] ?? "",
    durationText: tour?.duration?.text ?? "N/A",
  };
};

const PriceRangeSlider = ({
  bounds,
  minPrice,
  maxPrice,
  onValuesChange,
}: {
  bounds: TourSearchPriceBounds;
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

export default function TourSearchScreen() {
  const navigation = useNavigation<any>();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [tours, setTours] = useState<SearchTourCard[]>([]);
  const [filters, setFilters] = useState<TourSearchFilters>({
    sortBy: "popular",
    minPrice: 0,
    maxPrice: 5000000,
    duration: "all",
    minRating: 0,
  });
  const [draftFilters, setDraftFilters] = useState<TourSearchFilters>({
    sortBy: "popular",
    minPrice: 0,
    maxPrice: 5000000,
    duration: "all",
    minRating: 0,
  });

  const hasLoadedRef = useRef(false);
  const pullOffsetRef = useRef(0);

  const { showInitialSkeleton, showRefreshSkeleton } = getPullRefreshDisplayState({
    isLoading: loading,
    isRefreshing: refreshing,
    data: tours,
  });

  const fetchTours = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const tourList = await TourService.getTours();
      const mappedTours = tourList.map(mapTourToSearchCard);
      setTours(mappedTours);
      setCategories(buildSuggestedCategories(mappedTours, 8));
    } catch (error: any) {
      console.log("Fetch search tours error:", error);
      MessageBoxService.error("Lỗi", error?.message || "Không lấy được dữ liệu tour.", "OK");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    fetchTours();
  }, [fetchTours]);

  const priceBounds = useMemo(() => getTourSearchPriceBounds(tours, filters.maxPrice), [filters.maxPrice, tours]);
  const draftPriceBounds = useMemo(() => getTourSearchPriceBounds(tours, draftFilters.maxPrice), [draftFilters.maxPrice, tours]);
  const defaultFilters = useMemo(() => createDefaultTourSearchFilters(priceBounds), [priceBounds]);
  const normalizedFilters = useMemo(() => normalizeTourSearchFilters(filters, priceBounds), [filters, priceBounds]);
  const normalizedDraftFilters = useMemo(
    () => normalizeTourSearchFilters(draftFilters, draftPriceBounds),
    [draftFilters, draftPriceBounds]
  );

  useEffect(() => {
    setFilters((prev) => {
      const next = normalizeTourSearchFilters(prev, priceBounds);
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, [priceBounds]);

  useEffect(() => {
    setDraftFilters((prev) => {
      const next = normalizeTourSearchFilters(prev, draftPriceBounds);
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, [draftPriceBounds]);

  const onRefresh = useCallback(async () => {
    if (loading || refreshing) return;
    setRefreshing(true);
    try {
      await fetchTours(true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchTours, loading, refreshing]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY < pullOffsetRef.current) {
      pullOffsetRef.current = offsetY;
    }
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    pullOffsetRef.current = 0;
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    if (
      shouldTriggerOverlayRefresh({
        minOffsetY: pullOffsetRef.current,
        threshold: PULL_REFRESH_THRESHOLD,
        isBusy: refreshing || loading,
      })
    ) {
      onRefresh();
    }
    pullOffsetRef.current = 0;
  }, [loading, onRefresh, refreshing]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count += 1;
    if (normalizedFilters.sortBy !== defaultFilters.sortBy) count += 1;
    if (
      normalizedFilters.minPrice !== defaultFilters.minPrice ||
      normalizedFilters.maxPrice !== defaultFilters.maxPrice
    ) count += 1;
    if (normalizedFilters.duration !== defaultFilters.duration) count += 1;
    if (normalizedFilters.minRating !== defaultFilters.minRating) count += 1;
    return count;
  }, [defaultFilters, normalizedFilters, selectedCategory]);

  const filteredTours = useMemo(
    () => applyTourSearchFilters(tours, search, selectedCategory, normalizedFilters),
    [normalizedFilters, search, selectedCategory, tours]
  );

  const draftResultCount = useMemo(
    () => applyTourSearchFilters(tours, search, selectedCategory, normalizedDraftFilters).length,
    [normalizedDraftFilters, search, selectedCategory, tours]
  );

  const hasActiveFilters = useMemo(
    () => hasActiveTourSearchFilters(normalizedFilters, priceBounds, selectedCategory),
    [normalizedFilters, priceBounds, selectedCategory]
  );

  const showSuggestions = useMemo(
    () => shouldShowTourSearchSuggestions(search, hasActiveFilters),
    [hasActiveFilters, search]
  );

  const suggestedTours = useMemo(() => buildSuggestedTours(tours, 4), [tours]);

  const openFilterModal = useCallback(() => {
    setDraftFilters(normalizedFilters);
    setFilterVisible(true);
  }, [normalizedFilters]);

  const closeFilterModal = useCallback(() => {
    setFilterVisible(false);
  }, []);

  const resetDraftFilters = useCallback(() => {
    setDraftFilters(createDefaultTourSearchFilters(draftPriceBounds));
  }, [draftPriceBounds]);

  const applyFilters = useCallback(() => {
    setFilters(normalizedDraftFilters);
    setFilterVisible(false);
  }, [normalizedDraftFilters]);

  const updateDraftPrice = useCallback((field: "minPrice" | "maxPrice", rawValue: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      [field]: normalizeTourSearchPriceInput(rawValue),
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader
        variant="compact"
        style={styles.header}
        title="Tìm kiếm tour"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchShell}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={UI.slate500} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Nhập tên tour, điểm đến, danh mục..."
            placeholderTextColor={UI.slate400}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {search.length > 0 ? (
            <Pressable onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={UI.slate500} />
            </Pressable>
          ) : null}
        </View>

        <Pressable style={styles.filterButton} onPress={openFilterModal}>
          <Ionicons name="options-outline" size={18} color={UI.slate900} />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {categories.length > 0 ? (
        <View style={styles.categoriesWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <Pressable
                  key={category}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(active ? null : category)}
                >
                  <MaterialCommunityIcons
                    name={getCategoryMaterialIcon(category) as any}
                    size={18}
                    color={active ? UI.white : UI.slate500}
                  />
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
      >
        {showInitialSkeleton || showRefreshSkeleton ? (
          showSuggestions ? (
            <TourSearchSuggestionsSkeleton />
          ) : (
            <ExploreTourSkeletonList count={4} />
          )
        ) : showSuggestions ? (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gợi ý tìm kiếm</Text>
              <Text style={styles.sectionSubtitle}>Chọn nhanh một danh mục hoặc một tour nổi bật để bắt đầu.</Text>
            </View>

            {suggestedTours.length === 0 ? (
              <EmptyState
                icon="search-outline"
                title="Chưa có dữ liệu tour"
                description="Dữ liệu gợi ý sẽ xuất hiện sau khi danh sách tour được tải thành công."
              />
            ) : (
              <View style={styles.resultsList}>
                {suggestedTours.map((tour) => (
                  <Pressable
                    key={tour.id}
                    style={styles.resultCard}
                    onPress={() => navigation.navigate("TourDetailScreen", { id: tour.id })}
                  >
                    <Image source={{ uri: tour.thumbnail }} style={styles.resultImage} resizeMode="cover" />
                    <View style={styles.resultBody}>
                      <View style={styles.resultTop}>
                        <Text style={styles.resultTitle} numberOfLines={2}>
                          {tour.name}
                        </Text>
                        <View style={styles.ratingPill}>
                          <Ionicons name="star" size={13} color="#f59e0b" />
                          <Text style={styles.ratingText}>{Number(tour.rating ?? 0).toFixed(1)}</Text>
                        </View>
                      </View>

                      <Text style={styles.resultLocation} numberOfLines={1}>
                        {[tour.destinationCity, tour.destinationCountry].filter(Boolean).join(", ") || tour.category}
                      </Text>

                      <View style={styles.resultMetaRow}>
                        <View style={styles.metaChip}>
                          <Ionicons name="time-outline" size={14} color={UI.slate500} />
                          <Text style={styles.metaChipText}>{tour.durationText}</Text>
                        </View>
                        <View style={styles.metaChip}>
                          <MaterialCommunityIcons
                            name={getCategoryMaterialIcon(tour.category) as any}
                            size={14}
                            color={UI.slate500}
                          />
                          <Text style={styles.metaChipText}>{tour.category || "Tour"}</Text>
                        </View>
                      </View>

                      <View style={styles.priceRow}>
                        <View>
                          {tour.originalPrice ? <Text style={styles.oldPrice}>{formatPrice(tour.originalPrice)}</Text> : null}
                          <Text style={styles.newPrice}>{formatPrice(tour.displayPrice)}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={UI.primary} />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ) : filteredTours.length === 0 ? (
          <EmptyState
            icon="boat-outline"
            title="Không tìm thấy tour"
            description="Thử đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc để xem nhiều kết quả hơn."
            actionLabel="Đặt lại bộ lọc"
            onAction={() => {
              setSearch("");
              setSelectedCategory(null);
              setFilters(createDefaultTourSearchFilters(priceBounds));
            }}
          />
        ) : (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kết quả tìm kiếm</Text>
              <Text style={styles.sectionSubtitle}>{filteredTours.length} tour phù hợp với bộ lọc hiện tại.</Text>
            </View>

            <View style={styles.resultsList}>
              {filteredTours.map((tour) => (
                <Pressable
                  key={tour.id}
                  style={styles.resultCard}
                  onPress={() => navigation.navigate("TourDetailScreen", { id: tour.id })}
                >
                  <Image source={{ uri: tour.thumbnail }} style={styles.resultImage} resizeMode="cover" />
                  <View style={styles.resultBody}>
                    <View style={styles.resultTop}>
                      <Text style={styles.resultTitle} numberOfLines={2}>
                        {tour.name}
                      </Text>
                      <View style={styles.ratingPill}>
                        <Ionicons name="star" size={13} color="#f59e0b" />
                        <Text style={styles.ratingText}>{Number(tour.rating ?? 0).toFixed(1)}</Text>
                      </View>
                    </View>

                    <Text style={styles.resultLocation} numberOfLines={1}>
                      {[tour.destinationCity, tour.destinationCountry].filter(Boolean).join(", ") || tour.category}
                    </Text>

                    <View style={styles.resultMetaRow}>
                      <View style={styles.metaChip}>
                        <Ionicons name="time-outline" size={14} color={UI.slate500} />
                        <Text style={styles.metaChipText}>{tour.durationText}</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <MaterialCommunityIcons
                          name={getCategoryMaterialIcon(tour.category) as any}
                          size={14}
                          color={UI.slate500}
                        />
                        <Text style={styles.metaChipText}>{tour.category || "Tour"}</Text>
                      </View>
                    </View>

                    <View style={styles.priceRow}>
                      <View>
                        {tour.originalPrice ? <Text style={styles.oldPrice}>{formatPrice(tour.originalPrice)}</Text> : null}
                        <Text style={styles.newPrice}>{formatPrice(tour.displayPrice)}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={UI.primary} />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <LoadingOverlay visible={refreshing} />

      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={closeFilterModal}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeFilterModal} />
          <View style={styles.filterSheet}>
            <View style={styles.handleBar} />
            <View style={styles.filterHeader}>
              <View style={styles.filterHeaderText}>
                <Text style={styles.filterSheetTitle}>Lọc & Sắp xếp</Text>
                <Text style={styles.filterSheetSubtitle}>
                  Tùy chỉnh giá, thời lượng và đánh giá để thu hẹp kết quả tìm kiếm.
                </Text>
              </View>
              <Pressable style={styles.closeIconBtn} onPress={closeFilterModal}>
                <Ionicons name="close" size={18} color={UI.slate900} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sắp xếp theo</Text>
                <View style={styles.optionGrid}>
                  {SORT_OPTIONS.map((option) => {
                    const active = draftFilters.sortBy === option.key;
                    return (
                      <Pressable
                        key={option.key}
                        style={[styles.optionChip, active && styles.optionChipActive]}
                        onPress={() => setDraftFilters((prev) => ({ ...prev, sortBy: option.key }))}
                      >
                        <Ionicons name={option.icon} size={16} color={active ? UI.white : UI.slate700} />
                        <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Khoảng giá</Text>
                <View style={styles.rangeSummary}>
                  <View style={styles.rangeBadge}>
                    <Text style={styles.rangeBadgeLabel}>Tối thiểu</Text>
                    <Text style={styles.rangeBadgeValue}>{formatCompactSearchPrice(normalizedDraftFilters.minPrice)}</Text>
                  </View>
                  <View style={styles.rangeTrack} />
                  <View style={[styles.rangeBadge, styles.rangeBadgeHighlight]}>
                    <Text style={styles.rangeBadgeLabel}>Tối đa</Text>
                    <Text style={styles.rangeBadgeValue}>{formatCompactSearchPrice(normalizedDraftFilters.maxPrice)}</Text>
                  </View>
                </View>
                <PriceRangeSlider
                  bounds={draftPriceBounds}
                  minPrice={normalizedDraftFilters.minPrice}
                  maxPrice={normalizedDraftFilters.maxPrice}
                  onValuesChange={(min, max) => {
                    setDraftFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
                  }}
                />
                <View style={styles.priceInputsRow}>
                  <View style={styles.priceInputCard}>
                    <Text style={styles.priceInputLabel}>Giá tối thiểu</Text>
                    <TextInput
                      value={String(draftFilters.minPrice)}
                      onChangeText={(value) => updateDraftPrice("minPrice", value)}
                      keyboardType="numeric"
                      style={styles.priceInput}
                      placeholder={String(draftPriceBounds.minAvailablePrice)}
                      placeholderTextColor={UI.slate400}
                    />
                  </View>
                  <View style={styles.priceInputCard}>
                    <Text style={styles.priceInputLabel}>Giá tối đa</Text>
                    <TextInput
                      value={String(draftFilters.maxPrice)}
                      onChangeText={(value) => updateDraftPrice("maxPrice", value)}
                      keyboardType="numeric"
                      style={styles.priceInput}
                      placeholder={String(draftPriceBounds.sliderMaxPrice)}
                      placeholderTextColor={UI.slate400}
                    />
                  </View>
                </View>
                <Text style={styles.rangeHint}>
                  Dải giá hiện có: {formatCompactSearchPrice(draftPriceBounds.minAvailablePrice)} -{" "}
                  {formatCompactSearchPrice(draftPriceBounds.maxAvailablePrice)}.
                </Text>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Thời lượng</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.durationScroll}>
                  {DURATION_OPTIONS.map((option) => {
                    const active = draftFilters.duration === option.key;
                    return (
                      <Pressable
                        key={option.key}
                        style={[styles.durationChip, active && styles.durationChipActive]}
                        onPress={() => setDraftFilters((prev) => ({ ...prev, duration: option.key }))}
                      >
                        <Text style={[styles.durationChipText, active && styles.durationChipTextActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Đánh giá</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ratingScroll}>
                  {RATING_OPTIONS.map((rating) => {
                    const active = draftFilters.minRating === rating;
                    return (
                      <Pressable
                        key={String(rating)}
                        style={[styles.ratingChip, active && styles.ratingChipActive]}
                        onPress={() => setDraftFilters((prev) => ({ ...prev, minRating: rating }))}
                      >
                        <Ionicons name="star" size={15} color={active ? "#fef08a" : "#f59e0b"} />
                        <Text style={[styles.ratingChipText, active && styles.ratingChipTextActive]}>
                          {rating === 0 ? "Tất cả" : `${rating}+ sao`}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.sheetActionBar}>
              <Pressable style={styles.resetBtn} onPress={resetDraftFilters}>
                <Text style={styles.resetBtnText}>Đặt lại</Text>
              </Pressable>
              <Pressable style={styles.applyBtn} onPress={applyFilters}>
                <Text style={styles.applyBtnText}>Xem {draftResultCount} kết quả</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const sliderStyles = StyleSheet.create({
  outerWrap: { marginTop: 4, marginBottom: 2 },
  container: { alignSelf: "center", height: 32 },
  trackStyle: { height: 5, borderRadius: 3 },
  track: { backgroundColor: "#e2e8f0", borderRadius: 3 },
  activeTrack: { backgroundColor: theme.colors.primary, borderRadius: 3 },
  thumb: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#fff", borderWidth: 2, borderColor: theme.colors.primary },
  thumbPressed: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#fff", borderWidth: 2, borderColor: theme.colors.primary },
  tickRow: { marginTop: 8, flexDirection: "row", justifyContent: "space-between" },
  tickText: { fontSize: 12, fontWeight: "700", color: UI.slate500 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UI.bgLight },
  header: { backgroundColor: UI.bgLight },
  searchShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    borderRadius: 26,
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.slate200,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: UI.slate900,
    fontWeight: "500",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.slate200,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: UI.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: UI.white,
  },
  categoriesWrap: {
    marginTop: 14,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: UI.slate100,
  },
  categoryChipActive: {
    backgroundColor: UI.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "700",
    color: UI.slate500,
  },
  categoryTextActive: {
    color: UI.white,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 120,
    gap: 18,
  },
  sectionWrap: {
    gap: 18,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: UI.slate900,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: UI.slate500,
  },
  resultsList: {
    gap: 16,
  },
  resultCard: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 24,
    backgroundColor: UI.white,
    padding: 12,
    borderWidth: 1,
    borderColor: UI.slate200,
  },
  resultImage: {
    width: 108,
    height: 108,
    borderRadius: 18,
    backgroundColor: UI.slate100,
  },
  resultBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  resultTop: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  resultTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: UI.slate900,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#fff7ed",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#b45309",
  },
  resultLocation: {
    marginTop: 6,
    fontSize: 13,
    color: UI.slate500,
    fontWeight: "600",
  },
  resultMetaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 10,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: UI.slate100,
  },
  metaChipText: {
    fontSize: 12,
    color: UI.slate700,
    fontWeight: "700",
  },
  priceRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  oldPrice: {
    fontSize: 12,
    color: UI.slate400,
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  newPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: UI.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.18)",
  },
  modalBackdrop: {
    flex: 1,
  },
  filterSheet: {
    maxHeight: "86%",
    backgroundColor: UI.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
  },
  handleBar: {
    alignSelf: "center",
    width: 52,
    height: 5,
    borderRadius: 999,
    backgroundColor: UI.slate200,
    marginBottom: 14,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterHeaderText: {
    flex: 1,
  },
  filterSheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: UI.slate900,
  },
  filterSheetSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: UI.slate500,
  },
  closeIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: UI.slate100,
    alignItems: "center",
    justifyContent: "center",
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 22,
  },
  filterSection: {
    gap: 14,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: UI.slate900,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: UI.slate100,
  },
  optionChipActive: {
    backgroundColor: UI.primary,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: UI.slate700,
  },
  optionChipTextActive: {
    color: UI.white,
  },
  rangeSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rangeBadge: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: UI.slate100,
  },
  rangeBadgeHighlight: {
    backgroundColor: "#eef6ff",
  },
  rangeBadgeLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: UI.slate500,
    textTransform: "uppercase",
  },
  rangeBadgeValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "800",
    color: UI.slate900,
  },
  rangeTrack: {
    width: 20,
    height: 2,
    borderRadius: 2,
    backgroundColor: UI.slate200,
  },
  priceInputsRow: {
    flexDirection: "row",
    gap: 10,
  },
  priceInputCard: {
    flex: 1,
    gap: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: UI.slate100,
  },
  priceInputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: UI.slate500,
  },
  priceInput: {
    fontSize: 15,
    fontWeight: "700",
    color: UI.slate900,
    paddingVertical: 0,
  },
  rangeHint: {
    fontSize: 12,
    lineHeight: 18,
    color: UI.slate500,
  },
  durationScroll: {
    gap: 10,
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: UI.slate100,
  },
  durationChipActive: {
    backgroundColor: UI.primary,
  },
  durationChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: UI.slate700,
  },
  durationChipTextActive: {
    color: UI.white,
  },
  ratingScroll: {
    gap: 10,
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: UI.slate100,
  },
  ratingChipActive: {
    backgroundColor: UI.primary,
  },
  ratingChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: UI.slate700,
  },
  ratingChipTextActive: {
    color: UI.white,
  },
  sheetActionBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: UI.slate200,
  },
  resetBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: UI.slate100,
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: UI.slate700,
  },
  applyBtn: {
    flex: 1.4,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: UI.primary,
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: UI.white,
  },
});
