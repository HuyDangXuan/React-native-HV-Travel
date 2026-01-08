import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { TourService } from "../../../../services/TourService";
import { MessageBoxService } from "../../../MessageBox/MessageBoxService";
import LoadingOverlay from "../../../Loading/LoadingOverlay";

type TourApi = {
  _id: string;
  name: string;
  description?: string;
  time?: string;
  vehicle?: string;
  startDate?: string;

  category?: string;

  accomodations?: { place: string }[];
  stock?: { adult?: number; children?: number; baby?: number };

  price?: { adult?: number; children?: number; baby?: number };
  newPrice?: { adult?: number; children?: number; baby?: number };

  thumbnail_url?: string;
};

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const tourId: string | undefined = route?.params?.id;

  const [showGuestModal, setShowGuestModal] = useState(false);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const [showHotelModal, setShowHotelModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
 
  const [loading, setLoading] = useState(false);
  const [tour, setTour] = useState<TourApi | null>(null);

  const fetchTour = useCallback(async () => {
    if (!tourId) {
      MessageBoxService.error("Lỗi", "Thiếu id tour.", "OK");
      return;
    }
    setLoading(true);
    try {
      const res = await TourService.getTourDetail(tourId);
      // backend bạn đang trả { status: true, data: {...} }
      const detail = res?.data?.data ?? res?.data ?? res;
      setTour(detail);
    } catch (e: any) {
      console.log("Fetch booking tour error:", e);
      MessageBoxService.error("Lỗi", e?.message || "Không lấy được dữ liệu tour.", "OK");
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    fetchTour();
  }, [fetchTour]);

  // ----- Prices from API -----
  const pricePerAdult = useMemo(
    () => tour?.newPrice?.adult ?? tour?.price?.adult ?? 0,
    [tour]
  );
  const pricePerChild = useMemo(
    () => tour?.newPrice?.children ?? tour?.price?.children ?? 0,
    [tour]
  );
  const pricePerInfant = useMemo(
    () => tour?.newPrice?.baby ?? tour?.price?.baby ?? 0,
    [tour]
  );

  // ----- Stock from API (optional validation) -----
  const maxAdult = tour?.stock?.adult ?? 999;
  const maxChildren = tour?.stock?.children ?? 999;
  const maxInfant = tour?.stock?.baby ?? 999;

  const subtotal = adults * pricePerAdult + children * pricePerChild + infants * pricePerInfant;

  // tuỳ bạn: fee/discount có thể lấy từ API sau này; giờ mình giữ như bạn
  const serviceFee = 6000000;
  const discount = 5500000;
  const total = subtotal + serviceFee - discount;

  const formatMoney = (amount: number) => amount.toLocaleString("vi-VN") + "đ";

  const getGuestSummary = () => {
    const parts: string[] = [];
    if (adults > 0) parts.push(`${adults} Người lớn`);
    if (children > 0) parts.push(`${children} Trẻ em`);
    if (infants > 0) parts.push(`${infants} Em bé`);
    return parts.join(", ") || "Chưa chọn";
  };

  const hotelOptions = useMemo(() => {
    return (tour?.accomodations ?? [])
      .map((a) => a?.place)
      .filter(Boolean) as string[];
  }, [tour]);

  // auto chọn cái đầu tiên khi tour load xong (nếu chưa chọn)
  useEffect(() => {
    if (!selectedHotel && hotelOptions.length > 0) {
      setSelectedHotel(hotelOptions[0]);
    }
  }, [hotelOptions, selectedHotel]);

  const dateText = useMemo(() => {
    if (!tour?.startDate) return "N/A";
    const d = new Date(tour.startDate);
    return d.toLocaleDateString("vi-VN");
  }, [tour]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Đặt vé</Text>
        <View style={styles.headerIcon} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Booking Details */}
        <Text style={styles.h2}>Thông tin vé</Text>

        <View style={styles.card}>
          <DetailRow icon="briefcase-outline" label="Gói tour" value={tour?.name || "Đang tải..."} />
          <Divider />
          <DetailRow icon="calendar-outline" label="Thời gian" value={tour?.time || "N/A"} />
          <Divider />
          <SelectableDetailRow
            icon="people-outline"
            label="Số lượng khách"
            value={getGuestSummary()}
            onPress={() => setShowGuestModal(true)}
          />
          <Divider />
          <DetailRow icon="bus-outline" label="Phương tiện" value={tour?.vehicle || "N/A"} />
          <Divider />
          <SelectableDetailRow
            icon="home-outline"
            label="Hotel & Resort"
            value={selectedHotel || (hotelOptions.length ? "Chọn khách sạn" : "N/A")}
            onPress={() => {
              if (!hotelOptions.length) return;
              setShowHotelModal(true);
            }}
          />

          <Divider />
          <DetailRow
            icon="time-outline"
            label="Ngày xuất phát"
            value={dateText}
          />
        </View>

        {/* Payment Summary */}
        <View style={styles.paymentHeader}>
          <Text style={styles.h2}>Tổng thanh toán</Text>
          <Pressable onPress={() => {}}>
            <Text style={styles.addPromo}>Thêm khuyến mãi</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.lineRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{tour?.name || "Tour"}</Text>

              {adults > 0 && (
                <Text style={styles.itemSub}>
                  {adults} Người lớn x {formatMoney(pricePerAdult)}
                </Text>
              )}
              {children > 0 && (
                <Text style={styles.itemSub}>
                  {children} Trẻ em x {formatMoney(pricePerChild)}
                </Text>
              )}
              {infants > 0 && (
                <Text style={styles.itemSub}>
                  {infants} Em bé x {formatMoney(pricePerInfant)}
                </Text>
              )}
            </View>

            <Text style={styles.money}>{formatMoney(subtotal)}</Text>
          </View>

          <View style={styles.rule} />

          <View style={styles.lineRow}>
            <Text style={styles.muted}>Tổng phụ</Text>
            <Text style={styles.money}>{formatMoney(subtotal)}</Text>
          </View>

          <View style={styles.lineRow}>
            <Text style={styles.muted}>Phí dịch vụ</Text>
            <Text style={styles.money}>{formatMoney(serviceFee)}</Text>
          </View>

          <View style={styles.lineRow}>
            <Text style={styles.muted}>Giảm giá</Text>
            <Text style={styles.money}>-{formatMoney(discount)}</Text>
          </View>

          <View style={styles.rule} />

          <View style={styles.lineRow}>
            <Text style={styles.totalLabel}>Tổng</Text>
            <Text style={styles.totalMoney}>{formatMoney(total)}</Text>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.cta}
          onPress={() => navigation.navigate("PaymentMethodScreen", { id: tour?._id, total })}
          disabled={!tour?._id}
        >
          <Text style={styles.ctaText}>Thanh toán</Text>
        </Pressable>
      </View>

      {/* Guest Selection Modal */}
      <Modal visible={showGuestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowGuestModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn số lượng khách</Text>
              <Pressable onPress={() => setShowGuestModal(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <GuestCounter
                label="Người lớn"
                subtitle="Từ 12 tuổi trở lên"
                value={adults}
                onDecrement={() => setAdults(Math.max(1, adults - 1))}
                onIncrement={() => setAdults(Math.min(maxAdult, adults + 1))}
                minValue={1}
                maxValue={maxAdult}
              />

              <GuestCounter
                label="Trẻ em"
                subtitle="Từ 2-11 tuổi"
                value={children}
                onDecrement={() => setChildren(Math.max(0, children - 1))}
                onIncrement={() => setChildren(Math.min(maxChildren, children + 1))}
                minValue={0}
                maxValue={maxChildren}
              />

              <GuestCounter
                label="Em bé"
                subtitle="Dưới 2 tuổi"
                value={infants}
                onDecrement={() => setInfants(Math.max(0, infants - 1))}
                onIncrement={() => setInfants(Math.min(maxInfant, infants + 1))}
                minValue={0}
                maxValue={maxInfant}
              />
            </View>

            <View style={styles.modalFooter}>
              <Pressable style={styles.modalBtn} onPress={() => setShowGuestModal(false)}>
                <Text style={styles.modalBtnText}>Xác nhận</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Hotel Selection Modal */}
      <Modal visible={showHotelModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowHotelModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn khách sạn / resort</Text>
              <Pressable onPress={() => setShowHotelModal(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {hotelOptions.length === 0 ? (
                <Text style={{ color: theme.colors.gray, fontWeight: "600" }}>
                  Tour này chưa có danh sách khách sạn.
                </Text>
              ) : (
                hotelOptions.map((place) => {
                  const active = place === selectedHotel;
                  return (
                    <Pressable
                      key={place}
                      style={[
                        styles.hotelOption,
                        active && styles.hotelOptionActive,
                      ]}
                      onPress={() => setSelectedHotel(place)}
                    >
                      <Text
                        style={[
                          styles.hotelOptionText,
                          active && styles.hotelOptionTextActive,
                        ]}
                      >
                        {place}
                      </Text>

                      {active && (
                        <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                      )}
                    </Pressable>
                  );
                })
              )}
            </View>

            <View style={styles.modalFooter}>
              <Pressable style={styles.modalBtn} onPress={() => setShowHotelModal(false)}>
                <Text style={styles.modalBtnText}>Xác nhận</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>


      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}

/* ---------- Small components ---------- */

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={theme.colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function SelectableDetailRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: any;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={theme.colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={2}>
          {value}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
    </Pressable>
  );
}

function GuestCounter({
  label,
  subtitle,
  value,
  onDecrement,
  onIncrement,
  minValue,
  maxValue,
}: {
  label: string;
  subtitle: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  minValue: number;
  maxValue: number;
}) {
  return (
    <View style={styles.counterRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.counterLabel}>{label}</Text>
        <Text style={styles.counterSubtitle}>{subtitle}</Text>
        <Text style={[styles.counterSubtitle, { marginTop: 2 }]}>
          Còn {maxValue} chỗ
        </Text>
      </View>

      <View style={styles.counterControls}>
        <Pressable
          style={[styles.counterBtn, value <= minValue && styles.counterBtnDisabled]}
          onPress={onDecrement}
          disabled={value <= minValue}
        >
          <Ionicons
            name="remove"
            size={20}
            color={value <= minValue ? theme.colors.gray : theme.colors.primary}
          />
        </Pressable>

        <Text style={styles.counterValue}>{value}</Text>

        <Pressable
          style={[styles.counterBtn, value >= maxValue && styles.counterBtnDisabled]}
          onPress={onIncrement}
          disabled={value >= maxValue}
        >
          <Ionicons
            name="add"
            size={20}
            color={value >= maxValue ? theme.colors.gray : theme.colors.primary}
          />
        </Pressable>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/* ---------- Styles (giữ nguyên của bạn) ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.white },

  header: {
    height: 54,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
  },
  headerIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: "800", color: theme.colors.text },

  content: { padding: theme.spacing.md },

  h2: { fontSize: theme.fontSize.lg, fontWeight: "800", color: theme.colors.text, marginBottom: theme.spacing.md },

  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
  },

  divider: { height: 1, backgroundColor: theme.colors.border, marginLeft: theme.spacing.md + 46 + theme.spacing.md },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  rowLabel: { color: theme.colors.gray, fontSize: theme.fontSize.md, fontWeight: "600" },
  rowValue: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: "500", marginTop: 2 },

  paymentHeader: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addPromo: { color: theme.colors.primary, fontSize: theme.fontSize.sm, fontWeight: "800" },

  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },

  rule: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm },

  itemTitle: { fontSize: theme.fontSize.md, fontWeight: "600", color: theme.colors.text },
  itemSub: { marginTop: 6, fontSize: theme.fontSize.sm, color: theme.colors.gray, fontWeight: "600" },

  muted: { fontSize: theme.fontSize.md, color: theme.colors.gray, fontWeight: "600" },
  money: { fontSize: theme.fontSize.md, color: theme.colors.text, fontWeight: "600" },

  totalLabel: { fontSize: theme.fontSize.lg, fontWeight: "900", color: theme.colors.text },
  totalMoney: { fontSize: theme.fontSize.lg, fontWeight: "900", color: theme.colors.text },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cta: {
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: "900" },

  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: theme.colors.white, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, paddingBottom: 34 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: { fontSize: theme.fontSize.lg, fontWeight: "700", color: theme.colors.text },
  modalBody: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  modalFooter: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md },
  modalBtn: { height: 54, borderRadius: theme.radius.lg, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
  modalBtnText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: "700" },

  hotelOption: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hotelOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  hotelOptionText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
  hotelOptionTextActive: {
    color: theme.colors.primary,
  },


  // Counter
  counterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  counterLabel: { fontSize: theme.fontSize.md, fontWeight: "600", color: theme.colors.text },
  counterSubtitle: { fontSize: theme.fontSize.sm, color: theme.colors.gray, marginTop: 2 },
  counterControls: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnDisabled: { borderColor: theme.colors.border },
  counterValue: { fontSize: theme.fontSize.md, fontWeight: "600", color: theme.colors.text, minWidth: 24, textAlign: "center" },
});
