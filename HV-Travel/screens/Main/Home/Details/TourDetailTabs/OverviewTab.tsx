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

/** type đúng theo API bạn gửi */
type Tour = {
  _id: string;
  name?: string;
  category?: string;
  description?: string;
  information?: string;
  time?: string;
  vehicle?: string;
  startDate?: string;
  thumbnail_url?: string;
  gallery?: { picture?: string }[];
  accomodations?: { place?: string }[];
  stock?: { adult?: number; children?: number; baby?: number };
  price?: { adult?: number; children?: number; baby?: number };
  newPrice?: { adult?: number; children?: number; baby?: number };
  discount?: number;
  rating?: number;
};

type Props = {
  tour: Tour | null;
  openInEx: boolean;
  setOpenInEx: React.Dispatch<React.SetStateAction<boolean>>;
  openFAQ: boolean;
  setOpenFAQ: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function OverviewTab({
  tour,
  openInEx,
  setOpenInEx,
  openFAQ,
  setOpenFAQ,
}: Props) {
  if (!tour) {
    return (
      <View style={{ paddingTop: theme.spacing.md }}>
        <Text style={styles.paragraph}>Đang tải thông tin tour...</Text>
      </View>
    );
  }

  const formatVND = (v?: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v ?? 0);

  const startDateText = tour.startDate
    ? new Date(tour.startDate).toLocaleDateString("vi-VN")
    : "N/A";

  const galleryPics =
    tour.gallery?.map((g) => g?.picture).filter(Boolean) as string[];

  const photoList =
    galleryPics?.length > 0
      ? galleryPics
      : tour.thumbnail_url
        ? [tour.thumbnail_url]
        : [];

  return (
    <>
      {/* Description */}
      <Section title="Giới thiệu">
        <Text style={styles.paragraph}>
          {tour.description || "Chưa có mô tả cho tour này."}
        </Text>
      </Section>

      {/* Trip Highlights (lấy data thật) */}
      <Section title="Thông tin nhanh">
        <View style={styles.highlightsGrid}>
          <HighlightCard
            icon="time-outline"
            title="Thời gian"
            value={tour.time || "N/A"}
          />
          <HighlightCard
            icon="airplane-outline"
            title="Di chuyển"
            value={tour.vehicle || "N/A"}
          />
          <HighlightCard
            icon="calendar-outline"
            title="Khởi hành"
            value={startDateText}
          />
          <HighlightCard
            icon="pricetag-outline"
            title="Giá NL"
            value={formatVND(tour.newPrice?.adult ?? tour.price?.adult)}
          />
        </View>

        {/* Stock */}
        <View style={{ marginTop: theme.spacing.md }}>
          <Text style={styles.subTitle}>Số chỗ còn</Text>
          <Bullet text={`Người lớn: ${tour.stock?.adult ?? "N/A"}`} />
          <Bullet text={`Trẻ em: ${tour.stock?.children ?? "N/A"}`} />
          <Bullet text={`Em bé: ${tour.stock?.baby ?? "N/A"}`} />
        </View>
      </Section>

      {/* Photo Gallery (lấy từ tour.gallery.picture / thumbnail_url) */}
      <Section title="Bộ sưu tập ảnh">
        {photoList.length === 0 ? (
          <Text style={styles.paragraph}>Chưa có ảnh cho tour này.</Text>
        ) : (
          <View style={styles.galleryGrid}>
            {photoList.slice(0, 6).map((uri, i) => (
              <View key={uri + i} style={styles.galleryItem}>
                <Image source={{ uri }} style={styles.galleryImg} resizeMode="cover" />
                {i === 5 && photoList.length > 6 && (
                  <View style={styles.galleryOverlay}>
                    <Text style={styles.galleryMore}>+{photoList.length - 6}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </Section>

      {/* Accomodations */}
      <Section title="Lưu trú">
        {tour.accomodations?.length ? (
          tour.accomodations.map((a, idx) => (
            <Bullet key={a?.place || idx} text={a?.place || "N/A"} />
          ))
        ) : (
          <Text style={styles.paragraph}>Chưa có thông tin lưu trú.</Text>
        )}
      </Section>

      {/* Inclusion & Exclusion (tạm vẫn hardcode như bạn) */}
      <Accordion
        title="Bao gồm & Loại trừ"
        open={openInEx}
        onToggle={() => setOpenInEx((v) => !v)}
      >
        <Text style={styles.subTitle}>Bao gồm</Text>
        <Bullet text="Vé máy bay khứ hồi (hạng phổ thông)" />
        <Bullet text="Khách sạn 4 sao tiêu chuẩn (phòng đôi)" />
        <Bullet text="Các bữa ăn theo chương trình" />

        <Text style={styles.subTitle}>Loại trừ</Text>
        <Bullet text="Chi phí cá nhân (giặt ủi, điện thoại...)" />
        <Bullet text="Phụ thu phòng đơn" />
        <Bullet text="Tiền tip cho hướng dẫn viên và tài xế" />
      </Accordion>

      {/* FAQ (tạm vẫn hardcode) */}
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
      </Accordion>

      {/* Map */}
      <Section title="Vị trí trên bản đồ">
        <View style={styles.mapBox}>
          <Ionicons name="location-outline" size={48} color={theme.colors.gray} />
          <Text style={styles.mapText}>Xem vị trí điểm đến trên bản đồ</Text>
        </View>
      </Section>
    </>
  );
}

/* ---------------- Components ---------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function HighlightCard({ icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <View style={styles.highlightCard}>
      <Ionicons name={icon} size={24} color={theme.colors.primary} />
      <Text style={styles.highlightTitle}>{title}</Text>
      <Text style={styles.highlightValue} numberOfLines={1}>
        {value}
      </Text>
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

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  section: { marginTop: theme.spacing.xl },
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

  highlightsGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  highlightCard: {
    width: (width - theme.spacing.md * 2 - theme.spacing.sm) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  highlightTitle: { fontSize: theme.fontSize.xs, color: theme.colors.gray, marginTop: theme.spacing.xs },
  highlightValue: { fontSize: theme.fontSize.sm, fontWeight: "600", color: theme.colors.text, marginTop: 2, maxWidth: "100%" },

  galleryGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  galleryItem: {
    width: (width - theme.spacing.md * 2 - theme.spacing.sm * 2) / 3,
    height: (width - theme.spacing.md * 2 - theme.spacing.sm * 2) / 3,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  galleryImg: { width: "100%", height: "100%" },
  galleryOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  galleryMore: { color: theme.colors.white, fontWeight: "700", fontSize: theme.fontSize.xl },

  accordionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  subTitle: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },

  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginTop: theme.spacing.sm },
  bulletDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.colors.primary, marginTop: 8, marginRight: theme.spacing.sm },
  bulletText: { flex: 1, color: theme.colors.gray, fontSize: theme.fontSize.sm, lineHeight: 22 },

  faqItem: { marginBottom: theme.spacing.md },
  faqQ: { fontWeight: "600", fontSize: theme.fontSize.sm, color: theme.colors.text, marginBottom: theme.spacing.xs },
  faqA: { color: theme.colors.gray, fontSize: theme.fontSize.sm, lineHeight: 22 },

  mapBox: {
    height: 160,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  mapText: { color: theme.colors.gray, fontSize: theme.fontSize.sm, marginTop: theme.spacing.xs },
});
