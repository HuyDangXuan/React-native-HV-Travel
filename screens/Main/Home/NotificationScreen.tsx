import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import AppHeader from "../../../components/ui/AppHeader";
import { useI18n } from "../../../context/I18nContext";
import { useAppTheme } from "../../../context/ThemeModeContext";

type NotificationTab = "trips" | "campaigns";

type NotificationItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  time: string;
};

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.semantic.screenBackground,
    },
    header: {
      backgroundColor: theme.semantic.screenBackground,
    },
    tabs: {
      flexDirection: "row",
      marginHorizontal: theme.layout.detailPadding,
      marginBottom: theme.spacing.md,
      padding: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.semantic.screenMutedSurface,
      marginTop: theme.spacing.md,
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: theme.radius.pill,
      gap: 6,
    },
    activeTab: {
      backgroundColor: theme.semantic.screenSurface,
    },
    tabText: {
      fontSize: 14,
      color: theme.semantic.textSecondary,
      fontWeight: "600",
    },
    activeText: {
      color: theme.semantic.textPrimary,
      fontWeight: "800",
    },
    badge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      paddingHorizontal: 6,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.name === "dark" ? theme.semantic.screenBackground : "#ffffff",
    },
    item: {
      flexDirection: "row",
      paddingHorizontal: theme.layout.detailPadding,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.semantic.divider,
      backgroundColor: theme.semantic.screenSurface,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    itemBody: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.semantic.textPrimary,
      marginBottom: 4,
      fontWeight: "600",
    },
    time: {
      fontSize: 12,
      color: theme.semantic.textSecondary,
    },
  });
}

export default function NotificationScreen() {
  const [activeTab, setActiveTab] = useState<NotificationTab>("trips");
  const navigation = useNavigation<any>();
  const { t } = useI18n();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const tabs = useMemo(
    () => [
      { key: "trips" as const, label: t("notifications.yourTrips") },
      { key: "campaigns" as const, label: t("notifications.campaigns") },
    ],
    [t]
  );

  const data = useMemo<NotificationItem[]>(
    () => [
      {
        id: "1",
        icon: "bag-outline",
        title: t("notifications.item1"),
        time: t("notifications.item1Time"),
      },
      {
        id: "2",
        icon: "sparkles-outline",
        title: t("notifications.item2"),
        time: t("notifications.item2Time"),
      },
      {
        id: "3",
        icon: "star-outline",
        title: t("notifications.item3"),
        time: t("notifications.item3Time"),
      },
      {
        id: "4",
        icon: "trophy-outline",
        title: t("notifications.item4"),
        time: t("notifications.item4Time"),
      },
    ],
    [t]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        style={theme.name === "dark" ? "light" : "dark"}
        backgroundColor={theme.semantic.screenBackground}
      />

      <AppHeader
        variant="compact"
        style={styles.header}
        title={t("notifications.title")}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.tabs}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, active && styles.activeText]}>{tab.label}</Text>
              {tab.key === "campaigns" ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>4</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
