import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import ChatbotButton from "../../../../components/Chatbot/ChatbotButton";
import ChatbotModal from "../../../../components/Chatbot/ChatbotModal";
import SkeletonBlock from "../../../../components/skeleton/SkeletonBlock";
import theme from "../../../../config/theme";
import { useAuth } from "../../../../context/AuthContext";
import { FavouriteService } from "../../../../services/FavouriteService";
import { TourService } from "../../../../services/TourService";
import { extractNumber } from "../../../../utils/PriceUtils";
import {
  buildTourGalleryImages,
  clampGalleryIndex,
  getTourDetailDisplayState,
} from "../../../../utils/tourDetail";
import LoadingOverlay from "../../../Loading/LoadingOverlay";
import { MessageBoxService } from "../../../MessageBox/MessageBoxService";
import ItineraryTab from "./TourDetailTabs/ItineraryTab";
import OverviewTab from "./TourDetailTabs/OverviewTab";
import ReviewTab from "./TourDetailTabs/ReviewTab";

const { height, width } = Dimensions.get("window");
const HERO_HEIGHT = height * 0.35;

export type TabKey = "Tổng quan" | "Lịch trình" | "Đánh giá & Xếp hạng";
const TAB_LABELS: TabKey[] = ["Tổng quan", "Lịch trình", "Đánh giá & Xếp hạng"];

type TourDetailData = {
  id: string;
  name: string;
  category: string;
  description: string;
  shortDescription?: string;
  destination?: { city: string; country?: string; region?: "North" | "Central" | "South" };
  images: string[];
  duration: { days: number; nights: number; text: string };
  schedule: { day: number; title: string; description: string; activities: string[] }[];
  generatedInclusions?: string[];
  generatedExclusions?: string[];
  startDates: string[];
  maxParticipants: number;
  currentParticipants: number;
  price: { adult: number; child: number; infant: number; discount?: number };
  rating: number;
  reviewCount: number;
  status?: "Active" | "Inactive" | "SoldOut" | "ComingSoon";
};

export default function TourDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const tourId: string | undefined = route?.params?.id;

  const [tab, setTab] = useState<TabKey>("Tổng quan");
  const [openInEx, setOpenInEx] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tour, setTour] = useState<TourDetailData | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { token } = useAuth();
  const galleryRef = useRef<FlatList<string>>(null);

  const fetchTourDetail = useCallback(async () => {
    if (!tourId) {
      MessageBoxService.error("Lỗi", "Thiếu id tour.", "OK");
      return;
    }

    setLoading(true);
    try {
      const data = await TourService.getTourDetail(tourId);

      const detail: TourDetailData = {
        ...data,
        price: {
          adult: extractNumber(data?.price?.adult),
          child: extractNumber(data?.price?.child),
          infant: extractNumber(data?.price?.infant),
          discount: extractNumber(data?.price?.discount),
        },
      };

      setTour(detail);
    } catch (error: any) {
      console.log("Fetch tour detail error:", error);
      MessageBoxService.error("Lỗi", error?.message || "Không lấy được chi tiết tour.", "OK");
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    fetchTourDetail();
  }, [fetchTourDetail]);

  const handleToggleFavourite = useCallback(async () => {
    if (!tourId) {
      MessageBoxService.error("Lỗi", "Thiếu id tour.", "OK");
      return;
    }

    const next = !isFavourite;
    setIsFavourite(next);
    setFavLoading(true);

    try {
      if (!token) {
        MessageBoxService.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        navigation.replace("Login");
        return;
      }

      if (next) {
        await FavouriteService.addByTourId(token, tourId);
        MessageBoxService.success("Thành công", "Đã thêm vào yêu thích", "OK");
      } else {
        await FavouriteService.deleteByTourId(token, tourId);
        MessageBoxService.success("Thành công", "Đã xoá khỏi yêu thích", "OK");
      }
    } catch (error: any) {
      setIsFavourite(!next);
      MessageBoxService.error("Lỗi", error?.message || "Không thể cập nhật yêu thích", "OK");
    } finally {
      setFavLoading(false);
    }
  }, [isFavourite, navigation, token, tourId]);

  const checkIsFavourite = useCallback(async () => {
    if (!tourId) return;
    if (!token) {
      MessageBoxService.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      navigation.replace("Login");
      return;
    }

    try {
      const favourites = await FavouriteService.getFavourites(token);
      const favouriteTourIds = FavouriteService.extractFavouriteTourIds(favourites);
      setIsFavourite(favouriteTourIds.includes(String(tourId)));
    } catch {
      // ignore favourite preload failures here
    }
  }, [navigation, token, tourId]);

  useEffect(() => {
    checkIsFavourite();
  }, [checkIsFavourite]);

  const { showContentSkeleton, showBlockingOverlay } = getTourDetailDisplayState({
    isLoading: loading,
    tour,
  });

  const galleryImages = useMemo(() => buildTourGalleryImages(tour?.images), [tour?.images]);
  const heroImage = useMemo(() => galleryImages[0], [galleryImages]);

  const categoryText = useMemo(() => {
    const category = tour?.category;
    return category ? `Category: ${category}` : "Chưa rõ danh mục";
  }, [tour?.category]);

  const priceAdult = useMemo(() => {
    const base = tour?.price?.adult ?? 0;
    const discount = tour?.price?.discount ?? 0;
    return discount > 0 ? Math.round(base * (1 - discount / 100)) : base;
  }, [tour]);

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

  const tabContent = useMemo(() => {
    switch (tab) {
      case "Tổng quan":
        return (
          <OverviewTab
            tour={tour}
            openInEx={openInEx}
            setOpenInEx={setOpenInEx}
            openFAQ={openFAQ}
            setOpenFAQ={setOpenFAQ}
          />
        );
      case "Lịch trình":
        return <ItineraryTab tour={tour} />;
      case "Đánh giá & Xếp hạng":
        return <ReviewTab tour={tour} />;
      default:
        return null;
    }
  }, [openFAQ, openInEx, tab, tour]);

  const openGallery = useCallback(
    (index = 0) => {
      if (showContentSkeleton) return;

      const nextIndex = clampGalleryIndex(index, galleryImages.length);
      setActiveImageIndex(nextIndex);
      setGalleryVisible(true);
    },
    [galleryImages.length, showContentSkeleton]
  );

  const closeGallery = useCallback(() => {
    setGalleryVisible(false);
  }, []);

  useEffect(() => {
    if (!galleryVisible) return;

    const timeout = setTimeout(() => {
      galleryRef.current?.scrollToIndex({
        index: clampGalleryIndex(activeImageIndex, galleryImages.length),
        animated: false,
      });
    }, 0);

    return () => clearTimeout(timeout);
  }, [activeImageIndex, galleryImages.length, galleryVisible]);

  const handleGalleryScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      setActiveImageIndex(clampGalleryIndex(nextIndex, galleryImages.length));
    },
    [galleryImages.length]
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrap}>
          {showContentSkeleton ? (
            <SkeletonBlock style={styles.heroSkeleton} />
          ) : (
            <Pressable style={styles.heroPressable} onPress={() => openGallery(0)}>
              <Image source={{ uri: heroImage }} style={styles.heroImg} resizeMode="cover" />
              <View style={styles.galleryBadge}>
                <Ionicons name="images-outline" size={14} color={theme.colors.white} />
                <Text style={styles.galleryBadgeText}>{galleryImages.length}</Text>
              </View>
            </Pressable>
          )}

          <SafeAreaView style={styles.headerButtons} edges={["top"]}>
            <View style={styles.headerInner}>
              <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
              </Pressable>

              <Pressable
                style={[
                  styles.favouriteButton,
                  (showContentSkeleton || favLoading || !tourId) && styles.disabledButton,
                ]}
                onPress={handleToggleFavourite}
                disabled={showContentSkeleton || favLoading || !tourId}
              >
                <Ionicons
                  name={isFavourite ? "heart" : "heart-outline"}
                  size={22}
                  color={theme.colors.error}
                />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.locationRow}>
            <Ionicons name="pricetag" size={16} color={theme.colors.primary} />
            {showContentSkeleton ? (
              <SkeletonBlock style={styles.locationSkeleton} />
            ) : (
              <Text style={styles.locationText}>{categoryText}</Text>
            )}
          </View>

          <View style={styles.rowBetween}>
            {showContentSkeleton ? (
              <>
                <View style={styles.titleSkeletonGroup}>
                  <SkeletonBlock style={styles.titleSkeleton} />
                  <SkeletonBlock style={styles.titleSkeletonShort} />
                </View>

                <View style={styles.priceSkeletonGroup}>
                  <SkeletonBlock style={styles.priceSkeleton} />
                  <SkeletonBlock style={styles.priceLabelSkeleton} />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.packageTitle} numberOfLines={2}>
                  {tour?.name || "Đang tải..."}
                </Text>

                <View style={styles.priceGroup}>
                  <Text style={styles.priceText}>{formatVND(priceAdult)}</Text>
                  <Text style={styles.estimatedText}>Giá người lớn</Text>
                </View>
              </>
            )}
          </View>

          {showContentSkeleton ? (
            <View style={styles.metaRow}>
              <SkeletonBlock style={styles.metaSkeleton} />
              <SkeletonBlock style={styles.metaSkeleton} />
            </View>
          ) : (
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={theme.colors.gray} />
                <Text style={styles.metaText}>{tour?.duration?.text || "N/A"}</Text>
              </View>

              {tour?.destination?.city && (
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={16} color={theme.colors.gray} />
                  <Text style={styles.metaText}>{tour.destination.city}</Text>
                </View>
              )}
            </View>
          )}

          {showContentSkeleton ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
              {TAB_LABELS.map((label, index) => (
                <SkeletonBlock
                  key={label}
                  style={[styles.tabSkeleton, index === TAB_LABELS.length - 1 && styles.tabSkeletonWide]}
                />
              ))}
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
              {TAB_LABELS.map((label) => (
                <TabButton key={label} label={label} active={tab === label} onPress={() => setTab(label)} />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.contentWrap}>
          {showContentSkeleton ? (
            <View style={styles.contentSkeletonWrap}>
              <SkeletonBlock style={styles.contentTitleSkeleton} />
              <SkeletonBlock style={styles.contentLineSkeleton} />
              <SkeletonBlock style={styles.contentLineSkeleton} />
              <SkeletonBlock style={styles.contentLineShortSkeleton} />

              <View style={styles.contentCardSkeleton}>
                <SkeletonBlock style={styles.contentCardLine} />
                <SkeletonBlock style={styles.contentCardLineShort} />
                <SkeletonBlock style={styles.contentCardLine} />
              </View>
            </View>
          ) : (
            tabContent
          )}

          <View style={styles.contentBottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.bookBtn, showContentSkeleton && styles.disabledBookBtn]}
          onPress={() => navigation.navigate("BookingScreen", { id: tour?.id || tourId })}
          disabled={showContentSkeleton || (!tour?.id && !tourId)}
        >
          <Text style={styles.bookBtnText}>Đặt vé ngay</Text>
        </Pressable>
      </View>

      <LoadingOverlay visible={showBlockingOverlay} />
      <ChatbotButton onPress={() => setOpenChat(true)} />
      <ChatbotModal visible={openChat} onClose={() => setOpenChat(false)} tour={tour} />

      <Modal
        visible={galleryVisible}
        transparent={false}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={closeGallery}
      >
        <View style={styles.galleryModal}>
          <FlatList
            ref={galleryRef}
            data={galleryImages}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleGalleryScrollEnd}
            renderItem={({ item }) => (
              <View style={styles.gallerySlide}>
                <Image source={{ uri: item }} style={styles.galleryImage} resizeMode="contain" />
              </View>
            )}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />

          <SafeAreaView style={styles.galleryHeaderButtons} edges={["top"]} pointerEvents="box-none">
            <View style={styles.galleryHeaderInner} pointerEvents="box-none">
              <Pressable
                hitSlop={20}
                style={styles.galleryCloseBtn}
                onPress={closeGallery}
                accessibilityRole="button"
                accessibilityLabel="Đóng xem ảnh"
              >
                <Ionicons name="close" size={28} color={theme.colors.white} />
              </Pressable>

              <Text style={styles.galleryCounter}>
                {activeImageIndex + 1}/{galleryImages.length}
              </Text>

              <View style={styles.galleryHeaderSpacer} />
            </View>
          </SafeAreaView>

          <SafeAreaView style={styles.galleryFooterSafe} edges={["bottom"]} pointerEvents="box-none">
            <View style={styles.galleryDots}>
              {galleryImages.map((_, index) => (
                <View
                  key={index}
                  style={[styles.galleryDot, index === activeImageIndex && styles.galleryDotActive]}
                />
              ))}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroWrap: {
    width: "100%",
    height: HERO_HEIGHT,
    minHeight: 220,
    maxHeight: 380,
    position: "relative",
  },
  heroPressable: {
    flex: 1,
  },
  heroImg: {
    width: "100%",
    height: "100%",
  },
  heroSkeleton: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  galleryBadge: {
    position: "absolute",
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(15, 23, 42, 0.58)",
  },
  galleryBadgeText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
  },
  headerButtons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  favouriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  infoCard: {
    marginHorizontal: theme.spacing.md,
    marginTop: -40,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    fontWeight: "500",
  },
  locationSkeleton: {
    width: 140,
    height: 14,
    borderRadius: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  packageTitle: {
    flex: 1,
    paddingRight: theme.spacing.md,
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.text,
  },
  titleSkeletonGroup: {
    flex: 1,
    gap: 10,
    paddingRight: theme.spacing.md,
  },
  titleSkeleton: {
    width: "92%",
    height: 22,
    borderRadius: 10,
  },
  titleSkeletonShort: {
    width: "70%",
    height: 18,
    borderRadius: 10,
  },
  priceGroup: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  estimatedText: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    fontWeight: "500",
  },
  priceSkeletonGroup: {
    alignItems: "flex-end",
    gap: 8,
  },
  priceSkeleton: {
    width: 110,
    height: 24,
    borderRadius: 10,
  },
  priceLabelSkeleton: {
    width: 74,
    height: 12,
    borderRadius: 6,
  },
  metaRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "600",
  },
  metaSkeleton: {
    width: 120,
    height: 18,
    borderRadius: 9,
  },
  tabRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingVertical: 2,
  },
  tabBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.gray,
    maxWidth: 180,
  },
  tabTextActive: {
    color: theme.colors.white,
  },
  tabSkeleton: {
    width: 88,
    height: 36,
    borderRadius: 999,
  },
  tabSkeletonWide: {
    width: 144,
  },
  contentWrap: {
    paddingHorizontal: theme.spacing.md,
  },
  contentSkeletonWrap: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  contentTitleSkeleton: {
    width: 180,
    height: 24,
    borderRadius: 10,
  },
  contentLineSkeleton: {
    width: "100%",
    height: 16,
    borderRadius: 8,
  },
  contentLineShortSkeleton: {
    width: "78%",
    height: 16,
    borderRadius: 8,
  },
  contentCardSkeleton: {
    gap: 12,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  contentCardLine: {
    width: "100%",
    height: 16,
    borderRadius: 8,
  },
  contentCardLineShort: {
    width: "66%",
    height: 16,
    borderRadius: 8,
  },
  contentBottomSpacer: {
    height: 90,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  bookBtn: {
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBookBtn: {
    opacity: 0.7,
  },
  bookBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
  galleryModal: {
    flex: 1,
    backgroundColor: "#050816",
  },
  galleryHeaderButtons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    elevation: 200,
  },
  galleryHeaderInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  galleryCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.68)",
    zIndex: 220,
    elevation: 220,
  },
  galleryHeaderSpacer: {
    width: 40,
    height: 40,
  },
  galleryCounter: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
  },
  gallerySlide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },
  galleryImage: {
    width: width - theme.spacing.lg * 2,
    height: "72%",
  },
  galleryFooterSafe: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  galleryDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingBottom: theme.spacing.lg,
  },
  galleryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  galleryDotActive: {
    width: 18,
    backgroundColor: theme.colors.white,
  },
});
