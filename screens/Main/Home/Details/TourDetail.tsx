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
import { StatusBar } from "expo-status-bar";

import ChatbotButton from "../../../../components/Chatbot/ChatbotButton";
import ChatbotModal from "../../../../components/Chatbot/ChatbotModal";
import SkeletonBlock from "../../../../components/skeleton/SkeletonBlock";
import { useAppTheme, useThemeMode } from "../../../../context/ThemeModeContext";
import { useI18n } from "../../../../context/I18nContext";
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

type TabKey = "overview" | "itinerary" | "reviews";

const TAB_ITEMS: Array<{ key: TabKey; labelKey: string }> = [
  { key: "overview", labelKey: "tourDetail.tabOverview" },
  { key: "itinerary", labelKey: "tourDetail.tabItinerary" },
  { key: "reviews", labelKey: "tourDetail.tabReviews" },
];

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

const SYSTEM_ERROR_PATTERNS = [
  /network request failed/i,
  /failed to fetch/i,
  /fetch failed/i,
  /timeout/i,
  /timed out/i,
  /could not connect/i,
  /connection lost/i,
  /server error/i,
  /unexpected token/i,
];

function isSystemErrorMessage(message: string) {
  return SYSTEM_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

function getErrorMessage(error: unknown, fallback: string) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: unknown }).message ?? "").trim()
      : "";

  if (!message) return fallback;
  return isSystemErrorMessage(message) ? fallback : message;
}

function getCurrencyLocale(locale: string) {
  return locale === "vi" ? "vi-VN" : "en-US";
}

export default function TourDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const tourId: string | undefined = route?.params?.id;

  const { t, locale } = useI18n();
  const appTheme = useAppTheme();
  const { themeName } = useThemeMode();
  const ui = useMemo(
    () => ({
      bg: appTheme.semantic.screenBackground,
      surface: appTheme.semantic.screenSurface,
      mutedSurface: appTheme.semantic.screenMutedSurface,
      elevated: appTheme.semantic.screenElevated,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      border: appTheme.semantic.divider,
      primary: appTheme.colors.primary,
      placeholder: appTheme.colors.placeholder,
      onPrimary: appTheme.colors.white,
      overlay: appTheme.colors.overlay,
      error: appTheme.colors.error,
      success: appTheme.colors.success,
      overlayForeground: "#f8fafc",
      overlayMuted: "rgba(248, 250, 252, 0.34)",
    }),
    [appTheme]
  );
  const styles = useMemo(() => createStyles(ui), [ui]);

  const [tab, setTab] = useState<TabKey>("overview");
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

  const currencyLocale = useMemo(() => getCurrencyLocale(locale), [locale]);

  const formatVND = useCallback(
    (value: number) =>
      new Intl.NumberFormat(currencyLocale, { style: "currency", currency: "VND" }).format(
        value || 0
      ),
    [currencyLocale]
  );

  const fetchTourDetail = useCallback(async () => {
    if (!tourId) {
      MessageBoxService.error(
        t("tourDetail.errorTitle"),
        t("tourDetail.missingTourId"),
        t("common.ok")
      );
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
      MessageBoxService.error(
        t("tourDetail.errorTitle"),
        getErrorMessage(error, t("tourDetail.loadFailed")),
        t("common.ok")
      );
    } finally {
      setLoading(false);
    }
  }, [t, tourId]);

  useEffect(() => {
    fetchTourDetail();
  }, [fetchTourDetail]);

  const handleToggleFavourite = useCallback(async () => {
    if (!tourId) {
      MessageBoxService.error(
        t("tourDetail.errorTitle"),
        t("tourDetail.missingTourId"),
        t("common.ok")
      );
      return;
    }

    const next = !isFavourite;
    setIsFavourite(next);
    setFavLoading(true);

    try {
      if (!token) {
        navigation.replace("LoginScreen");
        return;
      }

      if (next) {
        await FavouriteService.addByTourId(token, tourId);
      } else {
        await FavouriteService.deleteByTourId(token, tourId);
      }
    } catch (error: any) {
      setIsFavourite(!next);
      console.warn(
        "Update favourite failed:",
        getErrorMessage(error, t("tourDetail.updateFavouriteFailed"))
      );
    } finally {
      setFavLoading(false);
    }
  }, [isFavourite, navigation, t, token, tourId]);

  const checkIsFavourite = useCallback(async () => {
    if (!tourId) return;
    if (!token) {
      setIsFavourite(false);
      return;
    }

    try {
      const favourites = await FavouriteService.getFavourites(token);
      const favouriteTourIds = FavouriteService.extractFavouriteTourIds(favourites);
      setIsFavourite(favouriteTourIds.includes(String(tourId)));
    } catch {
      // ignore favourite preload failures here
    }
  }, [token, tourId]);

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
    const category = tour?.category?.trim();
    return category
      ? t("tourDetail.categoryLabel", { category })
      : t("tourDetail.categoryFallback");
  }, [t, tour?.category]);

  const priceAdult = useMemo(() => {
    const base = tour?.price?.adult ?? 0;
    const discount = tour?.price?.discount ?? 0;
    return discount > 0 ? Math.round(base * (1 - discount / 100)) : base;
  }, [tour]);

  const openGallery = useCallback(
    (index = 0) => {
      if (showContentSkeleton || galleryImages.length === 0) return;

      const nextIndex = clampGalleryIndex(index, galleryImages.length);
      setActiveImageIndex(nextIndex);
      setGalleryVisible(true);
    },
    [galleryImages.length, showContentSkeleton]
  );

  const tabContent = useMemo(() => {
    switch (tab) {
      case "overview":
        return (
          <OverviewTab
            tour={tour}
            galleryImages={galleryImages}
            onOpenGallery={openGallery}
            openInEx={openInEx}
            setOpenInEx={setOpenInEx}
            openFAQ={openFAQ}
            setOpenFAQ={setOpenFAQ}
          />
        );
      case "itinerary":
        return <ItineraryTab tour={tour} />;
      case "reviews":
        return <ReviewTab tour={tour} />;
      default:
        return null;
    }
  }, [galleryImages, openFAQ, openGallery, openInEx, tab, tour]);

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
      <StatusBar
        style={themeName === "dark" ? "light" : "dark"}
        backgroundColor={ui.bg}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrap}>
          {showContentSkeleton ? (
            <SkeletonBlock style={styles.heroSkeleton} />
          ) : (
            <Pressable style={styles.heroPressable} onPress={() => openGallery(0)}>
              <Image source={{ uri: heroImage }} style={styles.heroImg} resizeMode="cover" />
              <View style={styles.galleryBadge}>
                <Ionicons name="images-outline" size={14} color={ui.onPrimary} />
                <Text style={styles.galleryBadgeText}>{galleryImages.length}</Text>
              </View>
            </Pressable>
          )}

          <SafeAreaView style={styles.headerButtons} edges={["top"]}>
            <View style={styles.headerInner}>
              <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color={ui.textPrimary} />
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
                  color={ui.error}
                />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.locationRow}>
            <Ionicons name="pricetag" size={16} color={ui.primary} />
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
                  {tour?.name || t("tourDetail.loadingTitle")}
                </Text>

                <View style={styles.priceGroup}>
                  <Text style={styles.priceText}>{formatVND(priceAdult)}</Text>
                  <Text style={styles.estimatedText}>{t("tourDetail.adultPriceLabel")}</Text>
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
                <Ionicons name="time-outline" size={16} color={ui.textSecondary} />
                <Text style={styles.metaText}>
                  {tour?.duration?.text || t("tourDetail.unavailable")}
                </Text>
              </View>

              {tour?.destination?.city && (
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={16} color={ui.textSecondary} />
                  <Text style={styles.metaText}>{tour.destination.city}</Text>
                </View>
              )}
            </View>
          )}

          {showContentSkeleton ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
              {TAB_ITEMS.map((item, index) => (
                <SkeletonBlock
                  key={item.key}
                  style={[styles.tabSkeleton, index === TAB_ITEMS.length - 1 && styles.tabSkeletonWide]}
                />
              ))}
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
              {TAB_ITEMS.map((item) => (
                <TabButton
                  key={item.key}
                  label={t(item.labelKey)}
                  active={tab === item.key}
                  onPress={() => setTab(item.key)}
                  styles={styles}
                  ui={ui}
                />
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
          <Text style={styles.bookBtnText}>{t("tourDetail.bookNow")}</Text>
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
                accessibilityLabel={t("tourDetail.closeGallery")}
              >
                <Ionicons name="close" size={28} color={ui.overlayForeground} />
              </Pressable>

              <Text style={styles.galleryCounter}>
                {activeImageIndex + 1}/{galleryImages.length}
              </Text>

              <View style={styles.iconBtnSpacer} />
            </View>
          </SafeAreaView>

          <SafeAreaView style={styles.galleryFooterSafe} edges={["bottom"]} pointerEvents="box-none">
            <View style={styles.galleryDotsWrap}>
              <View style={styles.galleryDots}>
                {galleryImages.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.galleryDot, index === activeImageIndex && styles.galleryDotActive]}
                  />
                ))}
              </View>
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
  styles,
  ui,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  ui: {
    surface: string;
    mutedSurface: string;
    textPrimary: string;
    textSecondary: string;
    primary: string;
    onPrimary: string;
  };
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tabBtn,
        { backgroundColor: active ? ui.primary : ui.mutedSurface },
        active && styles.tabBtnActive,
      ]}
    >
      <Text style={[styles.tabText, { color: active ? ui.onPrimary : ui.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(ui: {
  bg: string;
  surface: string;
  mutedSurface: string;
  elevated: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  placeholder: string;
  onPrimary: string;
  overlay: string;
  error: string;
  success: string;
  overlayForeground: string;
  overlayMuted: string;
}) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ui.bg,
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
      right: 16,
      bottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: ui.overlay,
    },
    galleryBadgeText: {
      color: ui.onPrimary,
      fontSize: 12,
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
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: ui.surface,
    },
    iconBtnSpacer: {
      width: 40,
      height: 40,
    },
    favouriteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: ui.surface,
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
      marginHorizontal: 16,
      marginTop: -40,
      backgroundColor: ui.surface,
      borderRadius: 24,
      padding: 24,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    locationText: {
      fontSize: 12,
      color: ui.textSecondary,
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
      marginBottom: 16,
      gap: 16,
    },
    packageTitle: {
      flex: 1,
      paddingRight: 16,
      fontSize: 22,
      fontWeight: "700",
      color: ui.textPrimary,
    },
    titleSkeletonGroup: {
      flex: 1,
      gap: 10,
      paddingRight: 16,
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
      fontSize: 22,
      fontWeight: "700",
      color: ui.primary,
    },
    estimatedText: {
      marginTop: 2,
      fontSize: 12,
      color: ui.textSecondary,
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
      gap: 16,
      marginBottom: 16,
      flexWrap: "wrap",
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    metaText: {
      fontSize: 14,
      color: ui.textSecondary,
      fontWeight: "600",
    },
    metaSkeleton: {
      width: 120,
      height: 18,
      borderRadius: 9,
    },
    tabRow: {
      flexDirection: "row",
      gap: 8,
      paddingVertical: 2,
    },
    tabBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
    },
    tabBtnActive: {
      // color is driven inline from runtime theme
    },
    tabText: {
      fontSize: 14,
      fontWeight: "600",
      maxWidth: 180,
    },
    tabTextActive: {},
    tabSkeleton: {
      width: 88,
      height: 36,
      borderRadius: 999,
    },
    tabSkeletonWide: {
      width: 144,
    },
    contentWrap: {
      paddingHorizontal: 16,
    },
    contentSkeletonWrap: {
      gap: 16,
      paddingTop: 16,
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
      padding: 24,
      borderRadius: 24,
      backgroundColor: ui.surface,
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
      padding: 16,
      backgroundColor: ui.surface,
      borderTopWidth: 1,
      borderTopColor: ui.border,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: -2 },
      elevation: 8,
    },
    bookBtn: {
      height: 54,
      borderRadius: 16,
      backgroundColor: ui.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    disabledBookBtn: {
      opacity: 0.7,
    },
    bookBtnText: {
      color: ui.onPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
    galleryModal: {
      flex: 1,
      backgroundColor: ui.bg,
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
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
    },
    galleryCloseBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: ui.overlay,
      zIndex: 220,
      elevation: 220,
    },
    galleryCounter: {
      color: ui.overlayForeground,
      fontSize: 14,
      fontWeight: "700",
    },
    gallerySlide: {
      width,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
    },
    galleryImage: {
      width: width - 32,
      height: "72%",
    },
    galleryFooterSafe: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 210,
      elevation: 210,
    },
    galleryDotsWrap: {
      alignItems: "center",
      paddingBottom: 24,
    },
    galleryDots: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: "rgba(15, 23, 42, 0.48)",
    },
    galleryDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: ui.overlayMuted,
      opacity: 1,
    },
    galleryDotActive: {
      width: 22,
      backgroundColor: ui.overlayForeground,
      opacity: 1,
    },
  });
}
