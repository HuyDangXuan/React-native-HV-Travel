import React, { useState } from "react";
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
import { Ionicons, Feather } from "@expo/vector-icons";
import theme from "../../../../config/theme";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const HERO_HEIGHT = height * 0.35;

type TabKey = "Overview" | "Itinerary" | "Review & Ratings";

export default function TourDetailScreen({}: any) {
  const [tab, setTab] = useState<TabKey>("Overview");
  const [openInEx, setOpenInEx] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(false);
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
              style={styles.backBtn} 
              onPress={() => navigation.goBack()}
              android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <Ionicons name="arrow-back" size={32} color={theme.colors.white} />
            </Pressable>

            <Pressable 
              style={styles.bookmarkBtn} 
              onPress={() => {}}
              android_ripple={{ color: 'rgba(0,122,255,0.1)' }}
            >
              <Ionicons name="bookmark" size={32} color={theme.colors.white} />
            </Pressable>
          </SafeAreaView>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={theme.colors.primary} />
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
          <View style={styles.tabRow}>
            <TabButton label="Tổng quan" active={tab === "Overview"} onPress={() => setTab("Overview")} />
            <TabButton label="Lịch trình" active={tab === "Itinerary"} onPress={() => setTab("Itinerary")} />
            <TabButton
              label="Đánh giá & Xếp hạng"
              active={tab === "Review & Ratings"}
              onPress={() => setTab("Review & Ratings")}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentWrap}>
          {/* Trip Plan */}
          <Section title="Kế hoạch cho chuyến đi">
            <Text style={styles.paragraph}>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sapiente commodi voluptatum nesciunt repellat maiores rem dolores
              cum quam vitae hic quo optio officiis vel alias vero, quibusdam itaque iste nam.
            </Text>
          </Section>

          {/* Photo Gallery */}
          <Section title="Bộ sưu tập ảnh">
            <View style={styles.galleryGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={styles.galleryItem}>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80&auto=format&fit=crop",
                    }}
                    style={styles.galleryImg}
                    resizeMode="cover"
                  />
                  {i === 5 && (
                    <View style={styles.galleryOverlay}>
                      <Text style={styles.galleryMore}>+3</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </Section>

          {/* Inclusion & Exclusion */}
          <Accordion title="Bao gồm & Loại trừ" open={openInEx} onToggle={() => setOpenInEx((v) => !v)}>
            <Text style={styles.paragraph}>
              There are many variations of passages of Lorem Ipsum available.
            </Text>

            <Text style={styles.subTitle}>Bao gồm</Text>
            <Bullet text="There are many variations of passages." />
            <Bullet text="Majority have suffered alteration some." />
            <Bullet text="Randomised words which look slightly." />

            <Text style={styles.subTitle}>Loại trừ</Text>
            <Bullet text="There are many variations of passages." />
            <Bullet text="Majority have suffered alteration some." />
            <Bullet text="Randomised words which look slightly." />
          </Accordion>

          {/* FAQ */}
          <Accordion title="FAQ" open={openFAQ} onToggle={() => setOpenFAQ((v) => !v)}>
            <FAQItem
              q="01. There are many variations of passages?"
              a="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            />
            <FAQItem
              q="02. There are many variations of passages?"
              a="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            />
            <FAQItem
              q="03. There are many variations of passages?"
              a="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            />
          </Accordion>

          {/* Map */}
          <Section title="Vị trí trên bản đồ">
            <View style={styles.mapBox}>
              <Text style={{ color: theme.colors.gray, fontSize: theme.fontSize.sm }}>Map Placeholder</Text>
            </View>
          </Section>

          {/* Share */}
          <Section title="Chia sẻ chuyến đi">
            <View style={styles.socialRow}>
              <Social icon="logo-facebook" color="#3b5998" />
              <Social icon="logo-twitter" color="#1DA1F2" />
              <Social icon="logo-linkedin" color="#0077b5" />
              <Social icon="logo-whatsapp" color="#25D366" />
            </View>
          </Section>

          {/* spacing để tránh bị che bởi CTA */}
          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.bookBtn} onPress={() => {
          navigation.navigate("BookingScreen");
        }}>
          <Text style={styles.bookBtnText}>Đặt vé ngay</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- Components ---------------- */

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Pressable style={styles.accordionHeader} onPress={onToggle}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons 
          name={open ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={theme.colors.gray} 
        />
      </Pressable>
      {open ? <View style={{ marginTop: theme.spacing.md }}>{children}</View> : null}
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletNumber}>{text}</Text>
    </View>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <Text style={styles.faqQ}>{q}</Text>
      <Text style={styles.faqA}>{a}</Text>
    </View>
  );
}

function Social({ icon, color }: { icon: any; color: string }) {
  return (
    <Pressable style={[styles.socialIcon, { backgroundColor: color }]} onPress={() => {}}>
      <Ionicons name={icon} size={24} color={theme.colors.white} />
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

  backBtn: {
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
},

bookmarkBtn: {
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
    flexWrap: "wrap",
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
  },
  tabTextActive: { 
    color: theme.colors.white,
  },

  contentWrap: {
    paddingHorizontal: theme.spacing.md,
  },

  section: { 
    marginTop: theme.spacing.xl,
  },
  sectionTitle: { 
    fontSize: theme.fontSize.lg, 
    fontWeight: "700", 
    color: theme.colors.text, 
    marginBottom: theme.spacing.md,
  },

  paragraph: { 
    color: theme.colors.gray, 
    fontSize: theme.fontSize.sm, 
    lineHeight: 22,
    fontWeight: "400",
  },

  galleryGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: theme.spacing.sm,
  },
  galleryItem: {
    width: (width - theme.spacing.md * 2 - theme.spacing.sm * 2) / 3,
    height: (width - theme.spacing.md * 2 - theme.spacing.sm * 2) / 3,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  galleryImg: { 
    width: "100%", 
    height: "100%",
  },
  galleryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryMore: { 
    color: theme.colors.white, 
    fontWeight: "700", 
    fontSize: theme.fontSize.xl,
  },

  accordionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
  },

  subTitle: { 
    marginTop: theme.spacing.lg, 
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.md, 
    fontWeight: "700", 
    color: theme.colors.text,
  },
  
  bulletRow: {
    marginTop: theme.spacing.sm,
  },
  bulletNumber: { 
    color: theme.colors.gray, 
    fontSize: theme.fontSize.sm,
    lineHeight: 22,
  },

  faqQ: { 
    fontWeight: "600", 
    fontSize: theme.fontSize.sm, 
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  faqA: { 
    color: theme.colors.gray, 
    fontSize: theme.fontSize.sm, 
    lineHeight: 22,
  },

  mapBox: {
    height: 180,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  socialRow: { 
    flexDirection: "row", 
    gap: theme.spacing.md,
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
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