import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import theme from "../../../config/theme";
import { useNavigation } from "@react-navigation/native";
import { useI18n } from "../../../context/I18nContext";
import { MessageBoxService } from "../../MessageBox/MessageBoxService";
import LoadingOverlay from "../../Loading/LoadingOverlay";
import { FavouriteService } from "../../../services/FavouriteService";
import { useAuth } from "../../../context/AuthContext";
import { useAppTheme, useThemeMode } from "../../../context/ThemeModeContext";
import { extractNumber } from "../../../utils/PriceUtils";
import { Tour } from "../../../models/Tour";
import { FavouriteItem } from "../../../services/dataAdapters";
import { FavouriteContentSkeleton } from "../../../components/skeleton/MainTabSkeletons";
import { shouldTriggerOverlayRefresh } from "../../../utils/pullToRefresh";
import { getPullRefreshDisplayState } from "../../../utils/loadingState";
import TourCard from "../../../components/tours/TourCard";
import TourCategoryBar from "../../../components/tours/TourCategoryBar";
import TourFilterSheet, { getTourFilterActiveCount } from "../../../components/tours/TourFilterSheet";
import { TourUiCard, TourUiFilterState, TourUiPriceBounds } from "../../../components/tours/tourUiTypes";
import {
  applyTourSearchFilters,
  createDefaultTourSearchFilters,
  getTourSearchDurationDays,
  getTourSearchPriceBounds,
  normalizeTourSearchFilters,
} from "../../../utils/tourSearch";

const PULL_REFRESH_THRESHOLD = 72;
const FALLBACK_PRICE_BOUNDS: TourUiPriceBounds = {
  minAvailablePrice: 0,
  maxAvailablePrice: 5000000,
  sliderMaxPrice: 5000000,
  step: 50000,
  minGap: 50000,
};

type FavouriteTour = TourUiCard & {
  favouriteId: string;
  tourId: string;
  price: { adult: number; child: number; infant: number; discount?: number };
};

const UI = {
  primary: theme.colors.primary,
  background: theme.colors.background,
  surface: theme.colors.surface,
  white: theme.colors.white,
  text: theme.colors.text,
  gray: theme.colors.gray,
  border: theme.colors.border,
  error: theme.colors.error,
  placeholder: theme.colors.placeholder,
  slate700: "#334155",
  slate900: "#0f172a",
  successSoft: "#def7ec",
  pinkSoft: "#ffe4e6",
};

export default function FavouriteScreen() {
  const navigation = useNavigation<any>();
  const { t } = useI18n();
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
      error: appTheme.colors.error,
      warning: appTheme.colors.warning,
      softAccent: themeName === "dark" ? "rgba(34, 211, 238, 0.14)" : "rgba(16, 185, 129, 0.12)",
      badgeSurface: themeName === "dark" ? "rgba(15, 27, 42, 0.9)" : "rgba(255,255,255,0.92)",
      actionSurface: themeName === "dark" ? "rgba(7, 16, 24, 0.86)" : "rgba(255,255,255,0.95)",
    }),
    [appTheme, themeName]
  );
  const hasLoadedRef = useRef(false);
  const pullOffsetRef = useRef(0);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [favourites, setFavourites] = useState<FavouriteTour[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const initialFilters = useMemo(() => createDefaultTourSearchFilters(FALLBACK_PRICE_BOUNDS), []);
  const [filters, setFilters] = useState<TourUiFilterState>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<TourUiFilterState>(initialFilters);
  const [filterVisible, setFilterVisible] = useState(false);
  const { showInitialSkeleton, showRefreshSkeleton } = getPullRefreshDisplayState({
    isLoading: loading,
    isRefreshing: refreshing,
    data: favourites,
  });

  const fetchFavourites = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      if (!token) {
        navigation.replace("MainTabs");
        return;
      }

      const list = await FavouriteService.getFavourites(token);

      const mapped: FavouriteTour[] = list
        .filter((item): item is FavouriteItem & { tourId: Tour } => typeof item?.tourId === "object")
        .map((item) => {
          const tour = item.tourId;
          const adultPrice = extractNumber(tour?.price?.adult);
          const discountPct = extractNumber(tour?.price?.discount);
          const displayPrice =
            discountPct > 0 ? Math.round(adultPrice * (1 - discountPct / 100)) : adultPrice;

          return {
            id: tour.id,
            favouriteId: item.id,
            tourId: tour.id,
            name: tour?.name ?? t("favourites.unknownTour"),
            rating: extractNumber(tour?.rating),
            price: tour?.price ?? { adult: 0, child: 0, infant: 0 },
            displayPrice,
            originalPrice: discountPct > 0 ? adultPrice : undefined,
            discountPercent: discountPct > 0 ? discountPct : undefined,
            thumbnail: tour?.images?.[0] ?? "",
            durationText: tour?.duration?.text ?? "N/A",
            durationDays: getTourSearchDurationDays(tour),
            destinationCity: tour?.destination?.city,
            destinationCountry: tour?.destination?.country,
            category: tour?.category ?? "",
          };
        });

      setFavourites(mapped);
      setCategories(Array.from(new Set(mapped.map((item) => item.category).filter(Boolean))));
    } catch (error: any) {
      console.error("Fetch favourites error:", error);
      MessageBoxService.error(
        t("common.error"),
        error?.message || t("favourites.loadFailed"),
        t("common.ok")
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [navigation, t, token]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    fetchFavourites();
  }, [fetchFavourites]);

  const onRefresh = useCallback(async () => {
    if (refreshing || loading) return;
    setRefreshing(true);
    try {
      await fetchFavourites(true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchFavourites]);

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

  const handleRemoveFavourite = useCallback(
    async (tourId: string) => {
      try {
        if (!token) {
          navigation.replace("LoginScreen");
          return;
        }

        await FavouriteService.deleteByTourId(token, tourId);
        setFavourites((prev) => prev.filter((item) => item.tourId !== tourId));
      } catch (error: any) {
        console.warn("Remove favourite failed:", error?.message || error);
      }
    },
    [navigation, t, token]
  );

  const priceBounds = useMemo(
    () => getTourSearchPriceBounds(favourites, filters.maxPrice),
    [favourites, filters.maxPrice]
  );
  const draftPriceBounds = useMemo(
    () => getTourSearchPriceBounds(favourites, draftFilters.maxPrice),
    [draftFilters.maxPrice, favourites]
  );
  const defaultFilters = useMemo(() => createDefaultTourSearchFilters(priceBounds), [priceBounds]);
  const normalizedFilters = useMemo(
    () => normalizeTourSearchFilters(filters, priceBounds),
    [filters, priceBounds]
  );
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

  const filteredFavourites = useMemo(
    () => applyTourSearchFilters(favourites, "", selectedCategory, normalizedFilters),
    [favourites, normalizedFilters, selectedCategory]
  );

  const draftResultCount = useMemo(
    () => applyTourSearchFilters(favourites, "", selectedCategory, normalizedDraftFilters).length,
    [favourites, normalizedDraftFilters, selectedCategory]
  );

  const activeFilterCount = useMemo(
    () => getTourFilterActiveCount(normalizedFilters, defaultFilters),
    [defaultFilters, normalizedFilters]
  );
  const hasActiveFilter = Boolean(selectedCategory) || activeFilterCount > 0;

  const openFilterModal = useCallback(() => {
    setDraftFilters(normalizedFilters);
    setFilterVisible(true);
  }, [normalizedFilters]);

  const closeFilterModal = useCallback(() => {
    setFilterVisible(false);
  }, []);

  const resetDraftFilters = useCallback(() => {
    setDraftFilters(createDefaultTourSearchFilters(priceBounds));
  }, [priceBounds]);

  const applyFilters = useCallback(() => {
    setFilters(normalizedDraftFilters);
    setFilterVisible(false);
  }, [normalizedDraftFilters]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: ui.bg }]}>
      <View style={styles.headerTop}>
        <Text style={[styles.headerTitle, { color: ui.textPrimary }]}>{t("favourites.title")}</Text>
      </View>
      <View style={[styles.headerDivider, { borderBottomColor: ui.border }]} />
    </View>
  );

  const renderMainEmptyState = () => (
    <View style={[styles.emptyContainer, { backgroundColor: ui.bg }]}>
      <View style={[styles.emptyIconCircle, { backgroundColor: ui.softAccent }]}>
        <Ionicons name="heart-outline" size={60} color={ui.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: ui.textPrimary }]}>{t("favourites.emptyTitle")}</Text>
      <Text style={[styles.emptyDesc, { color: ui.textSecondary }]}>{t("favourites.emptyDescription")}</Text>
      <Pressable style={[styles.exploreButton, { backgroundColor: ui.primary }]} onPress={() => navigation.navigate("Home")}>
        <Text style={[styles.exploreButtonText, { color: ui.onPrimary }]}>{t("favourites.exploreAction")}</Text>
        <Ionicons name="arrow-forward" size={18} color={ui.onPrimary} />
      </Pressable>
    </View>
  );

  const renderFilterEmptyState = () => (
    <View style={[styles.filterEmptyState, { backgroundColor: ui.surface, borderColor: ui.border }]}>
      <View style={[styles.filterEmptyIcon, { backgroundColor: ui.softAccent }]}>
        <Ionicons name="filter-outline" size={26} color={ui.primary} />
      </View>
      <Text style={[styles.filterEmptyTitle, { color: ui.textPrimary }]}>{t("favourites.filteredEmptyTitle")}</Text>
      <Text style={[styles.filterEmptyDesc, { color: ui.textSecondary }]}>{t("favourites.filteredEmptyDescription")}</Text>
      <Pressable style={[styles.filterResetBtn, { backgroundColor: ui.mutedSurface }]} onPress={() => setSelectedCategory(null)}>
        <Text style={[styles.filterResetBtnText, { color: ui.textPrimary }]}>{t("favourites.clearFilter")}</Text>
      </Pressable>
    </View>
  );

  const renderTourCard = (item: FavouriteTour) => (
    <TourCard
      key={item.favouriteId}
      tour={item}
      ui={ui}
      formatPrice={formatPrice}
      perPersonLabel={t("home.perPerson")}
      defaultDestination={t("home.defaultDestination")}
      favouriteActive
      onPress={() => navigation.navigate("TourDetailScreen", { id: item.tourId })}
      onFavouritePress={() => handleRemoveFavourite(item.tourId)}
    />
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: ui.bg }]} edges={["top"]}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      {renderHeader()}
      <TourCategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        ui={ui}
        onSelectCategory={setSelectedCategory}
      />

      {showInitialSkeleton || showRefreshSkeleton ? (
        <View style={styles.loadingContent}>
          <FavouriteContentSkeleton />
        </View>
      ) : favourites.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          scrollEventThrottle={16}
        >
          {renderMainEmptyState()}
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          scrollEventThrottle={16}
        >
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: ui.textPrimary }]}>{t("favourites.title")}</Text>
            <Pressable style={[styles.filterBtn, { borderColor: ui.border, backgroundColor: ui.surface }]} onPress={openFilterModal}>
              <Ionicons name="options-outline" size={16} color={ui.textPrimary} />
              <Text style={[styles.filterText, { color: ui.textPrimary }]}>{t("home.filter")}</Text>
              {hasActiveFilter ? (
                <View style={[styles.filterCountBadge, { backgroundColor: ui.primary }]}>
                  <Text style={[styles.filterCountText, { color: ui.onPrimary }]}>
                    {activeFilterCount + (selectedCategory ? 1 : 0)}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
          {filteredFavourites.length === 0 ? (
            renderFilterEmptyState()
          ) : (
            <View style={styles.grid}>{filteredFavourites.map(renderTourCard)}</View>
          )}
        </ScrollView>
      )}

      <LoadingOverlay visible={refreshing} />
      <TourFilterSheet
        visible={filterVisible}
        ui={ui}
        themeName={themeName}
        t={t}
        draftFilters={draftFilters}
        normalizedDraftFilters={normalizedDraftFilters}
        draftPriceBounds={draftPriceBounds}
        resultCount={draftResultCount}
        onClose={closeFilterModal}
        onReset={resetDraftFilters}
        onApply={applyFilters}
        onDraftFiltersChange={setDraftFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: UI.background,
  },
  loadingContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },

  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    backgroundColor: UI.background,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  filterToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: UI.surface,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  filterCountPill: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    backgroundColor: UI.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: UI.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: UI.gray,
    fontWeight: "500",
    marginBottom: 14,
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: UI.border,
    marginHorizontal: -theme.spacing.lg,
  },
  filterSection: {
    marginTop: 10,
  },
  filterSectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    marginBottom: 10,
  },
  filterSectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "800",
    color: UI.text,
  },
  clearFilterText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: UI.primary,
  },
  categoriesRow: {
    paddingHorizontal: theme.spacing.md,
    gap: 10,
    paddingBottom: 2,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: UI.surface,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryChipActive: {
    backgroundColor: UI.primary,
  },
  categoryChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: UI.slate700,
  },
  categoryChipTextActive: {
    color: UI.white,
  },

  listContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 24,
    paddingBottom: 120,
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
    color: UI.text,
    letterSpacing: -0.5,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: UI.text,
  },
  filterCountBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: UI.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterCountText: {
    color: UI.white,
    fontSize: 11,
    fontWeight: "800",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  emptyContainer: {
    backgroundColor: UI.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: UI.successSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "900",
    color: UI.text,
    textAlign: "center",
  },
  emptyDesc: {
    marginTop: 8,
    fontSize: theme.fontSize.sm,
    color: UI.gray,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "600",
    marginBottom: theme.spacing.lg,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: UI.primary,
    borderRadius: theme.radius.lg,
  },
  exploreButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "800",
    color: UI.white,
  },

  filterEmptyState: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl * 2,
    backgroundColor: UI.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: UI.border,
  },
  filterEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: UI.successSoft,
    marginBottom: 14,
  },
  filterEmptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "800",
    color: UI.text,
    textAlign: "center",
  },
  filterEmptyDesc: {
    marginTop: 8,
    fontSize: theme.fontSize.sm,
    lineHeight: 21,
    color: UI.gray,
    fontWeight: "600",
    textAlign: "center",
  },
  filterResetBtn: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: UI.primary,
  },
  filterResetBtnText: {
    color: UI.white,
    fontSize: theme.fontSize.sm,
    fontWeight: "800",
  },
});
