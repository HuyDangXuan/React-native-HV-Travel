import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Dimensions,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import theme from "../../../config/theme";
import { useI18n } from "../../../context/I18nContext";
import { TourService } from "../../../services/TourService";
import { MessageBoxService } from "../../MessageBox/MessageBoxService";
import LoadingOverlay from "../../Loading/LoadingOverlay";
import { useUser } from "../../../context/UserContext";
import { FavouriteService } from "../../../services/FavouriteService";
import { useAuth } from "../../../context/AuthContext";
import { useAppTheme, useThemeMode } from "../../../context/ThemeModeContext";
import { extractNumber } from "../../../utils/PriceUtils";
import { Tour } from "../../../models/Tour";
import { HomeContentSkeleton } from "../../../components/skeleton/MainTabSkeletons";
import { shouldTriggerOverlayRefresh } from "../../../utils/pullToRefresh";
import { getPullRefreshDisplayState } from "../../../utils/loadingState";

const { width } = Dimensions.get("window");
const FALLBACK_PRICE_MAX = 5000000;
const SLIDER_LENGTH = width - 72;
const PULL_REFRESH_THRESHOLD = 72;

type SortOption = "popular" | "price_asc" | "price_desc" | "rating";
type DurationOption = "all" | "1" | "2_3" | "4_7" | "7_plus";

type FilterState = {
  sortBy: SortOption;
  minPrice: number;
  maxPrice: number;
  duration: DurationOption;
  minRating: number;
};

type PriceBounds = {
  minAvailablePrice: number;
  maxAvailablePrice: number;
  sliderMaxPrice: number;
  step: number;
  minGap: number;
};

type TourCard = {
  id: string;
  name: string;
  rating?: number;
  price: { adult: number; child: number; infant: number; discount?: number };
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

const NEW_COLORS = {
  primary: theme.colors.primary,
  bgLight: theme.colors.background,
  slate900: theme.colors.text,
  slate700: "#334155",
  slate500: theme.colors.gray,
  slate400: theme.colors.placeholder,
  slate200: theme.colors.border,
  slate100: theme.colors.surface,
  slate50: "#f8fafc",
  white: theme.colors.white,
  overlay: "rgba(15, 23, 42, 0.36)",
  successSoft: "#dcfce7",
};

const FALLBACK_PRICE_BOUNDS: PriceBounds = {
  minAvailablePrice: 0,
  maxAvailablePrice: FALLBACK_PRICE_MAX,
  sliderMaxPrice: FALLBACK_PRICE_MAX,
  step: 50000,
  minGap: 50000,
};

const SORT_OPTIONS: { key: SortOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "popular", label: "Phổ biến", icon: "flame-outline" },
  { key: "price_asc", label: "Giá tăng dần", icon: "trending-up-outline" },
  { key: "price_desc", label: "Giá giảm dần", icon: "trending-down-outline" },
  { key: "rating", label: "Đánh giá cao", icon: "star-outline" },
];

const DURATION_OPTIONS: { key: DurationOption; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "1", label: "1 ngày" },
  { key: "2_3", label: "2-3 ngày" },
  { key: "4_7", label: "4-7 ngày" },
  { key: "7_plus", label: "7+ ngày" },
];

const RATING_OPTIONS = [0, 3, 4, 5];

const getSortLabel = (t: (key: string, params?: Record<string, string | number>) => string, key: SortOption) => {
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

const getDurationLabel = (
  t: (key: string, params?: Record<string, string | number>) => string,
  key: DurationOption
) => {
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

const getCategoryMaterialIcon = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes("bien") || c.includes("beach")) return "beach";
  if (c.includes("thien nhien") || c.includes("rung") || c.includes("nature")) return "pine-tree";
  if (c.includes("van hoa") || c.includes("lich su") || c.includes("cultural")) return "bank";
  if (c.includes("kham pha") || c.includes("adventure")) return "hiking";
  if (c.includes("thanh pho") || c.includes("city")) return "city";
  if (c.includes("cao cap") || c.includes("luxury")) return "diamond-stone";
  if (c.includes("song") || c.includes("lake") || c.includes("nuoc")) return "waves";
  if (c.includes("surfing") || c.includes("luot")) return "surfing";
  return "map";
};

const getDurationDays = (tour: any) => {
  if (typeof tour?.duration?.days === "number") return tour.duration.days;
  const match = String(tour?.duration?.text ?? "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
};

const getGreetingByHour = (date = new Date()) => {
  const hour = date.getHours();

  if (hour < 11) return "Chào buổi sáng";
  if (hour < 14) return "Chào buổi trưa";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
};

const matchesDuration = (days: number, option: DurationOption) => {
  switch (option) {
    case "1":
      return days <= 1;
    case "2_3":
      return days >= 2 && days <= 3;
    case "4_7":
      return days >= 4 && days <= 7;
    case "7_plus":
      return days >= 7;
    default:
      return true;
  }
};

const roundUpToStep = (value: number, step: number) => Math.ceil(value / step) * step;

const roundUpPriceCeiling = (value: number) => {
  if (value <= 0) return FALLBACK_PRICE_MAX;
  if (value < 5000000) return roundUpToStep(value, 500000);
  if (value <= 20000000) return roundUpToStep(value, 1000000);
  return roundUpToStep(value, 5000000);
};

const getPriceStep = (maxPrice: number) => {
  if (maxPrice < 5000000) return 50000;
  if (maxPrice <= 20000000) return 100000;
  return 500000;
};

const getPriceBounds = (list: TourCard[], requestedMaxPrice?: number): PriceBounds => {
  const prices = list
    .map((tour) => Number(tour.displayPrice))
    .filter((price) => Number.isFinite(price) && price >= 0);

  if (!prices.length) {
    const sliderMaxPrice = roundUpPriceCeiling(Math.max(requestedMaxPrice ?? 0, FALLBACK_PRICE_MAX));
    const step = getPriceStep(sliderMaxPrice);
    return {
      minAvailablePrice: 0,
      maxAvailablePrice: sliderMaxPrice,
      sliderMaxPrice,
      step,
      minGap: step,
    };
  }

  const minAvailablePrice = Math.min(...prices);
  const maxAvailablePrice = Math.max(...prices);
  const ceilingSeed = Math.max(maxAvailablePrice, requestedMaxPrice ?? 0, minAvailablePrice);
  const sliderMaxPrice = Math.max(roundUpPriceCeiling(ceilingSeed), minAvailablePrice);
  const step = getPriceStep(sliderMaxPrice);

  return {
    minAvailablePrice,
    maxAvailablePrice,
    sliderMaxPrice,
    step,
    minGap: step,
  };
};

const getDefaultFilters = (bounds: PriceBounds): FilterState => ({
  sortBy: "popular",
  minPrice: bounds.minAvailablePrice,
  maxPrice: bounds.sliderMaxPrice,
  duration: "all",
  minRating: 0,
});

const normalizePriceInput = (rawValue: string) => {
  const numericValue = rawValue.replace(/[^\d]/g, "");
  return Math.max(0, Number(numericValue || 0));
};

const normalizePriceFilters = (value: FilterState, bounds: PriceBounds): FilterState => {
  const safeMin = Math.max(bounds.minAvailablePrice, Math.min(value.minPrice, value.maxPrice));
  const safeMax = Math.min(bounds.sliderMaxPrice, Math.max(value.minPrice, value.maxPrice));

  if (safeMax - safeMin < bounds.minGap) {
    const nextMax = Math.min(bounds.sliderMaxPrice, safeMin + bounds.minGap);
    const nextMin = Math.max(bounds.minAvailablePrice, nextMax - bounds.minGap);
    return {
      ...value,
      minPrice: nextMin,
      maxPrice: nextMax,
    };
  }

  return {
    ...value,
    minPrice: safeMin,
    maxPrice: safeMax,
  };
};

const formatCompactPrice = (price: number) => {
  if (price >= 1000000000) {
    const value = price / 1000000000;
    return `${Number.isInteger(value) ? value : value.toFixed(1)}B`;
  }
  if (price >= 1000000) {
    const value = price / 1000000;
    return `${Number.isInteger(value) ? value : value.toFixed(1)}M`;
  }
  if (price >= 1000) return `${Math.round(price / 1000)}K`;
  return String(price);
};

const applyAllFilters = (
  list: TourCard[],
  search: string,
  selectedCategory: string | null,
  filters: FilterState
) => {
  let result = list;

  if (selectedCategory) {
    result = result.filter((tour) => tour.category === selectedCategory);
  }

  const key = search.trim().toLowerCase();
  if (key) {
    result = result.filter((tour) => tour.name.toLowerCase().includes(key));
  }

  result = result.filter((tour) => {
    const rating = Number(tour.rating ?? 0);
    return (
      tour.displayPrice >= filters.minPrice &&
      tour.displayPrice <= filters.maxPrice &&
      matchesDuration(tour.durationDays, filters.duration) &&
      rating >= filters.minRating
    );
  });

  const sorted = [...result];
  switch (filters.sortBy) {
    case "price_asc":
      sorted.sort((a, b) => a.displayPrice - b.displayPrice);
      break;
    case "price_desc":
      sorted.sort((a, b) => b.displayPrice - a.displayPrice);
      break;
    case "rating":
    case "popular":
    default:
      sorted.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
      break;
  }

  return sorted;
};

const PriceRangeSlider = ({
  bounds,
  minPrice,
  maxPrice,
  onValuesChange,
}: {
  bounds: PriceBounds;
  minPrice: number;
  maxPrice: number;
  onValuesChange: (newMin: number, newMax: number) => void;
}) => {
  return (
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
        <Text style={sliderStyles.tickText}>{formatCompactPrice(bounds.minAvailablePrice)}</Text>
        <Text style={sliderStyles.tickText}>{formatCompactPrice(bounds.sliderMaxPrice)}</Text>
      </View>
    </View>
  );
};

const sliderStyles = StyleSheet.create({
  outerWrap: {
    marginTop: 4,
    marginBottom: 2,
  },
  container: {
    alignSelf: "center",
    height: 32,
  },
  trackStyle: {
    height: 5,
    borderRadius: 3,
  },
  track: {
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
  },
  activeTrack: {
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  thumbDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  thumbPressed: {
    transform: [{ scale: 1.08 }],
  },
  tickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginTop: 2,
  },
  tickText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
  },
});

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { t } = useI18n();
  const { user } = useUser();
  const { token } = useAuth();
  const appTheme = useAppTheme();
  const { themeName } = useThemeMode();
  const ui = useMemo(
    () => ({
      bg: appTheme.semantic.screenBackground,
      surface: appTheme.semantic.screenSurface,
      mutedSurface: appTheme.semantic.screenMutedSurface,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      border: appTheme.semantic.divider,
      primary: appTheme.colors.primary,
      placeholder: appTheme.colors.placeholder,
      onPrimary: appTheme.colors.white,
      overlay: appTheme.colors.overlay,
    }),
    [appTheme]
  );
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return t("home.greetingMorning");
    if (hour < 14) return t("home.greetingNoon");
    if (hour < 18) return t("home.greetingAfternoon");
    return t("home.greetingEvening");
  }, [t]);
  const initialFilters = useMemo(() => getDefaultFilters(FALLBACK_PRICE_BOUNDS), []);
  const hasLoadedRef = useRef(false);
  const pullOffsetRef = useRef(0);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<FilterState>(initialFilters);
  const [filterVisible, setFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [tours, setTours] = useState<TourCard[]>([]);
  const [favTourIds, setFavTourIds] = useState<Set<string>>(new Set());
  const [favBusy, setFavBusy] = useState<Set<string>>(new Set());
  const { showInitialSkeleton, showRefreshSkeleton } = getPullRefreshDisplayState({
    isLoading: loading,
    isRefreshing: refreshing,
    data: tours,
  });

  const fetchFavouriteIds = useCallback(async () => {
    try {
      if (!token) return;
      const favourites = await FavouriteService.getFavourites(token);
      setFavTourIds(new Set<string>(FavouriteService.extractFavouriteTourIds(favourites)));
    } catch (e) {
      console.log("fetchFavouriteIds error:", e);
    }
  }, [token]);

  const fetchHomeData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      if (!token) return;
      const tourList = await TourService.getTours(token);

      const mappedTours: TourCard[] = tourList.map((tour: Tour) => {
        const adultPrice = extractNumber(tour?.price?.adult);
        const discountPct = extractNumber(tour?.price?.discount);
        const displayPrice =
          discountPct > 0 ? Math.round(adultPrice * (1 - discountPct / 100)) : adultPrice;

        return {
          id: tour.id,
          name: tour?.name ?? "",
          rating: tour?.rating,
          price: {
            adult: adultPrice,
            child: extractNumber(tour?.price?.child),
            infant: extractNumber(tour?.price?.infant),
            discount: discountPct,
          },
          displayPrice,
          originalPrice: discountPct > 0 ? adultPrice : undefined,
          discountPercent: discountPct > 0 ? discountPct : undefined,
          thumbnail: tour?.images?.[0] ?? "",
          durationText: tour?.duration?.text ?? "N/A",
          durationDays: getDurationDays(tour),
          category: tour?.category ?? "",
          destinationCity: tour?.destination?.city,
          destinationCountry: tour?.destination?.country,
        };
      });

      setTours(mappedTours);
      setCategories(Array.from(new Set(mappedTours.map((tour) => tour.category).filter(Boolean))));
      await fetchFavouriteIds();
    } catch (e: any) {
      console.log("Fetch home error:", e);
      MessageBoxService.error("Lỗi", e?.message || t("home.loadFailed"), "OK");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [fetchFavouriteIds, t]);

  const toggleFavourite = useCallback(
    async (tourId: string) => {
      if (!tourId) return;

      const isFav = favTourIds.has(tourId);
      setFavBusy((prev) => new Set(prev).add(tourId));
      setFavTourIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(tourId);
        else next.add(tourId);
        return next;
      });

      try {
        if (!token) {
          navigation.replace("LoginScreen");
          return;
        }

        if (isFav) {
          await FavouriteService.deleteByTourId(token, tourId);
        } else {
          await FavouriteService.addByTourId(token, tourId);
        }
      } catch (e: any) {
        setFavTourIds((prev) => {
          const next = new Set(prev);
          if (isFav) next.add(tourId);
          else next.delete(tourId);
          return next;
        });
        console.warn("Update favourite failed:", e?.message || e);
      } finally {
        setFavBusy((prev) => {
          const next = new Set(prev);
          next.delete(tourId);
          return next;
        });
      }
    },
    [favTourIds, navigation, t, token]
  );

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    fetchHomeData();
  }, [fetchHomeData]);

  const priceBounds = useMemo(() => getPriceBounds(tours, filters.maxPrice), [filters.maxPrice, tours]);
  const draftPriceBounds = useMemo(
    () => getPriceBounds(tours, draftFilters.maxPrice),
    [draftFilters.maxPrice, tours]
  );
  const defaultFilters = useMemo(() => getDefaultFilters(priceBounds), [priceBounds]);
  const normalizedFilters = useMemo(
    () => normalizePriceFilters(filters, priceBounds),
    [filters, priceBounds]
  );
  const normalizedDraftFilters = useMemo(
    () => normalizePriceFilters(draftFilters, draftPriceBounds),
    [draftFilters, draftPriceBounds]
  );

  useEffect(() => {
    setFilters((prev) => {
      const next = normalizePriceFilters(prev, priceBounds);
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, [priceBounds]);

  useEffect(() => {
    setDraftFilters((prev) => {
      const next = normalizePriceFilters(prev, draftPriceBounds);
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, [draftPriceBounds]);

  const onRefresh = useCallback(async () => {
    if (refreshing || loading) return;
    setRefreshing(true);
    try {
      await fetchHomeData(true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchHomeData]);

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

  const filteredTours = useMemo(
    () => applyAllFilters(tours, search, selectedCategory, normalizedFilters),
    [normalizedFilters, search, selectedCategory, tours]
  );

  const draftResultCount = useMemo(
    () => applyAllFilters(tours, search, selectedCategory, normalizedDraftFilters).length,
    [normalizedDraftFilters, search, selectedCategory, tours]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (normalizedFilters.sortBy !== defaultFilters.sortBy) count += 1;
    if (
      normalizedFilters.minPrice !== defaultFilters.minPrice ||
      normalizedFilters.maxPrice !== defaultFilters.maxPrice
    ) count += 1;
    if (normalizedFilters.duration !== defaultFilters.duration) count += 1;
    if (normalizedFilters.minRating !== defaultFilters.minRating) count += 1;
    return count;
  }, [defaultFilters, normalizedFilters]);

  const openFilterModal = useCallback(() => {
    setDraftFilters(normalizedFilters);
    setFilterVisible(true);
  }, [normalizedFilters]);

  const closeFilterModal = useCallback(() => {
    setFilterVisible(false);
  }, []);

  const resetDraftFilters = useCallback(() => {
    setDraftFilters(getDefaultFilters(priceBounds));
  }, [priceBounds]);

  const applyFilters = useCallback(() => {
    setFilters(normalizedDraftFilters);
    setFilterVisible(false);
  }, [normalizedDraftFilters]);

  const updateDraftPrice = useCallback((field: "minPrice" | "maxPrice", rawValue: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      [field]: normalizePriceInput(rawValue),
    }));
  }, []);



  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: ui.bg }]} edges={["top"]}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      <View style={[styles.headerContainer, { backgroundColor: ui.bg }]}>
        <View style={styles.headerTop}>
          <View style={styles.greetingWrap}>
            {/* <MaterialCommunityIcons name="compass-outline" size={32} color={NEW_COLORS.primary} /> */}
            <View>
              <Text style={[styles.greetingText, { color: ui.textSecondary }]}>{greeting}</Text>
              <Text style={[styles.nameText, { color: ui.textPrimary }]}>{user?.fullName}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={[styles.notificationBtn, { backgroundColor: ui.surface, borderColor: ui.border }]}
              onPress={() => navigation.navigate("TourSearchScreen")}
            >
              <Ionicons name="search-outline" size={22} color={ui.textPrimary} />
            </Pressable>
            <Pressable
              style={[styles.notificationBtn, { backgroundColor: ui.surface, borderColor: ui.border }]}
              onPress={() => navigation.navigate("NotificationScreen")}
            >
              <Ionicons name="notifications-outline" size={26} color={ui.textPrimary} />
              <View style={styles.redDot} />
            </Pressable>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchPill}>
            <View style={styles.searchInputWrap}>
              <Text style={[styles.searchLabel, { color: ui.textSecondary }]}>{t("home.searchLabel")}</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={t("home.searchPlaceholder")}
                placeholderTextColor={ui.placeholder}
                style={[styles.searchInput, { color: ui.textPrimary }]}
              />
            </View>
            <Pressable style={styles.searchButton}>
              <Ionicons name="search" size={20} color={ui.onPrimary} />
            </Pressable>
          </View>
        </View>
      </View>

      {categories.length > 0 ? (
        <View style={[styles.categoriesWrap, { backgroundColor: ui.bg }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((cat, index) => {
              const active = selectedCategory === cat;
              return (
                <Pressable
                  key={cat || index}
                  style={[
                    styles.catItem,
                    { backgroundColor: ui.mutedSurface },
                    active && styles.catItemActive,
                    active && { backgroundColor: ui.primary },
                  ]}
                  onPress={() => setSelectedCategory(active ? null : cat)}
                >
                  <MaterialCommunityIcons
                    name={getCategoryMaterialIcon(cat) as any}
                    size={20}
                    color={active ? ui.onPrimary : ui.textSecondary}
                  />
                  <Text
                    style={[
                      styles.catText,
                      { color: ui.textSecondary, backgroundColor: "transparent" },
                      active && styles.catTextActive,
                      active && { color: ui.onPrimary },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={[styles.headerDivider, { backgroundColor: ui.border }]} />
        </View>
      ) : (
        <View style={[styles.headerDivider, { backgroundColor: ui.border }]} />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
      >
        <View style={styles.mainContent}>
          {showInitialSkeleton || showRefreshSkeleton ? (
            <HomeContentSkeleton />
          ) : (
            <>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: ui.textPrimary }]}>{t("home.recommendedTitle")}</Text>
            <Pressable style={[styles.filterBtn, { borderColor: ui.border, backgroundColor: ui.surface }]} onPress={openFilterModal}>
              <Ionicons name="options-outline" size={16} color={ui.textPrimary} />
              <Text style={[styles.filterText, { color: ui.textPrimary }]}>{t("home.filter")}</Text>
              {activeFilterCount > 0 && (
                <View style={styles.filterCountBadge}>
                  <Text style={styles.filterCountText}>{activeFilterCount}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {filteredTours.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="boat-outline" size={64} color={ui.placeholder} />
              <Text style={[styles.emptyTitle, { color: ui.textPrimary }]}>{t("home.noResultsTitle")}</Text>
              <Text style={[styles.emptyDesc, { color: ui.textSecondary }]}>{t("home.noResultsDescription")}</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredTours.map((tour) => (
                <Pressable
                  key={tour.id}
                  style={[styles.card, { backgroundColor: "transparent" }]}
                  onPress={() => navigation.navigate("TourDetailScreen", { id: tour.id })}
                >
                  <View style={[styles.imageWrap, { backgroundColor: ui.mutedSurface }]}>
                    <Image source={{ uri: tour.thumbnail }} style={styles.image} />

                    <Pressable
                      style={[styles.favBtn, favBusy.has(tour.id) && styles.disabledButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavourite(tour.id);
                      }}
                      disabled={favBusy.has(tour.id)}
                    >
                      <Ionicons
                        name={favTourIds.has(tour.id) ? "heart" : "heart-outline"}
                        size={24}
                        color={favTourIds.has(tour.id) ? "#ef4444" : ui.onPrimary}
                        style={styles.favIconShadow}
                      />
                    </Pressable>

                    {(tour.discountPercent ?? 0) > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{tour.discountPercent}%</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardInfo}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, { color: ui.textPrimary }]} numberOfLines={1}>
                        {tour.name}
                      </Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={[styles.ratingText, { color: ui.textPrimary }]}>{tour.rating || "4.9"}</Text>
                      </View>
                    </View>
                    <Text style={[styles.cardSub, { color: ui.textSecondary }]} numberOfLines={1}>
                      {tour.destinationCity || t("home.defaultDestination")}
                    </Text>
                    <Text style={[styles.cardSub, { color: ui.textSecondary }]} numberOfLines={1}>
                      {tour.durationText}
                    </Text>
                    <View style={styles.priceRow}>
                      {tour.originalPrice ? (
                        <Text style={[styles.oldPrice, { color: ui.placeholder }]}>{formatPrice(tour.originalPrice)}</Text>
                      ) : null}
                      <View style={styles.priceCurrentRow}>
                        <Text style={styles.priceVal}>{formatPrice(tour.displayPrice)}</Text>
                        <Text style={[styles.priceUnit, { color: ui.textSecondary }]}>{t("home.perPerson")}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
            </>
          )}
        </View>

        <View style={styles.showMore}>
          <Text style={[styles.showMoreQuery, { color: ui.textSecondary }]}>
            {t("home.continueExplore", {
              target: selectedCategory ? selectedCategory.toLowerCase() : t("home.destinations"),
            })}
          </Text>
          <Pressable style={[styles.showMoreBtn, { backgroundColor: ui.textPrimary }]}>
            <Text style={[styles.showMoreText, { color: ui.onPrimary }]}>{t("home.showMore")}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.mapFabContainer}>
        <Pressable
          style={[styles.mapFab, { backgroundColor: ui.textPrimary }]}
          onPress={() =>
            navigation.navigate("TourMapScreen", {
              tours: filteredTours.map((tour) => ({
                id: tour.id,
                name: tour.name,
                destinationCity: tour.destinationCity,
                destinationCountry: tour.destinationCountry,
              })),
            })
          }
        >
          <Text style={[styles.mapFabText, { color: ui.onPrimary }]}>{t("home.viewMap")}</Text>
          <Ionicons name="map" size={18} color={ui.onPrimary} />
        </Pressable>
      </View>
      <LoadingOverlay visible={refreshing} />

      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={closeFilterModal}>
        <View style={[styles.modalOverlay, { backgroundColor: ui.overlay }]}>
          <Pressable style={styles.modalBackdrop} onPress={closeFilterModal} />
          <View style={[styles.filterSheet, { backgroundColor: ui.surface }]}>
            <View style={[styles.handleBar, { backgroundColor: ui.border }]} />

            <View style={[styles.filterHeader, { borderBottomColor: ui.border }]}>
              <View>
                <Text style={[styles.filterSheetTitle, { color: ui.textPrimary }]}>{t("home.filterTitle")}</Text>
                <Text style={[styles.filterSheetSubtitle, { color: ui.textSecondary }]}>
                  {t("home.filterSubtitle")}
                </Text>
              </View>
              <Pressable style={[styles.closeIconBtn, { backgroundColor: ui.mutedSurface }]} onPress={closeFilterModal}>
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
                          active && styles.optionChipActive,
                          active && { backgroundColor: ui.primary, borderColor: ui.primary },
                        ]}
                        onPress={() => setDraftFilters((prev) => ({ ...prev, sortBy: option.key }))}
                      >
                        <Ionicons name={option.icon} size={16} color={active ? ui.onPrimary : ui.textPrimary} />
                        <Text
                          style={[
                            styles.optionChipText,
                            { color: active ? ui.onPrimary : ui.textPrimary },
                            active && styles.optionChipTextActive,
                          ]}
                        >
                          {getSortLabel(t, option.key)}
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
                    <Text style={[styles.rangeBadgeValue, { color: ui.textPrimary }]}>{formatCompactPrice(normalizedDraftFilters.minPrice)}</Text>
                  </View>
                  <View style={[styles.rangeTrack, { backgroundColor: ui.border }]} />
                  <View
                    style={[
                      styles.rangeBadge,
                      styles.rangeBadgeHighlight,
                      {
                        backgroundColor: themeName === "dark" ? "rgba(34, 211, 238, 0.12)" : ui.mutedSurface,
                        borderColor: themeName === "dark" ? "rgba(34, 211, 238, 0.35)" : ui.border,
                      },
                    ]}
                  >
                    <Text style={[styles.rangeBadgeLabel, { color: ui.textSecondary }]}>{t("home.maxPrice")}</Text>
                    <Text style={[styles.rangeBadgeValue, { color: ui.textPrimary }]}>{formatCompactPrice(normalizedDraftFilters.maxPrice)}</Text>
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
                    min: formatCompactPrice(draftPriceBounds.minAvailablePrice),
                    max: formatCompactPrice(draftPriceBounds.maxAvailablePrice),
                    sliderMax: formatCompactPrice(draftPriceBounds.sliderMaxPrice),
                  })}
                </Text>
              </View>

              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: ui.textPrimary }]}>{t("home.duration")}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.durationScroll}
                >
                  {DURATION_OPTIONS.map((option) => {
                    const active = draftFilters.duration === option.key;
                    return (
                      <Pressable
                        key={option.key}
                        style={[
                          styles.durationChip,
                          { backgroundColor: ui.mutedSurface, borderColor: ui.border },
                          active && styles.durationChipActive,
                          active && { backgroundColor: ui.primary, borderColor: ui.primary },
                        ]}
                        onPress={() => setDraftFilters((prev) => ({ ...prev, duration: option.key }))}
                      >
                        <Text
                          style={[
                            styles.durationChipText,
                            { color: ui.textPrimary },
                            active && styles.durationChipTextActive,
                            active && { color: ui.onPrimary },
                          ]}
                        >
                          {getDurationLabel(t, option.key)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: ui.textPrimary }]}>{t("home.rating")}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.ratingScroll}
                >
                  {RATING_OPTIONS.map((rating) => {
                    const active = draftFilters.minRating === rating;
                    return (
                      <Pressable
                        key={String(rating)}
                        style={[
                          styles.ratingChip,
                          { backgroundColor: ui.mutedSurface, borderColor: ui.border },
                          active && styles.ratingChipActive,
                          active && { backgroundColor: ui.primary, borderColor: ui.primary },
                        ]}
                        onPress={() => setDraftFilters((prev) => ({ ...prev, minRating: rating }))}
                      >
                        <Ionicons
                          name="star"
                          size={15}
                          color={active ? "#fef08a" : "#f59e0b"}
                        />
                        <Text
                          style={[
                            styles.ratingChipText,
                            { color: ui.textPrimary },
                            active && styles.ratingChipTextActive,
                            active && { color: ui.onPrimary },
                          ]}
                        >
                          {rating === 0 ? t("home.all") : t("home.starsPlus", { count: rating })}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={[styles.sheetActionBar, { borderTopColor: ui.border, backgroundColor: ui.surface }]}>
              <Pressable style={[styles.resetBtn, { backgroundColor: ui.mutedSurface, borderColor: ui.border }]} onPress={resetDraftFilters}>
                <Text style={[styles.resetBtnText, { color: ui.textPrimary }]}>{t("home.reset")}</Text>
              </Pressable>
              <Pressable style={[styles.applyBtn, { backgroundColor: ui.primary }]} onPress={applyFilters}>
                <Text style={[styles.applyBtnText, { color: ui.onPrimary }]}>
                  {t("home.viewResults", { count: draftResultCount })}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NEW_COLORS.bgLight },
  container: { paddingBottom: 100 },

  headerContainer: {
    backgroundColor: NEW_COLORS.bgLight,
    paddingHorizontal: 16,
    paddingBottom: 20,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  greetingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  greetingText: {
    fontSize: 13,
    color: NEW_COLORS.slate500,
    fontWeight: "500",
  },
  nameText: {
    fontSize: 20,
    color: NEW_COLORS.slate900,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NEW_COLORS.white,
    borderWidth: 1,
    borderColor: NEW_COLORS.slate200,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: NEW_COLORS.white,
  },

  searchWrap: {
    display: "none",
  },
  searchPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 32,
    padding: 6,
    shadowColor: NEW_COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
    width: "100%",
    borderWidth: 1,
    borderColor: NEW_COLORS.white,
  },
  searchInputWrap: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: NEW_COLORS.slate500,
    textTransform: "uppercase",
  },
  searchInput: {
    fontSize: 14,
    color: NEW_COLORS.slate900,
    fontWeight: "500",
    padding: 0,
    height: 30,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NEW_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  categoriesWrap: {
    backgroundColor: NEW_COLORS.bgLight,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 24,
  },
  headerDivider: {
    height: 1,
    backgroundColor: NEW_COLORS.slate200,
  },
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: NEW_COLORS.slate100,
    borderWidth: 1,
    borderColor: "transparent",
  },
  catItemActive: {
    backgroundColor: NEW_COLORS.primary,
    shadowColor: NEW_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  catText: {
    fontSize: 13,
    fontWeight: "600",
    color: NEW_COLORS.slate500,
  },
  catTextActive: {
    color: NEW_COLORS.white,
    fontWeight: "800",
  },

  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: NEW_COLORS.slate900,
    letterSpacing: -0.5,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: NEW_COLORS.slate200,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: NEW_COLORS.slate900,
  },
  filterCountBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: NEW_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: "800",
    color: NEW_COLORS.white,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: (width - 32 - 16) / 2,
    marginBottom: 24,
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: NEW_COLORS.slate200,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  favIconShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  discountText: {
    color: NEW_COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  cardInfo: {
    paddingRight: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: NEW_COLORS.slate900,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: NEW_COLORS.slate900,
  },
  cardSub: {
    fontSize: 13,
    color: NEW_COLORS.slate500,
    marginBottom: 2,
    fontWeight: "500",
  },
  priceRow: {
    marginTop: 6,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
  },
  oldPrice: {
    fontSize: 13,
    color: NEW_COLORS.slate400,
    textDecorationLine: "line-through",
  },
  priceCurrentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceVal: {
    fontSize: 16,
    fontWeight: "900",
    color: NEW_COLORS.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: NEW_COLORS.slate500,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NEW_COLORS.slate900,
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: NEW_COLORS.slate500,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  showMore: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  showMoreQuery: {
    fontSize: 15,
    color: NEW_COLORS.slate500,
    marginBottom: 16,
  },
  showMoreBtn: {
    backgroundColor: NEW_COLORS.slate900,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  showMoreText: {
    color: NEW_COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },

  mapFabContainer: {
    position: "absolute",
    bottom: 30,
    left: "50%",
    transform: [{ translateX: -70 }],
    zIndex: 40,
  },
  mapFab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: NEW_COLORS.slate900,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    width: 140,
  },
  mapFabText: {
    color: NEW_COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  filterSheet: {
    backgroundColor: NEW_COLORS.white,
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
    backgroundColor: NEW_COLORS.slate200,
    marginBottom: 14,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterSheetTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: NEW_COLORS.slate900,
  },
  filterSheetSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: NEW_COLORS.slate500,
    maxWidth: 260,
  },
  closeIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NEW_COLORS.slate100,
    alignItems: "center",
    justifyContent: "center",
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },
  filterSection: {
    gap: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: NEW_COLORS.slate900,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: NEW_COLORS.slate200,
    backgroundColor: NEW_COLORS.slate50,
  },
  optionChipActive: {
    backgroundColor: NEW_COLORS.primary,
    borderColor: NEW_COLORS.primary,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: NEW_COLORS.slate700,
  },
  optionChipTextActive: {
    color: NEW_COLORS.white,
  },
  durationScroll: {
    gap: 10,
    paddingRight: 4,
  },
  durationChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: NEW_COLORS.slate200,
    backgroundColor: NEW_COLORS.slate50,
  },
  durationChipActive: {
    backgroundColor: NEW_COLORS.primary,
    borderColor: NEW_COLORS.primary,
  },
  durationChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: NEW_COLORS.slate700,
  },
  durationChipTextActive: {
    color: NEW_COLORS.white,
  },
  ratingScroll: {
    gap: 10,
    paddingRight: 4,
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: NEW_COLORS.slate200,
    backgroundColor: NEW_COLORS.slate50,
  },
  ratingChipActive: {
    backgroundColor: NEW_COLORS.primary,
    borderColor: NEW_COLORS.primary,
  },
  ratingChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: NEW_COLORS.slate700,
  },
  ratingChipTextActive: {
    color: NEW_COLORS.white,
  },
  rangeSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rangeBadge: {
    flex: 1,
    backgroundColor: NEW_COLORS.slate50,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: NEW_COLORS.slate200,
  },
  rangeBadgeHighlight: {
    backgroundColor: NEW_COLORS.successSoft,
    borderColor: "#86efac",
  },
  rangeBadgeLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: NEW_COLORS.slate500,
    textTransform: "uppercase",
  },
  rangeBadgeValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "900",
    color: NEW_COLORS.slate900,
  },
  rangeTrack: {
    width: 20,
    height: 2,
    backgroundColor: NEW_COLORS.slate200,
  },
  priceInputsRow: {
    flexDirection: "row",
    gap: 10,
  },
  priceInputCard: {
    flex: 1,
    backgroundColor: NEW_COLORS.slate50,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: NEW_COLORS.slate200,
  },
  priceInputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: NEW_COLORS.slate500,
    marginBottom: 6,
  },
  priceInput: {
    fontSize: 17,
    fontWeight: "800",
    color: NEW_COLORS.slate900,
    paddingVertical: 0,
  },
  rangeHint: {
    fontSize: 12,
    color: NEW_COLORS.slate500,
    lineHeight: 17,
  },
  sheetActionBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: NEW_COLORS.slate100,
    backgroundColor: NEW_COLORS.white,
  },
  resetBtn: {
    width: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: NEW_COLORS.slate200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NEW_COLORS.slate50,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: NEW_COLORS.slate900,
  },
  applyBtn: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: NEW_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: NEW_COLORS.white,
  },
});
