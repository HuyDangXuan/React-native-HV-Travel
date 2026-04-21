import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

const PULL_REFRESH_THRESHOLD = 72;

type FavouriteTour = {
  favouriteId: string;
  tourId: string;
  name: string;
  rating: number;
  price: { adult: number; child: number; infant: number; discount?: number };
  displayPrice: number;
  originalPrice?: number;
  discountPercent?: number;
  thumbnail: string;
  durationText: string;
  destinationCity?: string;
  category: string;
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
  const [showFilters, setShowFilters] = useState(false);
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
            destinationCity: tour?.destination?.city,
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

  const filteredFavourites = useMemo(() => {
    if (!selectedCategory) return favourites;
    return favourites.filter((item) => item.category === selectedCategory);
  }, [favourites, selectedCategory]);

  const hasActiveFilter = Boolean(selectedCategory);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: ui.bg }]}>
      <View style={styles.headerTop}>
        <Text style={[styles.headerTitle, { color: ui.textPrimary }]}>{t("favourites.title")}</Text>
        {favourites.length > 0 ? (
          <Pressable
            style={[styles.filterToggleBtn, { backgroundColor: ui.surface, borderColor: ui.border }]}
            onPress={() => setShowFilters((prev) => !prev)}
          >
            <MaterialCommunityIcons
              name={showFilters ? "filter-off-outline" : "filter-outline"}
              size={20}
              color={ui.textPrimary}
            />
            {hasActiveFilter ? (
              <View style={[styles.filterCountPill, { backgroundColor: ui.primary }]}>
                <Text style={[styles.filterCountText, { color: ui.onPrimary }]}>1</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.headerDivider, { borderBottomColor: ui.border }]} />
    </View>
  );

  const renderFilters = () => {
    if (!showFilters || favourites.length === 0) return null;

    return (
      <View style={styles.filterSection}>
        <View style={styles.filterSectionHead}>
          <Text style={[styles.filterSectionTitle, { color: ui.textPrimary }]}>{t("favourites.categoryTitle")}</Text>
          {hasActiveFilter ? (
            <Pressable onPress={() => setSelectedCategory(null)}>
              <Text style={[styles.clearFilterText, { color: ui.primary }]}>{t("favourites.clearFilter")}</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          <Pressable
            style={[
              styles.categoryChip,
              { backgroundColor: ui.mutedSurface, borderColor: ui.border },
              !selectedCategory && styles.categoryChipActive,
              !selectedCategory && { backgroundColor: ui.primary, borderColor: ui.primary },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: ui.textPrimary },
                !selectedCategory && styles.categoryChipTextActive,
                !selectedCategory && { color: ui.onPrimary },
              ]}
            >
              {t("favourites.all")}
            </Text>
          </Pressable>

          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <Pressable
                key={category}
                style={[
                  styles.categoryChip,
                  { backgroundColor: ui.mutedSurface, borderColor: ui.border },
                  active && styles.categoryChipActive,
                  active && { backgroundColor: ui.primary, borderColor: ui.primary },
                ]}
                onPress={() => setSelectedCategory(active ? null : category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: ui.textPrimary },
                    active && styles.categoryChipTextActive,
                    active && { color: ui.onPrimary },
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

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

  const renderTourCard = ({ item }: { item: FavouriteTour }) => (
    <Pressable
      style={[styles.tourCard, { backgroundColor: ui.surface, borderColor: ui.border }]}
      onPress={() => navigation.navigate("TourDetailScreen", { id: item.tourId })}
    >
      <View style={[styles.imageWrap, { backgroundColor: ui.mutedSurface }]}>
        <Image source={{ uri: item.thumbnail }} style={styles.tourImage} resizeMode="cover" />

        {(item.discountPercent ?? 0) > 0 ? (
          <View style={[styles.discountBadge, { backgroundColor: ui.badgeSurface, borderColor: ui.border }]}>
            <Text style={[styles.discountText, { color: ui.primary }]}>-{item.discountPercent}%</Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.removeFavouriteButton, { backgroundColor: ui.actionSurface, borderColor: ui.border }]}
          onPress={() => handleRemoveFavourite(item.tourId)}
        >
          <Ionicons name="heart" size={18} color={ui.error} />
        </Pressable>
      </View>

      <View style={styles.tourContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.tourTitle, { color: ui.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={ui.warning} />
            <Text style={[styles.ratingText, { color: ui.textPrimary }]}>{item.rating || "4.9"}</Text>
          </View>
        </View>

        <Text style={[styles.metaTextSingle, { color: ui.textSecondary }]} numberOfLines={1}>
          {item.destinationCity || t("favourites.defaultDestination")}
        </Text>
        <Text style={[styles.metaTextSingle, { color: ui.textSecondary }]} numberOfLines={1}>
          {item.durationText}
        </Text>
        {item.category ? (
          <Text style={[styles.metaCategory, { color: ui.textSecondary, backgroundColor: ui.mutedSurface }]} numberOfLines={1}>
            {item.category}
          </Text>
        ) : null}

        <View style={styles.priceRow}>
          {item.originalPrice ? (
            <Text style={[styles.oldPrice, { color: ui.placeholder }]}>{formatPrice(item.originalPrice)}</Text>
          ) : null}
          <View style={styles.priceCurrentRow}>
            <Text style={[styles.newPrice, { color: ui.primary }]}>{formatPrice(item.displayPrice)}</Text>
            <Text style={[styles.priceUnit, { color: ui.textSecondary }]}>{t("favourites.perPerson")}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: ui.bg }]} edges={["top"]}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      {renderHeader()}
      {renderFilters()}

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
        <FlatList
          data={filteredFavourites}
          keyExtractor={(item) => item.favouriteId}
          renderItem={renderTourCard}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          scrollEventThrottle={16}
          ListEmptyComponent={renderFilterEmptyState}
        />
      )}

      <LoadingOverlay visible={refreshing} />
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
  filterCountText: {
    color: UI.white,
    fontSize: 10,
    fontWeight: "800",
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
    paddingTop: theme.spacing.md,
    paddingBottom: 120,
    gap: theme.spacing.lg,
  },
  columnWrapper: {
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  tourCard: {
    width: "48%",
    marginBottom: theme.spacing.lg,
  },
  imageWrap: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: UI.surface,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  tourImage: {
    width: "100%",
    aspectRatio: 1,
  },
  discountBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  discountText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "900",
    color: UI.primary,
  },
  removeFavouriteButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  tourContent: {
    paddingTop: 12,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingTop: 2,
  },
  ratingText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: UI.slate900,
  },
  tourTitle: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: "800",
    color: UI.text,
    lineHeight: 22,
  },
  metaTextSingle: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
    color: UI.gray,
  },
  metaCategory: {
    marginTop: 4,
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: UI.slate700,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  priceRow: {
    marginTop: 12,
    gap: 2,
  },
  oldPrice: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: UI.placeholder,
    textDecorationLine: "line-through",
  },
  priceCurrentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    flexWrap: "wrap",
  },
  newPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: UI.primary,
  },
  priceUnit: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: UI.gray,
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
