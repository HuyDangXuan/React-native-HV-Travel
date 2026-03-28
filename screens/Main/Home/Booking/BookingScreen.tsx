import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { useAppTheme, useThemeMode } from "../../../../context/ThemeModeContext";
import { useI18n } from "../../../../context/I18nContext";
import { TourService } from "../../../../services/TourService";
import { MessageBoxService } from "../../../MessageBox/MessageBoxService";
import LoadingOverlay from "../../../Loading/LoadingOverlay";
import { useUser } from "../../../../context/UserContext";
import { useAuth } from "../../../../context/AuthContext";
import { BookingService } from "../../../../services/BookingService";
import { Tour } from "../../../../models/Tour";
import { BookingQuote } from "../../../../services/dataAdapters";

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

type BookingUi = {
  bg: string;
  surface: string;
  mutedSurface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  onPrimary: string;
  placeholder: string;
  overlay: string;
  accent: string;
};

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

function formatReadableDate(dateValue: string, locale: string) {
  return new Date(dateValue).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const tourId: string | undefined = route?.params?.id;

  const { t, locale } = useI18n();
  const appTheme = useAppTheme();
  const { themeName } = useThemeMode();
  const ui = useMemo<BookingUi>(
    () => ({
      bg: appTheme.semantic.screenBackground,
      surface: appTheme.semantic.screenSurface,
      mutedSurface: appTheme.semantic.screenMutedSurface,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      border: appTheme.semantic.divider,
      primary: appTheme.colors.primary,
      onPrimary: appTheme.colors.white,
      placeholder: appTheme.colors.placeholder,
      overlay: appTheme.colors.overlay,
      accent: appTheme.colors.secondary,
    }),
    [appTheme]
  );
  const styles = useMemo(() => createStyles(ui), [ui]);

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
  const tourRequestIdRef = useRef(0);
  const quoteRequestIdRef = useRef(0);

  useEffect(() => {
    if (user) {
      if (!contactName) setContactName(user.fullName || "");
      if (!contactEmail) setContactEmail(user.email || "");
      if (!contactPhone) setContactPhone(user.phoneNumber || "");
    }
  }, [contactEmail, contactName, contactPhone, user]);

  const currencyLocale = useMemo(() => getCurrencyLocale(locale), [locale]);

  const formatMoney = useCallback(
    (amount: number) =>
      new Intl.NumberFormat(currencyLocale, {
        style: "currency",
        currency: "VND",
      }).format(amount || 0),
    [currencyLocale]
  );

  const fetchTour = useCallback(async () => {
    if (!tourId) {
      MessageBoxService.error(t("booking.errorTitle"), t("booking.missingTourId"), t("common.ok"));
      return;
    }

    setLoading(true);
    const requestId = tourRequestIdRef.current + 1;
    tourRequestIdRef.current = requestId;
    try {
      const detail = await TourService.getTourDetail(tourId);
      if (tourRequestIdRef.current === requestId) {
        setTour(detail);

        const defaultDate = detail?.startDates?.[0];
        setSelectedDate(defaultDate ?? null);
      }
    } catch (error: any) {
      console.log("Fetch booking tour error:", error);
      if (tourRequestIdRef.current === requestId) {
        MessageBoxService.error(
          t("booking.errorTitle"),
          getErrorMessage(error, t("booking.loadTourFailed")),
          t("common.ok")
        );
      }
    } finally {
      if (tourRequestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [t, tourId]);

  useEffect(() => {
    fetchTour();
  }, [fetchTour]);

  const fetchQuote = useCallback(async () => {
    if (!tourId || !token) {
      setQuote(null);
      return;
    }

    const requestId = quoteRequestIdRef.current + 1;
    quoteRequestIdRef.current = requestId;
    try {
      const response = await BookingService.calculatePrice(token, {
        tourId,
        adultCount: adults,
        childCount: children,
        infantCount: infants,
      });
      if (quoteRequestIdRef.current === requestId) {
        setQuote(response);
      }
    } catch (error) {
      console.log("Fetch quote error:", error);
      if (quoteRequestIdRef.current === requestId) {
        setQuote(null);
      }
    }
  }, [adults, children, infants, token, tourId]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const pricePerAdult = useMemo(() => {
    const base = tour?.price?.adult ?? 0;
    const discount = tour?.price?.discount ?? 0;
    return discount > 0 ? Math.round(base * (1 - discount / 100)) : base;
  }, [tour]);

  const pricePerChild = useMemo(() => tour?.price?.child ?? 0, [tour]);
  const pricePerInfant = useMemo(() => tour?.price?.infant ?? 0, [tour]);
  const availableSlots = Math.max(0, (tour?.maxParticipants ?? 0) - (tour?.currentParticipants ?? 0));

  const subtotal =
    quote?.subtotal ?? adults * pricePerAdult + children * pricePerChild + infants * pricePerInfant;
  const serviceFee = quote?.serviceFee ?? 6000000;
  const discount = quote?.promoDiscount ?? 5500000;
  const total = quote?.total ?? subtotal + serviceFee - discount;

  const getGuestSummary = useCallback(() => {
    const parts: string[] = [];
    if (adults > 0) parts.push(t("booking.guestAdultSummary", { count: adults }));
    if (children > 0) parts.push(t("booking.guestChildSummary", { count: children }));
    if (infants > 0) parts.push(t("booking.guestInfantSummary", { count: infants }));
    return parts.join(", ") || t("booking.notSelected");
  }, [adults, children, infants, t]);

  const dateText = useMemo(() => {
    if (!selectedDate) return t("booking.notSelected");
    return new Date(selectedDate).toLocaleDateString(currencyLocale);
  }, [currencyLocale, selectedDate, t]);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    tour?.startDates?.forEach((dateValue) => dates.add(dateValue));
    return Array.from(dates).sort();
  }, [tour]);

  const ratingText = useMemo(() => {
    if (typeof tour?.rating === "number") {
      const count = typeof tour?.reviewCount === "number" ? Math.max(tour.reviewCount, 0) : 0;
      return t("booking.ratingSummary", { rating: tour.rating.toFixed(1), count });
    }
    return t("booking.ratingFallback");
  }, [t, tour?.rating, tour?.reviewCount]);

  const requestedGuests = adults + children + infants;
  const hasCapacity = availableSlots > 0 && requestedGuests <= availableSlots;

  const isSubmitDisabled = !tour?.id && !tourId
    ? true
    : !contactName || !contactEmail || !contactPhone || !contactNotes || !selectedDate || !hasCapacity;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} backgroundColor={ui.bg} />

      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={ui.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("booking.title")}</Text>
        <View style={styles.headerIcon} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.card, styles.tourSummaryCard]}>
          <View style={styles.tourImageWrapper}>
            <Image
              source={{ uri: tour?.images?.[0] || "https://via.placeholder.com/150" }}
              style={styles.tourImage}
            />
          </View>
          <View style={styles.tourInfoShort}>
            <Text style={styles.tourCategory}>
              {tour?.category || t("booking.tourCategoryFallback")}
            </Text>
            <Text style={styles.tourTitleShort} numberOfLines={2}>
              {tour?.name || t("booking.loadingTourTitle")}
            </Text>
            <View style={styles.tourMetaColumn}>
              <View style={styles.tourMetaRow}>
                <Ionicons name="calendar-outline" size={14} color={ui.primary} />
                <Text style={styles.tourMetaText}>{dateText}</Text>
                <View style={styles.tourMetaDot} />
                <Ionicons name="time-outline" size={14} color={ui.primary} />
                <Text style={styles.tourMetaText}>
                  {tour?.duration?.text || t("booking.notAvailable")}
                </Text>
              </View>
              <View style={styles.tourMetaRowSecondary}>
                <Ionicons name="star" size={14} color={ui.accent} />
                <Text style={styles.tourMetaText}>{ratingText}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t("booking.ticketInfoTitle")}</Text>

        <View style={styles.card}>
          <DetailRow
            icon="pricetag-outline"
            label={t("booking.labelCategory")}
            value={tour?.category || t("booking.notAvailable")}
            styles={styles}
            ui={ui}
          />
          <Divider styles={styles} />
          <DetailRow
            icon="key-outline"
            label={t("booking.labelTourCode")}
            value={tour?.code || tour?.id || tourId || t("booking.notAvailable")}
            styles={styles}
            ui={ui}
          />
          <Divider styles={styles} />
          <DetailRow
            icon="briefcase-outline"
            label={t("booking.labelPackage")}
            value={tour?.name || t("booking.loadingTourTitle")}
            styles={styles}
            ui={ui}
          />
          <Divider styles={styles} />
          <DetailRow
            icon="calendar-outline"
            label={t("booking.labelDuration")}
            value={tour?.duration?.text || t("booking.notAvailable")}
            styles={styles}
            ui={ui}
          />
          <Divider styles={styles} />
          <SelectableDetailRow
            icon="people-outline"
            label={t("booking.labelGuestCount")}
            value={getGuestSummary()}
            onPress={() => setShowGuestModal(true)}
            styles={styles}
            ui={ui}
          />
          <Divider styles={styles} />
          <SelectableDetailRow
            icon="time-outline"
            label={t("booking.labelDepartureDate")}
            value={dateText}
            onPress={() => setShowDateModal(true)}
            styles={styles}
            ui={ui}
          />
          {tour?.destination?.city && (
            <>
              <Divider styles={styles} />
              <DetailRow
                icon="location-outline"
                label={t("booking.labelDestination")}
                value={tour.destination.city}
                styles={styles}
                ui={ui}
              />
            </>
          )}
        </View>

        <Text style={styles.sectionTitleWithTop}>{t("booking.contactInfoTitle")}</Text>
        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{t("booking.contactNameLabel")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("booking.contactNamePlaceholder")}
              value={contactName}
              onChangeText={setContactName}
              placeholderTextColor={ui.placeholder}
            />
          </View>
          <Divider styles={styles} />
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{t("booking.contactEmailLabel")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("booking.contactEmailPlaceholder")}
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={ui.placeholder}
            />
          </View>
          <Divider styles={styles} />
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{t("booking.contactPhoneLabel")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("booking.contactPhonePlaceholder")}
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              placeholderTextColor={ui.placeholder}
            />
          </View>
          <Divider styles={styles} />
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{t("booking.contactNotesLabel")}</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder={t("booking.contactNotesPlaceholder")}
              value={contactNotes}
              onChangeText={setContactNotes}
              multiline
              textAlignVertical="top"
              placeholderTextColor={ui.placeholder}
            />
          </View>
        </View>

        <View style={styles.paymentHeader}>
          <Text style={styles.sectionTitle}>{t("booking.paymentSummaryTitle")}</Text>
          <Pressable onPress={() => {}}>
            <Text style={styles.addPromo}>{t("booking.addPromo")}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.lineRow}>
            <View style={styles.summaryInfo}>
              <Text style={styles.itemTitle}>{tour?.name || t("booking.tourCategoryFallback")}</Text>

              {adults > 0 && (
                <Text style={styles.itemSub}>
                  {t("booking.summaryAdultLine", { count: adults, price: formatMoney(pricePerAdult) })}
                </Text>
              )}
              {children > 0 && (
                <Text style={styles.itemSub}>
                  {t("booking.summaryChildLine", { count: children, price: formatMoney(pricePerChild) })}
                </Text>
              )}
              {infants > 0 && (
                <Text style={styles.itemSub}>
                  {t("booking.summaryInfantLine", { count: infants, price: formatMoney(pricePerInfant) })}
                </Text>
              )}
            </View>

            <Text style={styles.money}>{formatMoney(subtotal)}</Text>
          </View>

          <View style={styles.rule} />

          <View style={styles.lineRow}>
            <Text style={styles.muted}>{t("booking.subtotalLabel")}</Text>
            <Text style={styles.money}>{formatMoney(subtotal)}</Text>
          </View>

          <View style={styles.lineRow}>
            <Text style={styles.muted}>{t("booking.serviceFeeLabel")}</Text>
            <Text style={styles.money}>{formatMoney(serviceFee)}</Text>
          </View>

          <View style={styles.lineRow}>
            <Text style={styles.muted}>{t("booking.discountLabel")}</Text>
            <Text style={styles.money}>-{formatMoney(discount)}</Text>
          </View>

          <View style={styles.rule} />

          <View style={styles.lineRow}>
            <Text style={styles.totalLabel}>{t("booking.totalLabel")}</Text>
            <Text style={styles.totalMoney}>{formatMoney(total)}</Text>
          </View>
        </View>

        <View style={styles.scrollSpacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.cta, isSubmitDisabled && styles.ctaDisabled]}
          onPress={() =>
            navigation.navigate("PaymentMethodScreen", {
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
                selectedDate,
              },
            })
          }
          disabled={isSubmitDisabled}
        >
          <Text style={styles.ctaText}>{t("booking.payNow")}</Text>
        </Pressable>
      </View>

      <Modal visible={showDateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowDateModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("booking.selectDepartureDateTitle")}</Text>
              <Pressable onPress={() => setShowDateModal(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={ui.textPrimary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {availableDates.length > 0 ? (
                availableDates.map((dateValue, index) => {
                  const isSelected = selectedDate === dateValue;
                  return (
                    <Pressable
                      key={`${dateValue}-${index}`}
                      style={[styles.dateOption, isSelected && styles.dateOptionActive]}
                      onPress={() => {
                        setSelectedDate(dateValue);
                        setShowDateModal(false);
                      }}
                    >
                      <View style={styles.dateOptionInfo}>
                        <Text style={[styles.dateOptionText, isSelected && styles.dateOptionTextActive]}>
                          {formatReadableDate(dateValue, locale)}
                        </Text>
                        <Text style={styles.dateOptionStatus}>{t("booking.availableStatus")}</Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={24} color={ui.primary} />}
                    </Pressable>
                  );
                })
              ) : (
                <Text style={styles.noDatesText}>{t("booking.noAvailableDates")}</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showGuestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowGuestModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("booking.selectGuestsTitle")}</Text>
              <Pressable onPress={() => setShowGuestModal(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={ui.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <GuestCounter
                label={t("booking.guestAdultLabel")}
                subtitle={t("booking.guestAdultSubtitle")}
                value={adults}
                onDecrement={() => setAdults(Math.max(1, adults - 1))}
                onIncrement={() => setAdults(Math.min(availableSlots - children - infants, adults + 1))}
                minValue={1}
                maxValue={Math.max(0, availableSlots - children - infants)}
                seatsLeft={Math.max(0, availableSlots - children - infants)}
                styles={styles}
                ui={ui}
                t={t}
              />
              <Divider styles={styles} />
              <GuestCounter
                label={t("booking.guestChildLabel")}
                subtitle={t("booking.guestChildSubtitle")}
                value={children}
                onDecrement={() => setChildren(Math.max(0, children - 1))}
                onIncrement={() => setChildren(Math.min(availableSlots - adults - infants, children + 1))}
                minValue={0}
                maxValue={Math.max(0, availableSlots - adults - infants)}
                seatsLeft={Math.max(0, availableSlots - adults - infants)}
                styles={styles}
                ui={ui}
                t={t}
              />
              <Divider styles={styles} />
              <GuestCounter
                label={t("booking.guestInfantLabel")}
                subtitle={t("booking.guestInfantSubtitle")}
                value={infants}
                onDecrement={() => setInfants(Math.max(0, infants - 1))}
                onIncrement={() => setInfants(Math.min(availableSlots - adults - children, infants + 1))}
                minValue={0}
                maxValue={Math.max(0, availableSlots - adults - children)}
                seatsLeft={Math.max(0, availableSlots - adults - children)}
                styles={styles}
                ui={ui}
                t={t}
              />
            </View>

            <View style={styles.modalFooter}>
              <Pressable style={styles.modalBtn} onPress={() => setShowGuestModal(false)}>
                <Text style={styles.modalBtnText}>{t("booking.confirmSelection")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  styles,
  ui,
}: {
  icon: any;
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
  ui: BookingUi;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={ui.primary} />
      </View>

      <View style={styles.rowContent}>
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
  styles,
  ui,
}: {
  icon: any;
  label: string;
  value: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  ui: BookingUi;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={ui.primary} />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={2}>
          {value}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={ui.textSecondary} />
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
  seatsLeft,
  styles,
  ui,
  t,
}: {
  label: string;
  subtitle: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  minValue: number;
  maxValue: number;
  seatsLeft: number;
  styles: ReturnType<typeof createStyles>;
  ui: BookingUi;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <View style={styles.counterRow}>
      <View style={styles.counterInfo}>
        <Text style={styles.counterLabel}>{label}</Text>
        <Text style={styles.counterSubtitle}>{subtitle}</Text>
        <Text style={styles.counterSeats}>{t("booking.seatsLeftLabel", { count: seatsLeft })}</Text>
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
            color={value <= minValue ? ui.textSecondary : ui.primary}
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
            color={value >= maxValue ? ui.textSecondary : ui.primary}
          />
        </Pressable>
      </View>
    </View>
  );
}

function Divider({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.divider} />;
}

function createStyles(ui: BookingUi) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: ui.bg },
    header: {
      height: 54,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: ui.bg,
      borderBottomWidth: 1,
      borderBottomColor: ui.border,
    },
    headerIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: "800", color: ui.textPrimary },
    content: { padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "800", color: ui.textPrimary, marginBottom: 16 },
    sectionTitleWithTop: {
      fontSize: 18,
      fontWeight: "800",
      color: ui.textPrimary,
      marginTop: 32,
      marginBottom: 16,
    },
    card: {
      backgroundColor: ui.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: ui.border,
      overflow: "hidden",
    },
    tourSummaryCard: {
      marginBottom: 24,
      flexDirection: "row",
      padding: 12,
    },
    row: {
      flexDirection: "row",
      gap: 16,
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    rowContent: { flex: 1 },
    divider: { height: 1, backgroundColor: ui.border, marginLeft: 78 },
    iconBox: {
      width: 46,
      height: 46,
      borderRadius: 12,
      backgroundColor: ui.mutedSurface,
      alignItems: "center",
      justifyContent: "center",
    },
    rowLabel: { color: ui.textSecondary, fontSize: 16, fontWeight: "600" },
    rowValue: { color: ui.textPrimary, fontSize: 16, fontWeight: "500", marginTop: 2 },
    paymentHeader: {
      marginTop: 32,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    addPromo: { color: ui.primary, fontSize: 14, fontWeight: "800" },
    lineRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    summaryInfo: { flex: 1 },
    rule: { height: 1, backgroundColor: ui.border, marginVertical: 8 },
    itemTitle: { fontSize: 16, fontWeight: "600", color: ui.textPrimary },
    itemSub: { marginTop: 6, fontSize: 14, color: ui.textSecondary, fontWeight: "600" },
    muted: { fontSize: 16, color: ui.textSecondary, fontWeight: "600" },
    money: { fontSize: 16, color: ui.textPrimary, fontWeight: "600" },
    totalLabel: { fontSize: 18, fontWeight: "900", color: ui.textPrimary },
    totalMoney: { fontSize: 18, fontWeight: "900", color: ui.textPrimary },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: 16,
      backgroundColor: ui.surface,
      borderTopWidth: 1,
      borderTopColor: ui.border,
    },
    cta: {
      height: 54,
      borderRadius: 16,
      backgroundColor: ui.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    ctaText: { color: ui.onPrimary, fontSize: 16, fontWeight: "900" },
    ctaDisabled: { backgroundColor: ui.border },
    inputWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: ui.textSecondary,
      marginBottom: 8,
    },
    input: {
      fontSize: 16,
      color: ui.textPrimary,
      fontWeight: "600",
      padding: 0,
    },
    notesInput: { minHeight: 60 },
    modalOverlay: { flex: 1, justifyContent: "flex-end" },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: ui.overlay },
    modalContent: {
      backgroundColor: ui.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 34,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: ui.border,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", color: ui.textPrimary },
    modalBody: { padding: 24, gap: 24 },
    modalFooter: { paddingHorizontal: 24, paddingTop: 16 },
    modalBtn: {
      height: 54,
      borderRadius: 16,
      backgroundColor: ui.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    modalBtnText: { color: ui.onPrimary, fontSize: 16, fontWeight: "700" },
    counterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    counterInfo: { flex: 1 },
    counterLabel: { fontSize: 16, fontWeight: "600", color: ui.textPrimary },
    counterSubtitle: { fontSize: 14, color: ui.textSecondary, marginTop: 2 },
    counterSeats: { fontSize: 14, color: ui.textSecondary, marginTop: 2 },
    counterControls: { flexDirection: "row", alignItems: "center", gap: 16 },
    counterBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: ui.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    counterBtnDisabled: { borderColor: ui.border },
    counterValue: {
      fontSize: 16,
      fontWeight: "600",
      color: ui.textPrimary,
      minWidth: 24,
      textAlign: "center",
    },
    tourImageWrapper: {
      width: 100,
      height: 100,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: ui.mutedSurface,
    },
    tourImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    tourInfoShort: {
      flex: 1,
      paddingLeft: 16,
      justifyContent: "center",
    },
    tourCategory: {
      fontSize: 12,
      color: ui.primary,
      fontWeight: "800",
      textTransform: "uppercase",
      marginBottom: 4,
    },
    tourTitleShort: {
      fontSize: 16,
      fontWeight: "800",
      color: ui.textPrimary,
      lineHeight: 20,
      marginBottom: 8,
    },
    tourMetaColumn: {
      gap: 6,
    },
    tourMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    },
    tourMetaRowSecondary: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    tourMetaText: {
      fontSize: 12,
      color: ui.textSecondary,
      fontWeight: "600",
    },
    tourMetaDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: ui.border,
      marginHorizontal: 4,
    },
    dateOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: ui.border,
      marginBottom: 8,
      backgroundColor: ui.surface,
    },
    dateOptionActive: {
      borderColor: ui.primary,
      backgroundColor: ui.mutedSurface,
    },
    dateOptionInfo: { flex: 1 },
    dateOptionText: {
      fontSize: 16,
      fontWeight: "700",
      color: ui.textPrimary,
      textTransform: "capitalize",
    },
    dateOptionTextActive: {
      color: ui.primary,
    },
    dateOptionStatus: {
      fontSize: 12,
      color: ui.accent,
      fontWeight: "600",
      marginTop: 2,
    },
    noDatesText: {
      textAlign: "center",
      color: ui.textSecondary,
      fontSize: 16,
      paddingVertical: 32,
    },
    scrollSpacer: { height: 110 },
  });
}
