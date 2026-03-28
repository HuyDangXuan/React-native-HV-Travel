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
import theme from "../../../../config/theme";
import { useAuth } from "../../../../context/AuthContext";
import { Booking, BookingStatus } from "../../../../models/Booking";
import { BookingService } from "../../../../services/BookingService";
import { getPullRefreshDisplayState } from "../../../../utils/loadingState";
import { shouldTriggerOverlayRefresh } from "../../../../utils/pullToRefresh";
import LoadingOverlay from "../../../Loading/LoadingOverlay";

const PULL_REFRESH_THRESHOLD = 72;

type SegKey = "Chưa đi" | "Đã đi";

const UPCOMING_STATUSES: BookingStatus[] = ["Pending", "Paid", "Confirmed"];
const PAST_STATUSES: BookingStatus[] = ["Completed", "Cancelled", "Refunded"];

const STATUS_MAP: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  Pending: { label: "Chờ xử lý", color: "#92400E", bg: "#FEF3C7" },
  Paid: { label: "Đã thanh toán", color: "#065F46", bg: "#D1FAE5" },
  Confirmed: { label: "Đã xác nhận", color: "#1E40AF", bg: "#DBEAFE" },
  Completed: { label: "Hoàn thành", color: "#065F46", bg: "#D1FAE5" },
  Cancelled: { label: "Đã hủy", color: "#991B1B", bg: "#FEE2E2" },
  Refunded: { label: "Hoàn tiền", color: "#6B21A8", bg: "#F3E8FF" },
};

export default function MyBookingScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();

  const [seg, setSeg] = useState<SegKey>("Chưa đi");
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
        setRequestError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
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
        console.log("Fetch bookings error:", error);
        const message = error?.message || "Không thể tải danh sách chuyến đi đã đặt.";
        setRequestError(message);
        Alert.alert("Không tải được chuyến đi", message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
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
    const statuses = seg === "Chưa đi" ? UPCOMING_STATUSES : PAST_STATUSES;
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
        "Hủy booking",
        `Bạn có chắc muốn hủy booking "${booking.tourSnapshot?.name || booking.bookingCode}"?`,
        [
          { text: "Không", style: "cancel" },
          {
            text: "Hủy booking",
            style: "destructive",
            onPress: async () => {
              if (!token) return;
              setCancellingId(booking.id);

              try {
                const updated = await BookingService.cancelBooking(token, booking.id);
                setBookings((prev) => prev.map((item) => (item.id === booking.id ? updated : item)));
              } catch (error: any) {
                Alert.alert("Lỗi", error?.message || "Không thể hủy booking.");
              } finally {
                setCancellingId(null);
              }
            },
          },
        ]
      );
    },
    [token]
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const statusInfo = STATUS_MAP[item.status] || STATUS_MAP.Pending;
    const isCancelling = cancellingId === item.id;
    const canCancel = item.status === "Pending";

    return (
      <SectionCard style={styles.card} elevated>
        <View style={styles.cardBody}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.tourSnapshot?.name || item.bookingCode}
            </Text>

            <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            </View>
          </View>

          <Text style={styles.bookingCode}>Mã: {item.bookingCode}</Text>

          <View style={styles.metaRow}>
            {!!item.tourSnapshot?.duration && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={theme.colors.gray} />
                <Text style={styles.sub}>{item.tourSnapshot.duration}</Text>
              </View>
            )}

            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={theme.colors.gray} />
              <Text style={styles.sub}>{item.participantsCount} khách</Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.dateText}>{formatDate(item.bookingDate)}</Text>
            </View>

            <View style={styles.actionsRow}>
              {canCancel && (
                <Pressable onPress={() => handleCancel(item)} style={styles.cancelBtn} disabled={isCancelling}>
                  {isCancelling ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <>
                      <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                      <Text style={styles.cancelText}>Hủy</Text>
                    </>
                  )}
                </Pressable>
              )}

              <Pressable
                onPress={() => navigation.navigate("TourDetailScreen", { id: item.tourId })}
                style={styles.detailsBtn}
              >
                <Text style={styles.detailsText}>Chi tiết</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
              </Pressable>
            </View>
          </View>
        </View>
      </SectionCard>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        variant="compact"
        style={styles.header}
        title="Chuyến đi đã đặt"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.segmentWrap}>
        {(["Chưa đi", "Đã đi"] as SegKey[]).map((item) => {
          const active = seg === item;
          const count = item === "Chưa đi" ? bookingCounts.upcoming : bookingCounts.past;

          return (
            <Pressable
              key={item}
              onPress={() => setSeg(item)}
              style={[
                styles.segBtn,
                active && styles.segBtnActive,
                (showInitialSkeleton || showRefreshSkeleton) && styles.segBtnDisabled,
              ]}
              disabled={showInitialSkeleton || showRefreshSkeleton}
            >
              <Text style={[styles.segText, active && styles.segTextActive]}>
                {showInitialSkeleton || showRefreshSkeleton ? item : `${item} (${count})`}
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
            title="Không tải được chuyến đi đã đặt"
            description={requestError}
            actionLabel="Thử lại"
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
              title={seg === "Chưa đi" ? "Bạn chưa có chuyến đi nào" : "Chưa có lịch sử chuyến đi"}
              description={
                seg === "Chưa đi"
                  ? "Hãy chọn một tour phù hợp và đặt ngay để bắt đầu hành trình."
                  : "Khi bạn hoàn thành chuyến đi, lịch sử sẽ hiển thị ở đây."
              }
              actionLabel="Khám phá tour"
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
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.background,
  },
  loadingContent: {
    flex: 1,
    paddingHorizontal: theme.layout.detailPadding,
    paddingTop: 12,
  },
  errorContent: {
    flex: 1,
    paddingHorizontal: theme.layout.detailPadding,
  },
  segmentWrap: {
    marginTop: 14,
    marginHorizontal: theme.layout.detailPadding,
    marginBottom: 6,
    flexDirection: "row",
    gap: 10,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  segBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  segBtnDisabled: {
    opacity: 0.72,
  },
  segText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.gray,
  },
  segTextActive: {
    color: theme.colors.white,
  },
  list: {
    paddingHorizontal: theme.layout.detailPadding,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    padding: 14,
  },
  cardBody: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: "800",
    color: theme.colors.text,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "800",
  },
  bookingCode: {
    marginTop: 6,
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "500",
  },
  bottomRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  dateText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  cancelText: {
    fontSize: theme.fontSize.sm,
    color: "#DC2626",
    fontWeight: "700",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  detailsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "800",
  },
});
