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
import { useAuth } from "../../../../context/AuthContext";
import { useI18n } from "../../../../context/I18nContext";
import { useAppTheme } from "../../../../context/ThemeModeContext";
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

function formatDateTime(value: string, locale: string) {
  try {
    return new Date(value).toLocaleString(locale === "vi" ? "vi-VN" : "en-US");
  } catch {
    return value;
  }
}

export default function SecurityScreen() {
  const navigation = useNavigation<any>();
  const { token, logoutAllDevices, logoutDeviceSession } = useAuth();
  const { t, locale } = useI18n();
  const theme = useAppTheme();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [menuSession, setMenuSession] = useState<DeviceSession | null>(null);

  const getSessionTitle = useCallback(
    (session: DeviceSession) => {
      if (session.isCurrent) {
        return session.deviceLabel
          ? t("security.currentDeviceWithLabel", { label: session.deviceLabel })
          : t("security.currentDevice");
      }

      if (session.deviceLabel) {
        return session.deviceLabel;
      }

      const suffix = session.deviceId ? session.deviceId.slice(-6) : "other";
      return t("security.deviceFallback", { suffix });
    },
    [t]
  );

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
        t("security.loadSessionsFailed"),
        error?.message || t("common.close")
      );
    } finally {
      setLoading(false);
    }
  }, [t, token]);

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
      title: t("security.logoutDeviceTitle"),
      content: session.isCurrent
        ? t("security.logoutCurrentDeviceMessage")
        : t("security.logoutOtherDeviceMessage"),
      cancelText: t("common.cancel"),
      confirmText: t("security.logoutDeviceAction"),
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
            t("security.logoutDeviceFailed"),
            error?.message || t("common.close")
          );
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleLogoutAll = () => {
    MessageBoxService.confirm({
      title: t("security.logoutAllTitle"),
      content: t("security.logoutAllMessage"),
      cancelText: t("common.cancel"),
      confirmText: t("security.logoutAll"),
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
            t("security.logoutAllFailed"),
            error?.message || t("common.close")
          );
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenBackground }]}>
      <AppHeader
        variant="compact"
        style={{ backgroundColor: theme.semantic.screenBackground }}
        title={t("security.title")}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.sessionId}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: theme.layout.detailPadding,
            paddingBottom: 24,
            gap: theme.spacing.lg,
          },
        ]}
        ListHeaderComponent={
          <View style={{ marginTop: 16 }}>
            <SectionCard style={styles.summaryCard}>
              <Text style={[styles.summaryTitle, { color: theme.semantic.textPrimary }]}>
                {t("security.sessionsTitle")}
              </Text>
              <Text style={[styles.summaryText, { color: theme.semantic.textSecondary }]}>
                {loading
                  ? t("security.loadingSessions")
                  : t("security.sessionsSummary", {
                      total: sessions.length,
                      current: currentSessionCount,
                    })}
              </Text>
            </SectionCard>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <SectionCard style={styles.emptyCard}>
              <Text style={[styles.emptyTitle, { color: theme.semantic.textPrimary }]}>
                {t("security.emptyTitle")}
              </Text>
              <Text style={[styles.emptyText, { color: theme.semantic.textSecondary }]}>
                {t("security.emptyDescription")}
              </Text>
            </SectionCard>
          ) : null
        }
        renderItem={({ item }) => (
          <SectionCard style={styles.sessionCard}>
            <View style={styles.sessionRow}>
              <View
                style={[
                  styles.sessionIcon,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <Ionicons
                  name={item.isCurrent ? "phone-portrait-outline" : "hardware-chip-outline"}
                  size={20}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.sessionContent}>
                <View style={styles.sessionHeader}>
                  <Text style={[styles.sessionTitle, { color: theme.semantic.textPrimary }]}>
                    {getSessionTitle(item)}
                  </Text>
                  {item.isCurrent ? (
                    <View
                      style={[
                        styles.currentBadge,
                        { backgroundColor: theme.colors.primaryLight },
                      ]}
                    >
                      <Text
                        style={[
                          styles.currentBadgeText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {t("common.current")}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.sessionMeta, { color: theme.semantic.textSecondary }]}>
                  {t("security.lastUsed", {
                    value: formatDateTime(item.lastUsedAt, locale),
                  })}
                </Text>
                <Text style={[styles.sessionMeta, { color: theme.semantic.textSecondary }]}>
                  {t("security.signedInFrom", {
                    value: formatDateTime(item.createdAt, locale),
                  })}
                </Text>
              </View>

              <Pressable
                style={styles.menuButton}
                onPress={() => setMenuSession(item)}
                hitSlop={10}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={18}
                  color={theme.semantic.textSecondary}
                />
              </Pressable>
            </View>
          </SectionCard>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <AppButton
              title={t("security.logoutAll")}
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
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}
          onPress={() => setMenuSession(null)}
        >
          <Pressable
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.semantic.screenSurface,
                borderColor: theme.semantic.divider,
              },
            ]}
            onPress={() => undefined}
          >
            <Text style={[styles.modalTitle, { color: theme.semantic.textPrimary }]}>
              {menuSession ? getSessionTitle(menuSession) : ""}
            </Text>
            <Pressable
              style={[styles.modalAction, { borderTopColor: theme.semantic.divider }]}
              onPress={() => menuSession && confirmLogoutDevice(menuSession)}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color={theme.colors.error}
              />
              <Text style={[styles.modalActionText, { color: theme.colors.error }]}>
                {t("security.logoutDeviceAction")}
              </Text>
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
  },
  content: {},
  summaryCard: {
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: "800",
  },
  currentBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  sessionMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  menuButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  modalAction: {
    minHeight: 56,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: "800",
  },
});
