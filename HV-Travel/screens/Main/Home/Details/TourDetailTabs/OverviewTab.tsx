import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../../config/theme";

const { width } = Dimensions.get("window");

export default function OverviewTab({
  openInEx,
  setOpenInEx,
  openFAQ,
  setOpenFAQ,
}: {
  openInEx: boolean;
  setOpenInEx: React.Dispatch<React.SetStateAction<boolean>>;
  openFAQ: boolean;
  setOpenFAQ: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      {/* Description */}
      <Section title="Giới thiệu">
        <Text style={styles.paragraph}>
          Khám phá vẻ đẹp tuyệt vời của vùng đất này với lịch trình được sắp xếp
          chu đáo. Bạn sẽ được trải nghiệm những địa điểm nổi tiếng nhất, thưởng
          thức ẩm thực đặc sắc và tham gia các hoạt động thú vị. Chúng tôi đảm bảo
          mang đến cho bạn một chuyến đi đáng nhớ với sự kết hợp hoàn hảo giữa
          nghỉ ngơi và khám phá.
        </Text>
      </Section>

      {/* Trip Highlights */}
      <Section title="Điểm nổi bật">
        <View style={styles.highlightsGrid}>
          <HighlightCard
            icon="time-outline"
            title="Thời gian"
            value="3 ngày 2 đêm"
          />
          <HighlightCard
            icon="people-outline"
            title="Nhóm"
            value="2-15 người"
          />
          <HighlightCard
            icon="airplane-outline"
            title="Di chuyển"
            value="Máy bay + Xe"
          />
          <HighlightCard
            icon="restaurant-outline"
            title="Ăn uống"
            value="Bao gồm"
          />
        </View>
      </Section>

      {/* Photo Gallery */}
      <Section title="Bộ sưu tập ảnh">
        <View style={styles.galleryGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.galleryItem}>
              <Image
                source={{
                  uri: `https://images.unsplash.com/photo-${
                    [
                      "1500375592092-40eb2168fd21",
                      "1506905925346-21bda4d32df4",
                      "1507525428034-b723cf961d3e",
                      "1476514525390-8c2c3e8f8e8f",
                      "1469854523086-cc02fe5d8800",
                      "1519904981063-b0cf448d479e"
                    ][i]
                  }?w=400&q=80&auto=format&fit=crop`,
                }}
                style={styles.galleryImg}
                resizeMode="cover"
              />
              {i === 5 && (
                <View style={styles.galleryOverlay}>
                  <Text style={styles.galleryMore}>+12</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </Section>

      {/* Inclusion & Exclusion */}
      <Accordion
        title="Bao gồm & Loại trừ"
        open={openInEx}
        onToggle={() => setOpenInEx((v) => !v)}
      >
        <Text style={styles.subTitle}>Bao gồm</Text>
        <Bullet text="Vé máy bay khứ hồi (hạng phổ thông)" />
        <Bullet text="Khách sạn 4 sao tiêu chuẩn (phòng đôi)" />
        <Bullet text="Các bữa ăn theo chương trình" />
        <Bullet text="Vé tham quan các điểm trong chương trình" />
        <Bullet text="Hướng dẫn viên tiếng Việt" />
        <Bullet text="Bảo hiểm du lịch quốc tế" />

        <Text style={styles.subTitle}>Loại trừ</Text>
        <Bullet text="Chi phí cá nhân (giặt ủi, điện thoại...)" />
        <Bullet text="Phụ thu phòng đơn" />
        <Bullet text="Tiền tip cho hướng dẫn viên và tài xế" />
      </Accordion>

      {/* FAQ */}
      <Accordion
        title="Câu hỏi thường gặp"
        open={openFAQ}
        onToggle={() => setOpenFAQ((v) => !v)}
      >
        <FAQItem
          q="Tôi có thể hủy tour không?"
          a="Bạn có thể hủy tour trước 15 ngày khởi hành và được hoàn 70% chi phí. Hủy trước 7 ngày được hoàn 50%."
        />
        <FAQItem
          q="Tour có phù hợp cho trẻ em không?"
          a="Tour rất phù hợp cho gia đình có trẻ em. Chúng tôi có giá ưu đãi cho trẻ em dưới 12 tuổi."
        />
        <FAQItem
          q="Có cần visa không?"
          a="Tùy thuộc vào quốc tịch của bạn. Công dân Việt Nam không cần visa cho chuyến đi này."
        />
      </Accordion>

      {/* Map */}
      <Section title="Vị trí trên bản đồ">
        <View style={styles.mapBox}>
          <Ionicons name="location-outline" size={48} color={theme.colors.gray} />
          <Text style={styles.mapText}>
            Xem vị trí điểm đến trên bản đồ
          </Text>
        </View>
      </Section>

      {/* Share */}
      <Section title="Chia sẻ">
        <View style={styles.socialRow}>
          <Social icon="logo-facebook" color="#3b5998" />
          <Social icon="logo-twitter" color="#1DA1F2" />
          <Social icon="logo-linkedin" color="#0077b5" />
          <Social icon="logo-whatsapp" color="#25D366" />
        </View>
      </Section>
    </>
  );
}

/* ---------------- Components ---------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function HighlightCard({
  icon,
  title,
  value,
}: {
  icon: any;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.highlightCard}>
      <Ionicons name={icon} size={24} color={theme.colors.primary} />
      <Text style={styles.highlightTitle}>{title}</Text>
      <Text style={styles.highlightValue}>{value}</Text>
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
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <View style={styles.faqItem}>
      <Text style={styles.faqQ}>{q}</Text>
      <Text style={styles.faqA}>{a}</Text>
    </View>
  );
}

function Social({ icon, color }: { icon: any; color: string }) {
  return (
    <Pressable
      style={[styles.socialIcon, { backgroundColor: color }]}
      onPress={() => {}}
    >
      <Ionicons name={icon} size={24} color={theme.colors.white} />
    </Pressable>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
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

  // Highlights
  highlightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  highlightCard: {
    width: (width - theme.spacing.md * 2 - theme.spacing.sm) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  highlightTitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    marginTop: theme.spacing.xs,
  },
  highlightValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 2,
  },

  // Gallery
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

  // Accordion
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  subTitle: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },

  // Bullet
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: theme.spacing.sm,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
    marginRight: theme.spacing.sm,
  },
  bulletText: {
    flex: 1,
    color: theme.colors.gray,
    fontSize: theme.fontSize.sm,
    lineHeight: 22,
  },

  // FAQ
  faqItem: {
    marginBottom: theme.spacing.md,
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

  // Map
  mapBox: {
    height: 160,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  mapText: {
    color: theme.colors.gray,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },

  // Social
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
});