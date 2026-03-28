import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Image, TextInput } from "react-native";
import { TourService } from "../../../../services/TourService";
import { MessageBoxService } from "../../../MessageBox/MessageBoxService";
import LoadingOverlay from "../../../Loading/LoadingOverlay";
import { useUser } from "../../../../context/UserContext";
import { useAuth } from "../../../../context/AuthContext";
import { BookingService } from "../../../../services/BookingService";
import { Tour } from "../../../../models/Tour";
import { BookingQuote } from "../../../../services/dataAdapters";


export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const tourId: string | undefined = route?.params?.id;

  const [showGuestModal, setShowGuestModal] = useState(false);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const [loading, setLoading] = useState(false);
  const [tour, setTour] = useState<Tour | null>(null);

  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { user } = useUser();
  const { token } = useAuth();

  const [contactName, setContactName] = useState(user?.fullName || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState(user?.phoneNumber || "");
  const [contactNotes, setContactNotes] = useState("");

  const [quote, setQuote] = useState<BookingQuote | null>(null);

  // Auto-fill profile
  useEffect(() => {
    if (user) {
      if (!contactName) setContactName(user.fullName || "");
      if (!contactEmail) setContactEmail(user.email || "");
      if (!contactPhone) setContactPhone(user.phoneNumber || "");
    }
  }, [user]);

  const fetchTour = useCallback(async () => {
    if (!tourId) {
      MessageBoxService.error("Lỗi", "Thiếu id tour.", "OK");
      return;
    }
    setLoading(true);
    try {
      const detail = await TourService.getTourDetail(tourId);
      // backend bạn đang trả { status: true, data: {...} }
      setTour(detail);
      // Set default selected date
      const defaultDate = detail?.startDates?.[0];
      if (defaultDate) setSelectedDate(defaultDate);
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

  // ----- Fetch Quote from Server -----
  const fetchQuote = useCallback(async () => {
    if (!tourId || !token) return;
    try {
      const res = await BookingService.calculatePrice(token, {
        tourId,
        adultCount: adults,
        childCount: children,
        infantCount: infants,
      });
      setQuote(res);
    } catch (e) {
      console.log("Fetch quote error:", e);
    }
  }, [tourId, token, adults, children, infants]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // ----- Prices from API -----
  const pricePerAdult = useMemo(() => {
    const base = tour?.price?.adult ?? 0;
    const disc = tour?.price?.discount ?? 0;
    return disc > 0 ? Math.round(base * (1 - disc / 100)) : base;
  }, [tour]);
  const pricePerChild = useMemo(
    () => tour?.price?.child ?? 0,
    [tour]
  );
  const pricePerInfant = useMemo(
    () => tour?.price?.infant ?? 0,
    [tour]
  );

  const maxP = tour?.maxParticipants ?? 0;
  const curP = tour?.currentParticipants ?? 0;
  const availableSlots = Math.max(0, maxP - curP);
  const maxGuests = availableSlots;

  const subtotal = quote?.subtotal ?? (adults * pricePerAdult + children * pricePerChild + infants * pricePerInfant);
  const serviceFee = quote?.serviceFee ?? 6000000;
  const discount = quote?.promoDiscount ?? 5500000;
  const total = quote?.total ?? (subtotal + serviceFee - discount);

  const formatMoney = (amount: number) => amount.toLocaleString("vi-VN") + "đ";

  const getGuestSummary = () => {
    const parts: string[] = [];
    if (adults > 0) parts.push(`${adults} Người lớn`);
    if (children > 0) parts.push(`${children} Trẻ em`);
    if (infants > 0) parts.push(`${infants} Em bé`);
    return parts.join(", ") || "Chưa chọn";
  };

  const hotelOptions: string[] = []; // Backend không còn accomodations

  const dateText = useMemo(() => {
    if (!selectedDate) return "Chưa chọn";
    const d = new Date(selectedDate);
    return d.toLocaleDateString("vi-VN");
  }, [selectedDate]);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    tour?.startDates?.forEach(d => dates.add(d));
    return Array.from(dates).sort();
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
        {/* Tour Summary Card */}
        <View style={[styles.card, { marginBottom: theme.spacing.lg, flexDirection: 'row', padding: theme.spacing.sm }]}>
          <View style={styles.tourImageWrapper}>
            <Image
              source={{ uri: tour?.images?.[0] || 'https://via.placeholder.com/150' }}
              style={styles.tourImage}
            />
          </View>
          <View style={styles.tourInfoShort}>
            <Text style={styles.tourCategory}>{tour?.category || "Tour"}</Text>
            <Text style={styles.tourTitleShort} numberOfLines={2}>{tour?.name || "Đang tải..."}</Text>
            <View style={styles.tourMetaRow}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.tourMetaText}>4.9 (120+)</Text>
              <Text style={styles.tourMetaDivider}>•</Text>
              <Text style={styles.tourMetaText}>{tour?.duration?.text || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <Text style={styles.h2}>Thông tin vé</Text>

        <View style={styles.card}>
          <DetailRow icon="pricetag-outline" label="Danh mục" value={tour?.category || "N/A"} />
          <Divider />
          <DetailRow icon="key-outline" label="Mã tour" value={tour?.code || tour?.id || tourId || "N/A"} />
          <Divider />
          <DetailRow icon="briefcase-outline" label="Gói tour" value={tour?.name || "Đang tải..."} />
          <Divider />
          <DetailRow icon="calendar-outline" label="Thời gian" value={tour?.duration?.text || "N/A"} />
          <Divider />
          <SelectableDetailRow
            icon="people-outline"
            label="Số lượng khách"
            value={getGuestSummary()}
            onPress={() => setShowGuestModal(true)}
          />
          <Divider />
          <SelectableDetailRow
            icon="time-outline"
            label="Ngày xuất phát"
            value={dateText}
            onPress={() => setShowDateModal(true)}
          />
          {tour?.destination?.city && (
            <>
              <Divider />
              <DetailRow
                icon="location-outline"
                label="Điểm đến"
                value={tour.destination.city}
              />
            </>
          )}
        </View>

        {/* Contact Information */}
        <Text style={[styles.h2, { marginTop: theme.spacing.xl }]}>Thông tin liên hệ</Text>
        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ và tên"
              value={contactName}
              onChangeText={setContactName}
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>
          <Divider />
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ email"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>
          <Divider />
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>
          <Divider />
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Ghi chú</Text>
            <TextInput
              style={[styles.input, { minHeight: 60 }]}
              placeholder="Nhập yêu cầu đặc biệt (dị ứng, phòng, v.v.)"
              value={contactNotes}
              onChangeText={setContactNotes}
              multiline
              textAlignVertical="top"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.paymentHeader}>
          <Text style={styles.h2}>Tổng thanh toán</Text>
          <Pressable onPress={() => { }}>
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
          style={[
            styles.cta,
            (!tour?.id && !tourId || !contactName || !contactEmail || !contactPhone || !contactNotes || !selectedDate) && styles.ctaDisabled
          ]}
          onPress={() => navigation.navigate("PaymentMethodScreen", {
            id: tour?.id || tourId,
            total,
            adults,
            children,
            infants,
            contactInfo: {
              name: contactName,
              email: contactEmail,
              phone: contactPhone,
              notes: contactNotes,
              selectedDate
            }
          })}
          disabled={!tour?.id && !tourId || !contactName || !contactEmail || !contactPhone || !contactNotes || !selectedDate}
        >
          <Text style={styles.ctaText}>Thanh toán</Text>
        </Pressable>
      </View>

      {/* Date Selection Modal */}
      <Modal visible={showDateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowDateModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày xuất phát</Text>
              <Pressable onPress={() => setShowDateModal(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {availableDates.length > 0 ? (
                availableDates.map((date, index) => {
                  const d = new Date(date);
                  const isSelected = selectedDate === date;
                  return (
                    <Pressable
                      key={index}
                      style={[styles.dateOption, isSelected && styles.dateOptionActive]}
                      onPress={() => {
                        setSelectedDate(date);
                        setShowDateModal(false);
                      }}
                    >
                      <View style={styles.dateOptionInfo}>
                        <Text style={[styles.dateOptionText, isSelected && styles.dateOptionTextActive]}>
                          {d.toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                        <Text style={styles.dateOptionStatus}>Còn trống</Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />}
                    </Pressable>
                  );
                })
              ) : (
                <Text style={styles.noDatesText}>Không có ngày khởi hành khả dụng</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Guest Selection Modal */}
      <Modal visible={showGuestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowGuestModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Số lượng khách</Text>
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
                onIncrement={() => setAdults(Math.min(availableSlots - children - infants, adults + 1))}
                minValue={1}
                maxValue={Math.max(0, availableSlots - children - infants)}
              />
              <Divider />
              <GuestCounter
                label="Trẻ em"
                subtitle="Từ 2 - 11 tuổi"
                value={children}
                onDecrement={() => setChildren(Math.max(0, children - 1))}
                onIncrement={() => setChildren(Math.min(availableSlots - adults - infants, children + 1))}
                minValue={0}
                maxValue={Math.max(0, availableSlots - adults - infants)}
              />
              <Divider />
              <GuestCounter
                label="Em bé"
                subtitle="Dưới 2 tuổi"
                value={infants}
                onDecrement={() => setInfants(Math.max(0, infants - 1))}
                onIncrement={() => setInfants(Math.min(availableSlots - adults - children, infants + 1))}
                minValue={0}
                maxValue={Math.max(0, availableSlots - adults - children)}
              />
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalBtn}
                onPress={() => setShowGuestModal(false)}
              >
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
  safe: { flex: 1, backgroundColor: theme.colors.background },

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
  ctaDisabled: { backgroundColor: theme.colors.border },

  // Input styles
  inputWrapper: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.gray,
    marginBottom: 8,
  },
  input: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '600',
    padding: 0,
  },
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

  // Tour Summary Card Styles
  tourImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  tourImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tourInfoShort: {
    flex: 1,
    paddingLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  tourCategory: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tourTitleShort: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  tourMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tourMetaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    fontWeight: '600',
  },
  tourMetaDivider: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.border,
    marginHorizontal: 2,
  },

  // Date Option Styles
  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  dateOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  dateOptionInfo: {
    flex: 1,
  },
  dateOptionText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  dateOptionTextActive: {
    color: theme.colors.primary,
  },
  dateOptionStatus: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  noDatesText: {
    textAlign: 'center',
    color: theme.colors.gray,
    fontSize: theme.fontSize.md,
    paddingVertical: theme.spacing.xl,
  },
});
