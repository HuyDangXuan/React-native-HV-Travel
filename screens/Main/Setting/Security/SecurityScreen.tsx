import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import AppButton from "../../../../components/Button";
import AppHeader from "../../../../components/ui/AppHeader";
import SectionCard from "../../../../components/ui/SectionCard";
import theme from "../../../../config/theme";
import { useAuth } from "../../../../context/AuthContext";
import { AuthService } from "../../../../services/AuthService";
import { MessageBoxService } from "../../../MessageBox/MessageBoxService";

type DeviceSession = {
  sessionId: string;
  deviceId: string;
  deviceLabel: string;
  createdAt: string;
  lastUsedAt: string;
  isCurrent: boolean;
};

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
}

function getSessionTitle(session: DeviceSession) {
  if (session.isCurrent) {
    return session.deviceLabel
      ? `${session.deviceLabel} (thiết bị này)`
      : "Thiết bị này";
  }

  if (session.deviceLabel) {
    return session.deviceLabel;
  }

  const suffix = session.deviceId ? session.deviceId.slice(-6) : "khác";
  return `Thiết bị ${suffix}`;
}

export default function SecurityScreen() {
  const navigation = useNavigation<any>();
  const { token, logoutAllDevices, logoutDeviceSession } = useAuth();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [menuSession, setMenuSession] = useState<DeviceSession | null>(null);

  const loadSessions = useCallback(async () => {
    if (!token) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.getSessions(token);
      const nextSessions = Array.isArray(response?.data)
        ? (response.data as DeviceSession[])
        : [];
      setSessions(nextSessions);
    } catch (error: any) {
      MessageBoxService.error(
        "Không tải được thiết bị",
        error?.message || "Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadSessions();
    }, [loadSessions])
  );

  const currentSessionCount = useMemo(
    () => sessions.filter((session) => session.isCurrent).length,
    [sessions]
  );

  const confirmLogoutDevice = (session: DeviceSession) => {
    setMenuSession(null);
    MessageBoxService.confirm({
      title: "Đăng xuất thiết bị",
      content: session.isCurrent
        ? "Thiết bị hiện tại sẽ bị đăng xuất hoàn toàn và cần đăng nhập lại."
        : "Thiết bị này sẽ bị đăng xuất và phải đăng nhập lại ở lần sau.",
      cancelText: "Huỷ",
      confirmText: "Đăng xuất",
      onConfirm: async () => {
        try {
          setSubmitting(true);
          await logoutDeviceSession(session.sessionId, session.isCurrent);
          if (session.isCurrent) {
            navigation.reset({
              index: 0,
              routes: [{ name: "LoginScreen" }],
            });
            return;
          }
          await loadSessions();
        } catch (error: any) {
          MessageBoxService.error(
            "Không thể đăng xuất thiết bị",
            error?.message || "Vui lòng thử lại sau."
          );
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleLogoutAll = () => {
    MessageBoxService.confirm({
      title: "Đăng xuất mọi thiết bị",
      content:
        "Tất cả thiết bị đã đăng nhập sẽ bị đăng xuất. Bạn sẽ cần đăng nhập lại ở thiết bị này.",
      cancelText: "Huỷ",
      confirmText: "Đăng xuất",
      onConfirm: async () => {
        try {
          setSubmitting(true);
          await logoutAllDevices();
          navigation.reset({
            index: 0,
            routes: [{ name: "LoginScreen" }],
          });
        } catch (error: any) {
          MessageBoxService.error(
            "Không thể đăng xuất mọi thiết bị",
            error?.message || "Vui lòng thử lại sau."
          );
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader variant="hero" title="Bảo mật" onBack={() => navigation.goBack()} />

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.sessionId}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <SectionCard style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Thiết bị đã đăng nhập</Text>
              <Text style={styles.summaryText}>
                {loading
                  ? "Đang tải danh sách thiết bị..."
                  : `${sessions.length} thiết bị đang hoạt động, ${currentSessionCount} thiết bị hiện tại.`}
              </Text>
            </SectionCard>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <SectionCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Chưa có thiết bị nào</Text>
              <Text style={styles.emptyText}>
                Danh sách sẽ xuất hiện sau khi tài khoản đăng nhập trên thiết bị.
              </Text>
            </SectionCard>
          ) : null
        }
        renderItem={({ item }) => (
          <SectionCard style={styles.sessionCard}>
            <View style={styles.sessionRow}>
              <View style={styles.sessionIcon}>
                <Ionicons
                  name={item.isCurrent ? "phone-portrait-outline" : "hardware-chip-outline"}
                  size={20}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.sessionContent}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle}>{getSessionTitle(item)}</Text>
                  {item.isCurrent ? (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Hiện tại</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.sessionMeta}>
                  Hoạt động gần nhất: {formatDateTime(item.lastUsedAt)}
                </Text>
                <Text style={styles.sessionMeta}>
                  Đăng nhập từ: {formatDateTime(item.createdAt)}
                </Text>
              </View>

              <Pressable
                style={styles.menuButton}
                onPress={() => setMenuSession(item)}
                hitSlop={10}
              >
                <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.gray} />
              </Pressable>
            </View>
          </SectionCard>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <AppButton
              title="Đăng xuất mọi thiết bị"
              onPress={handleLogoutAll}
              loading={submitting}
              disabled={loading || sessions.length === 0}
            />
          </View>
        }
      />

      <Modal
        transparent
        animationType="fade"
        visible={Boolean(menuSession)}
        onRequestClose={() => setMenuSession(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuSession(null)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>
              {menuSession ? getSessionTitle(menuSession) : ""}
            </Text>
            <Pressable
              style={styles.modalAction}
              onPress={() => menuSession && confirmLogoutDevice(menuSession)}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color={theme.colors.error}
              />
              <Text style={styles.modalActionText}>Đăng xuất thiết bị này</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.layout.topLevelPadding,
    paddingBottom: 24,
    gap: theme.spacing.lg,
  },
  headerBlock: {
    marginTop: 20,
  },
  summaryCard: {
    gap: 8,
  },
  summaryTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.text,
  },
  summaryText: {
    color: theme.colors.gray,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  sessionCard: {
    marginTop: 12,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  sessionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  sessionContent: {
    flex: 1,
    gap: 6,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  sessionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "800",
    color: theme.colors.text,
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
  },
  currentBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  sessionMeta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
  },
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  footer: {
    marginTop: 20,
    marginBottom: 12,
  },
  emptyCard: {
    marginTop: 12,
    gap: 8,
  },
  emptyTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "800",
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.32)",
    justifyContent: "flex-end",
    padding: 20,
  },
  modalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    gap: 12,
  },
  modalTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "800",
    color: theme.colors.text,
  },
  modalAction: {
    minHeight: 50,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff1f2",
  },
  modalActionText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.error,
  },
});
