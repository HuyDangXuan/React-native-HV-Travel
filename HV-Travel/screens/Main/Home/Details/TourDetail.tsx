import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { TourService } from "../../../../services/TourService";
import { MessageBoxService } from "../../../MessageBox/MessageBoxService";
import LoadingOverlay from "../../../Loading/LoadingOverlay";

import OverviewTab from "./TourDetailTabs/OverviewTab";
import ItineraryTab from "./TourDetailTabs/ItineraryTab";
import ReviewTab from "./TourDetailTabs/ReviewTab";
import { FavouriteService } from "../../../../services/FavouriteService";
import { useAuth } from "../../../../context/AuthContext";
import ChatbotButton from "../../../../components/Chatbot/ChatbotButton";
import ChatbotModal from "../../../../components/Chatbot/ChatbotModal";

const { height } = Dimensions.get("window");
const HERO_HEIGHT = height * 0.35;

export type TabKey = "Tổng quan" | "Lịch trình" | "Đánh giá & Xếp hạng";
const TAB_LABELS: TabKey[] = ["Tổng quan", "Lịch trình", "Đánh giá & Xếp hạng"];

// (Optional) type gợi ý để dễ code
type Tour = {
  _id: string;
  name: string;
  category: string;              // hiện là id
  description: string;
  time: string;
  stock: { adult: number; children: number; baby: number };
  vehicle: string;
  gallery: { picture: string }[];
  accomodations: { place: string }[];
  startDate: string;             // ISO string
  price: { adult: number; children: number; baby: number };
  newPrice: { adult: number; children: number; baby: number };
  thumbnail_url?: string;
};


export default function TourDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const tourId: string | undefined = route?.params?.id;

  const [tab, setTab] = useState<TabKey>("Tổng quan");
  const [openInEx, setOpenInEx] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(false);

  const [loading, setLoading] = useState(false);
  const [tour, setTour] = useState<Tour | null>(null);

  const [isFavourite, setIsFavourite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const {token} = useAuth();
  const [openChat, setOpenChat] = useState(false);

  const fetchTourDetail = useCallback(async () => {
    if (!tourId) {
      MessageBoxService.error("Lỗi", "Thiếu id tour.", "OK");
      return;
    }
    setLoading(true);
    try {
      const res = await TourService.getTourDetail(tourId);
      const detail: Tour = res?.data?.data ?? res?.data ?? res;

      setTour(detail);
    } catch (e: any) {
      console.log("Fetch tour detail error:", e);
      MessageBoxService.error("Lỗi", e?.message || "Không lấy được chi tiết tour.", "OK");
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

    // optimistic UI
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
    } catch (e: any) {
      setIsFavourite(!next); // rollback
      MessageBoxService.error("Lỗi", e?.message || "Không thể cập nhật yêu thích", "OK");
    } finally {
      setFavLoading(false);
    }
  }, [tourId, isFavourite]);

  const checkIsFavourite = useCallback(async () => {
    if (!tourId) return;
    if (!token) {
      MessageBoxService.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      navigation.replace("Login");
      return;
    }
    try {
      const res = await FavouriteService.getFavourites(token);
      const list: any[] = res?.data?.data ?? res?.data ?? [];
      setIsFavourite(list.some((f) => String(f?.tour) === String(tourId)));
    } catch {}
  }, [tourId]);

  useEffect(() => {
    checkIsFavourite();
  }, [checkIsFavourite]);


  const heroImage = useMemo(() => {
    return (
      tour?.thumbnail_url ||
      tour?.gallery?.[0]?.picture ||
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80&auto=format&fit=crop"
    );
  }, [tour]);

  const categoryText = useMemo(() => {
  const c = tour?.category;
  return c ? `Category: ${c}` : "Chưa rõ danh mục";
}, [tour?.category]);

  const priceAdult = useMemo(() => {
    // ưu tiên theo schema mới -> fallback theo schema cũ bạn từng dùng
    return (
      tour?.newPrice?.adult ??
      tour?.price?.adult ??
      tour?.newPrice.adult ??
      tour?.price.adult ??
      0
    );
  }, [tour]);

  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

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
  }, [tab, openInEx, openFAQ, tour]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: heroImage }} style={styles.heroImg} resizeMode="cover" />

          <SafeAreaView style={styles.headerButtons}>
            <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
            </Pressable>
            <Pressable
              style={[
                styles.favouriteButton,
                (favLoading || !tourId) && { opacity: 0.6 },
              ]}
              onPress={handleToggleFavourite}
              disabled={favLoading || !tourId}
            >
              <Ionicons
                name={isFavourite ? "heart" : "heart-outline"}
                size={22}
                color={theme.colors.error} // ✅ luôn đỏ: outline đỏ + tim đặc đỏ
              />
            </Pressable>
          </SafeAreaView>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.locationRow}>
            <Ionicons name="pricetag" size={16} color={theme.colors.primary} />
            <Text style={styles.locationText}>{categoryText}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.packageTitle} numberOfLines={2}>
              {tour?.name || "Đang tải..."}
            </Text>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.priceText}>{formatVND(priceAdult)}</Text>
              <Text style={styles.estimatedText}>Giá người lớn</Text>
            </View>
          </View>

          {/* Quick meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={theme.colors.gray} />
              <Text style={styles.metaText}>{tour?.time || "N/A"}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="car-outline" size={16} color={theme.colors.gray} />
              <Text style={styles.metaText}>{tour?.vehicle || "N/A"}</Text>
            </View>
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {TAB_LABELS.map((label) => (
              <TabButton key={label} label={label} active={tab === label} onPress={() => setTab(label)} />
            ))}
          </ScrollView>
        </View>

        {/* Content (tab-based) */}
        <View style={styles.contentWrap}>
          {/* Nếu muốn debug nhanh fields database */}
          {/* <Text>{JSON.stringify(tour, null, 2)}</Text> */}

          {tabContent}
          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.bookBtn}
          onPress={() => navigation.navigate("BookingScreen", { id: tour?._id })}
          disabled={!tour?._id}
        >
          <Text style={styles.bookBtnText}>Đặt vé ngay</Text>
        </Pressable>
      </View>

      <LoadingOverlay visible={loading} />
      <ChatbotButton onPress={() => setOpenChat(true)} />
      <ChatbotModal
        visible={openChat}
        onClose={() => setOpenChat(false)}
        tour={tour}
      />
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
  container: { flex: 1, backgroundColor: theme.colors.surface },
  scrollContent: { paddingBottom: 20 },

  heroWrap: { width: "100%", height: HERO_HEIGHT, minHeight: 220, maxHeight: 380, position: "relative" },
  heroImg: { width: "100%", height: "100%" },

  headerButtons: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  iconBtn: { borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "transparent" },

  favouriteButton: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
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

  locationRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs, marginBottom: theme.spacing.sm },
  locationText: { fontSize: theme.fontSize.xs, color: theme.colors.gray, fontWeight: "500" },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: theme.spacing.md },
  packageTitle: { fontSize: theme.fontSize.xl, fontWeight: "700", color: theme.colors.text, flex: 1, paddingRight: theme.spacing.md },

  priceText: { fontSize: theme.fontSize.xl, fontWeight: "700", color: theme.colors.primary },
  estimatedText: { marginTop: 2, fontSize: theme.fontSize.xs, color: theme.colors.gray, fontWeight: "500" },

  metaRow: { flexDirection: "row", gap: theme.spacing.md, marginBottom: theme.spacing.md },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: theme.fontSize.sm, color: theme.colors.gray, fontWeight: "600" },

  tabRow: { flexDirection: "row", gap: theme.spacing.sm, paddingVertical: 2 },
  tabBtn: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: 999, backgroundColor: theme.colors.surface },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: theme.fontSize.sm, fontWeight: "600", color: theme.colors.gray, maxWidth: 180 },
  tabTextActive: { color: theme.colors.white },

  contentWrap: { paddingHorizontal: theme.spacing.md },

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
  bookBtn: { height: 54, borderRadius: theme.radius.lg, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
  bookBtnText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: "700" },
});
