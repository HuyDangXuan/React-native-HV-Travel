import React, { useMemo, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";

import OverviewTab from "./TourDetailTabs/OverviewTab";
import ItineraryTab from "./TourDetailTabs/ItineraryTab";
import ReviewTab from "./TourDetailTabs/ReviewTab";

const { height } = Dimensions.get("window");
const HERO_HEIGHT = height * 0.35;

export type TabKey = "Tổng quan" | "Lịch trình" | "Đánh giá & Xếp hạng";
const TAB_LABELS: TabKey[] = ["Tổng quan", "Lịch trình", "Đánh giá & Xếp hạng"];

export default function TourDetail() {
  const [tab, setTab] = useState<TabKey>("Tổng quan");
  const [openInEx, setOpenInEx] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(false);

  const navigation = useNavigation<any>();

  const tabContent = useMemo(() => {
    switch (tab) {
      case "Tổng quan":
        return (
          <OverviewTab
            openInEx={openInEx}
            setOpenInEx={setOpenInEx}
            openFAQ={openFAQ}
            setOpenFAQ={setOpenFAQ}
          />
        );
      case "Lịch trình":
        return <ItineraryTab />;
      case "Đánh giá & Xếp hạng":
        return <ReviewTab />;
      default:
        return null;
    }
  }, [tab, openInEx, openFAQ]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <View style={styles.heroWrap}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80&auto=format&fit=crop",
            }}
            style={styles.heroImg}
            resizeMode="cover"
          />

          <SafeAreaView style={styles.headerButtons}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => navigation.goBack()}
              android_ripple={{ color: "rgba(255,255,255,0.25)" }}
            >
              <Ionicons
                name="arrow-back"
                size={32}
                color={theme.colors.white}
              />
            </Pressable>

            <Pressable
              style={styles.iconBtn}
              onPress={() => {}}
              android_ripple={{ color: "rgba(255,255,255,0.25)" }}
            >
              <Ionicons
                name="bookmark"
                size={32}
                color={theme.colors.white}
              />
            </Pressable>
          </SafeAreaView>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.locationText}>Quốc gia ở Nam Á</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.packageTitle}>Gói Tour Maldives</Text>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.priceText}>$2500</Text>
              <Text style={styles.estimatedText}>Ước lượng</Text>
            </View>
          </View>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
          >
            {TAB_LABELS.map((label) => (
              <TabButton
                key={label}
                label={label}
                active={tab === label}
                onPress={() => setTab(label)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Content (tab-based) */}
        <View style={styles.contentWrap}>
          {tabContent}

          {/* spacing để tránh bị che bởi CTA */}
          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.bookBtn}
          onPress={() => navigation.navigate("BookingScreen")}
        >
          <Text style={styles.bookBtnText}>Đặt vé ngay</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- Components ---------------- */

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
    <Pressable
      onPress={onPress}
      style={[styles.tabBtn, active && styles.tabBtnActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------------- Styles ---------------- */

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
  heroImg: {
    width: "100%",
    height: "100%",
  },

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
  iconBtn: {
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
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

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },

  packageTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.text,
    flex: 1,
    paddingRight: theme.spacing.md,
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

  contentWrap: {
    paddingHorizontal: theme.spacing.md,
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
  bookBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
});
