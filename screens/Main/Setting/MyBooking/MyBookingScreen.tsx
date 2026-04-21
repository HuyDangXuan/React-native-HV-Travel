import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { BookingCardSkeletonList } from "../../../../components/skeleton/MainTabSkeletons";
import AppHeader from "../../../../components/ui/AppHeader";
import EmptyState from "../../../../components/ui/EmptyState";
import SectionCard from "../../../../components/ui/SectionCard";
import { useAuth } from "../../../../context/AuthContext";
import { useI18n } from "../../../../context/I18nContext";
import { useAppTheme } from "../../../../context/ThemeModeContext";
import { Booking, BookingStatus } from "../../../../models/Booking";
import { BookingService } from "../../../../services/BookingService";
import { getPullRefreshDisplayState } from "../../../../utils/loadingState";
import { shouldTriggerOverlayRefresh } from "../../../../utils/pullToRefresh";
import LoadingOverlay from "../../../Loading/LoadingOverlay";

const PULL_REFRESH_THRESHOLD = 72;

type SegKey = "upcoming" | "past";

const UPCOMING_STATUSES: BookingStatus[] = ["Pending", "Paid", "Confirmed"];
const PAST_STATUSES: BookingStatus[] = ["Completed", "Cancelled", "Refunded"];

export default function MyBookingScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { t } = useI18n();
  const theme = useAppTheme();

  const statusMap: Record<BookingStatus, { label: string; color: string; bg: string }> = {
    Pending: { label: t("bookings.statusPending"), color: "#92400E", bg: "#FEF3C7" },
    Paid: { label: t("bookings.statusPaid"), color: "#065F46", bg: "#D1FAE5" },
    Confirmed: { label: t("bookings.statusConfirmed"), color: "#1E40AF", bg: "#DBEAFE" },
    Completed: { label: t("bookings.statusCompleted"), color: "#065F46", bg: "#D1FAE5" },
    Cancelled: { label: t("bookings.statusCancelled"), color: "#991B1B", bg: "#FEE2E2" },
    Refunded: { label: t("bookings.statusRefunded"), color: "#6B21A8", bg: "#F3E8FF" },
  };

  const [seg, setSeg] = useState<SegKey>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const pullOffsetRef = useRef(0);
  const { showInitialSkeleton, showRefreshSkeleton } = getPullRefreshDisplayState({
    isLoading: loading,
    isRefreshing: refreshing,
    data: bookings,
  });

  const fetchBookings = useCallback(
    async (silent = false) => {
      if (!token) {
        setRequestError(t("bookings.invalidSession"));
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (!silent) setLoading(true);
      setRequestError(null);

      try {
        const result = await BookingService.getBookings(token, { limit: 50 });
        setBookings(result.bookings);
      } catch (error: any) {
        const message = error?.message || t("bookings.loadFailedMessage");
        setRequestError(message);
        Alert.alert(t("bookings.loadFailedTitle"), message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t, token]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = useCallback(() => {
    if (loading || refreshing) return;
    setRefreshing(true);
    fetchBookings(true);
  }, [fetchBookings, loading, refreshing]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    pullOffsetRef.current = Math.min(pullOffsetRef.current, event.nativeEvent.contentOffset.y);
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    pullOffsetRef.current = 0;
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    if (
      shouldTriggerOverlayRefresh({
        minOffsetY: pullOffsetRef.current,
        threshold: PULL_REFRESH_THRESHOLD,
        isBusy: refreshing || loading,
      })
    ) {
      onRefresh();
    }
  }, [loading, onRefresh, refreshing]);

  const list = useMemo(() => {
    const statuses = seg === "upcoming" ? UPCOMING_STATUSES : PAST_STATUSES;
    return bookings.filter((booking) => statuses.includes(booking.status));
  }, [bookings, seg]);

  const bookingCounts = useMemo(
    () => ({
      upcoming: bookings.filter((booking) => UPCOMING_STATUSES.includes(booking.status)).length,
      past: bookings.filter((booking) => PAST_STATUSES.includes(booking.status)).length,
    }),
    [bookings]
  );

  const handleCancel = useCallback(
    (booking: Booking) => {
      Alert.alert(
        t("bookings.cancelTitle"),
        t("bookings.cancelMessage", {
          name: booking.tourSnapshot?.name || booking.bookingCode,
        }),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("bookings.cancelAction"),
            style: "destructive",
            onPress: async () => {
              if (!token) return;
              setCancellingId(booking.id);

              try {
                const updated = await BookingService.cancelBooking(token, booking.id);
                setBookings((prev) => prev.map((item) => (item.id === booking.id ? updated : item)));
              } catch (error: any) {
                Alert.alert(t("common.close"), error?.message || t("bookings.loadFailedMessage"));
              } finally {
                setCancellingId(null);
              }
            },
          },
        ]
      );
    },
    [t, token]
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return t("bookings.unknownDate");
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const statusInfo = statusMap[item.status] || statusMap.Pending;
    const isCancelling = cancellingId === item.id;
    const canCancel = item.status === "Pending";

    return (
      <SectionCard style={styles.card} elevated>
        <View style={styles.cardBody}>
          <View style={styles.topRow}>
            <Text
              style={[styles.title, { color: theme.semantic.textPrimary }]}
              numberOfLines={1}
            >
              {item.tourSnapshot?.name || item.bookingCode}
            </Text>

            <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            </View>
          </View>

          <Text style={[styles.bookingCode, { color: theme.semantic.textSecondary }]}>
            {t("bookings.code", { code: item.bookingCode })}
          </Text>

          <View style={styles.metaRow}>
            {!!item.tourSnapshot?.duration && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={theme.colors.gray} />
                <Text style={[styles.sub, { color: theme.semantic.textSecondary }]}>
                  {item.tourSnapshot.duration}
                </Text>
              </View>
            )}

            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={theme.colors.gray} />
              <Text style={[styles.sub, { color: theme.semantic.textSecondary }]}>
                {t("bookings.guests", { count: item.participantsCount })}
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.dateText, { color: theme.semantic.textPrimary }]}>
                {formatDate(item.bookingDate)}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              {canCancel ? (
                <Pressable
                  onPress={() => handleCancel(item)}
                  style={[
                    styles.cancelBtn,
                    {
                      borderColor: "#FECACA",
                      backgroundColor: "#FEF2F2",
                    },
                  ]}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <>
                      <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                      <Text style={styles.cancelText}>{t("common.cancel")}</Text>
                    </>
                  )}
                </Pressable>
              ) : null}

              <Pressable
                onPress={() => navigation.navigate("TourDetailScreen", { id: item.tourId })}
                style={[
                  styles.detailsBtn,
                  {
                    borderColor: theme.colors.primaryLight,
                    backgroundColor: theme.colors.primaryLight,
                  },
                ]}
              >
                <Text style={[styles.detailsText, { color: theme.colors.primary }]}>
                  {t("common.details")}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
              </Pressable>
            </View>
          </View>
        </View>
      </SectionCard>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenBackground }]}>
      <AppHeader
        variant="compact"
        style={{ backgroundColor: theme.semantic.screenBackground }}
        title={t("bookings.title")}
        onBack={() => navigation.goBack()}
        centerTitle={true}
      />

      <View
        style={[
          styles.segmentWrap,
          {
            marginTop: 12,
            marginHorizontal: theme.layout.detailPadding,
            marginBottom: theme.spacing.md,
            padding: 4,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.semantic.screenMutedSurface,
          },
        ]}
      >
        {([
          { key: "upcoming" as const, label: t("bookings.upcoming"), count: bookingCounts.upcoming },
          { key: "past" as const, label: t("bookings.past"), count: bookingCounts.past },
        ]).map((item) => {
          const active = seg === item.key;

          return (
            <Pressable
              key={item.key}
              onPress={() => setSeg(item.key)}
              style={[
                styles.segBtn,
                active && {
                  backgroundColor: theme.semantic.screenSurface,
                  borderRadius: theme.radius.pill,
                },
                (showInitialSkeleton || showRefreshSkeleton) && styles.segBtnDisabled,
              ]}
              disabled={showInitialSkeleton || showRefreshSkeleton}
            >
              <Text
                style={[
                  styles.segText,
                  {
                    color: active ? theme.semantic.textPrimary : theme.semantic.textSecondary,
                  },
                ]}
              >
                {showInitialSkeleton || showRefreshSkeleton
                  ? item.label
                  : `${item.label} (${item.count})`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {showInitialSkeleton || showRefreshSkeleton ? (
        <View style={styles.loadingContent}>
          <BookingCardSkeletonList />
        </View>
      ) : requestError && list.length === 0 ? (
        <View style={styles.errorContent}>
          <EmptyState
            icon="alert-circle-outline"
            title={t("bookings.loadFailedTitle")}
            description={requestError}
            actionLabel={t("bookings.retryAction")}
            onAction={() => fetchBookings()}
          />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            { paddingHorizontal: theme.layout.detailPadding, paddingBottom: theme.spacing.xl },
            list.length === 0 && { flexGrow: 1, justifyContent: "center" },
          ]}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          scrollEventThrottle={16}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-clear-outline"
              title={
                seg === "upcoming"
                  ? t("bookings.emptyUpcomingTitle")
                  : t("bookings.emptyPastTitle")
              }
              description={
                seg === "upcoming"
                  ? t("bookings.emptyUpcomingDescription")
                  : t("bookings.emptyPastDescription")
              }
              actionLabel={t("bookings.exploreAction")}
              onAction={() => navigation.replace("MainTabs")}
            />
          }
        />
      )}

      <LoadingOverlay visible={refreshing} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  segmentWrap: {
    flexDirection: "row",
  },
  segBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  segBtnDisabled: {
    opacity: 0.7,
  },
  segText: {
    fontSize: 14,
    fontWeight: "700",
  },
  loadingContent: {
    flex: 1,
    paddingHorizontal: 16, // theme.layout.detailPadding
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
  },
  list: {
    gap: 12,
  },
  card: {},
  cardBody: {
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  bookingCode: {
    fontSize: 13,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sub: {
    fontSize: 13,
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  detailsText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
