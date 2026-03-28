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
import theme from "../../../config/theme";
import { useNavigation } from "@react-navigation/native";
import { MessageBoxService } from "../../MessageBox/MessageBoxService";
import LoadingOverlay from "../../Loading/LoadingOverlay";
import { FavouriteService } from "../../../services/FavouriteService";
import { useAuth } from "../../../context/AuthContext";
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
  const { token } = useAuth();
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
        MessageBoxService.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        navigation.replace("Login");
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
            name: tour?.name ?? "Tour không xác định",
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
        "Lỗi",
        error?.message || "Không thể tải danh sách yêu thích",
        "OK"
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [navigation, token]);

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
    (tourId: string) => {
      MessageBoxService.confirm({
        title: "Xác nhận",
        content: "Bạn có chắc muốn xóa tour này khỏi danh sách yêu thích?",
        confirmText: "Xóa",
        cancelText: "Hủy",
        onConfirm: async () => {
          try {
            if (!token) {
              MessageBoxService.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
              navigation.replace("Login");
              return;
            }

            await FavouriteService.deleteByTourId(token, tourId);
            setFavourites((prev) => prev.filter((item) => item.tourId !== tourId));
            MessageBoxService.success("Thành công", "Đã xóa khỏi danh sách yêu thích", "OK");
          } catch (error: any) {
            MessageBoxService.error("Lỗi", error?.message || "Không thể xóa", "OK");
          }
        },
      });
    },
    [navigation, token]
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
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>{"Y\u00eau th\u00edch"}</Text>
        {favourites.length > 0 ? (
          <Pressable style={styles.filterToggleBtn} onPress={() => setShowFilters((prev) => !prev)}>
            <MaterialCommunityIcons
              name={showFilters ? "filter-off-outline" : "filter-outline"}
              size={20}
              color={UI.text}
            />
            {hasActiveFilter ? (
              <View style={styles.filterCountPill}>
                <Text style={styles.filterCountText}>1</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.headerSubtitle}>
        {favourites.length === 0
          ? "L\u01b0u l\u1ea1i c\u00e1c tour b\u1ea1n mu\u1ed1n quay l\u1ea1i sau"
          : `${favourites.length} tour \u0111\u00e3 l\u01b0u`}
      </Text>
      <View style={styles.headerDivider} />
    </View>
  );

  const renderFilters = () => {
    if (!showFilters || favourites.length === 0) return null;

    return (
      <View style={styles.filterSection}>
        <View style={styles.filterSectionHead}>
          <Text style={styles.filterSectionTitle}>Danh mục</Text>
          {hasActiveFilter ? (
            <Pressable onPress={() => setSelectedCategory(null)}>
              <Text style={styles.clearFilterText}>Xóa bộ lọc</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          <Pressable
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
              Tất cả
            </Text>
          </Pressable>

          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <Pressable
                key={category}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(active ? null : category)}
              >
                <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
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
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="heart-outline" size={60} color={UI.primary} />
      </View>
      <Text style={styles.emptyTitle}>Chưa có tour yêu thích</Text>
      <Text style={styles.emptyDesc}>
        Khi bạn lưu tour, chúng sẽ xuất hiện ở đây để tiện theo dõi và đặt lại sau.
      </Text>
      <Pressable style={styles.exploreButton} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.exploreButtonText}>Khám phá tour</Text>
        <Ionicons name="arrow-forward" size={18} color={UI.white} />
      </Pressable>
    </View>
  );

  const renderFilterEmptyState = () => (
    <View style={styles.filterEmptyState}>
      <View style={styles.filterEmptyIcon}>
        <Ionicons name="filter-outline" size={26} color={UI.primary} />
      </View>
      <Text style={styles.filterEmptyTitle}>Không có tour phù hợp bộ lọc</Text>
      <Text style={styles.filterEmptyDesc}>
        Thử xóa bộ lọc hiện tại để xem lại toàn bộ danh sách tour yêu thích.
      </Text>
      <Pressable style={styles.filterResetBtn} onPress={() => setSelectedCategory(null)}>
        <Text style={styles.filterResetBtnText}>Xóa bộ lọc</Text>
      </Pressable>
    </View>
  );

  const renderTourCard = ({ item }: { item: FavouriteTour }) => (
    <Pressable
      style={styles.tourCard}
      onPress={() => navigation.navigate("TourDetailScreen", { id: item.tourId })}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.thumbnail }} style={styles.tourImage} resizeMode="cover" />

        {(item.discountPercent ?? 0) > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discountPercent}%</Text>
          </View>
        ) : null}

        <Pressable
          style={styles.removeFavouriteButton}
          onPress={() => handleRemoveFavourite(item.tourId)}
        >
          <Ionicons name="heart" size={18} color={UI.error} />
        </Pressable>
      </View>

      <View style={styles.tourContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.tourTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating || "4.9"}</Text>
          </View>
        </View>

        <Text style={styles.metaTextSingle} numberOfLines={1}>
          {item.destinationCity || "Việt Nam"}
        </Text>
        <Text style={styles.metaTextSingle} numberOfLines={1}>
          {item.durationText}
        </Text>
        {item.category ? (
          <Text style={styles.metaCategory} numberOfLines={1}>
            {item.category}
          </Text>
        ) : null}

        <View style={styles.priceRow}>
          {item.originalPrice ? (
            <Text style={styles.oldPrice}>{formatPrice(item.originalPrice)}</Text>
          ) : null}
          <View style={styles.priceCurrentRow}>
            <Text style={styles.newPrice}>{formatPrice(item.displayPrice)}</Text>
            <Text style={styles.priceUnit}>/ người</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
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
