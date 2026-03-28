import React, { useMemo } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import AppHeader from "../../../components/ui/AppHeader";
import SectionCard from "../../../components/ui/SectionCard";
import SettingRow from "../../../components/ui/SettingRow";
import { useI18n } from "../../../context/I18nContext";
import { useThemeMode, useAppTheme } from "../../../context/ThemeModeContext";
import { useAuth } from "../../../context/AuthContext";
import { useUser } from "../../../context/UserContext";
import { MessageBoxService } from "../../MessageBox/MessageBoxService";
import { getLocaleLabel } from "../../../i18n";

type Section = {
  id: string;
  title: string;
  items: Array<{
    id: string;
    label: string;
    icon: React.ComponentProps<typeof SettingRow>["icon"];
    value?: string;
    danger?: boolean;
    onPress?: () => void;
  }>;
};

export default function SettingScreen() {
  const navigation = useNavigation<any>();
  const { user } = useUser();
  const { signOut } = useAuth();
  const { t, locale } = useI18n();
  const { mode } = useThemeMode();
  const theme = useAppTheme();

  const appearanceValue =
    mode === "system"
      ? t("appearance.system")
      : mode === "dark"
        ? t("appearance.dark")
        : t("appearance.light");

  const handleSoftLogout = async () => {
    await signOut();
    navigation.replace("LoginScreen");
  };

  const sections: Section[] = useMemo(
    () => [
      {
        id: "account",
        title: t("settings.accountSection"),
        items: [
          {
            id: "profile",
            label: t("settings.profile"),
            icon: "person-circle-outline",
            onPress: () => navigation.navigate("ProfileScreen"),
          },
          {
            id: "booking",
            label: t("settings.bookings"),
            icon: "briefcase-outline",
            onPress: () => navigation.navigate("MyBookingScreen"),
          },
          {
            id: "security",
            label: t("settings.security"),
            icon: "shield-checkmark-outline",
            onPress: () => navigation.navigate("SecurityScreen"),
          },
          {
            id: "transactions",
            label: t("settings.transactions"),
            icon: "card-outline",
          },
        ],
      },
      {
        id: "app",
        title: t("settings.appSection"),
        items: [
          {
            id: "language",
            label: t("settings.language"),
            icon: "language-outline",
            value: getLocaleLabel(locale),
            onPress: () => navigation.navigate("LanguageScreen"),
          },
          {
            id: "appearance",
            label: t("settings.appearance"),
            icon: "contrast-outline",
            value: appearanceValue,
            onPress: () => navigation.navigate("AppearanceScreen"),
          },
        ],
      },
      {
        id: "support",
        title: t("settings.supportSection"),
        items: [
          {
            id: "help",
            label: t("settings.help"),
            icon: "help-circle-outline",
            onPress: () => navigation.navigate("HelpScreen"),
          },
          {
            id: "terms",
            label: t("settings.terms"),
            icon: "document-text-outline",
            onPress: () => navigation.navigate("TermsScreen"),
          },
          {
            id: "logout",
            label: t("settings.softLogout"),
            icon: "log-out-outline",
            danger: true,
            onPress: () => {
              MessageBoxService.confirm({
                title: t("settings.softLogoutTitle"),
                content: t("settings.softLogoutMessage"),
                cancelText: t("common.cancel"),
                confirmText: t("common.continue"),
                onConfirm: async () => handleSoftLogout(),
              });
            },
          },
        ],
      },
    ],
    [appearanceValue, locale, navigation, signOut, t]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenBackground }]}>
      <AppHeader variant="hero" title={t("settings.title")} />

      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: theme.layout.topLevelPadding,
            paddingBottom: 24,
            gap: theme.spacing.lg,
          },
        ]}
        ListHeaderComponent={
          <SectionCard style={[styles.profileCard, { marginTop: 20, padding: theme.spacing.lg }]} elevated>
            <Image
              source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/200?img=12" }}
              style={[styles.avatar, { backgroundColor: theme.semantic.screenMutedSurface }]}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.semantic.textPrimary }]}>
                {user?.fullName || t("settings.profileFallbackName")}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.semantic.textSecondary }]}>
                {user?.email || t("settings.profileFallbackEmail")}
              </Text>
              <Pressable
                style={[
                  styles.profileAction,
                  {
                    marginTop: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: theme.radius.pill,
                    backgroundColor: theme.semantic.screenMutedSurface,
                  },
                ]}
                onPress={() => navigation.navigate("ProfileScreen")}
              >
                <Text style={[styles.profileActionText, { color: theme.semantic.textPrimary }]}>
                  {t("settings.viewProfile")}
                </Text>
              </Pressable>
            </View>
          </SectionCard>
        }
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
              {section.title}
            </Text>
            <SectionCard padded={false}>
              {section.items.map((row, index) => (
                <SettingRow
                  key={row.id}
                  icon={row.icon}
                  title={row.label}
                  value={row.value}
                  danger={row.danger}
                  onPress={row.onPress}
                  showBorder={index < section.items.length - 1}
                />
              ))}
            </SectionCard>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {},
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
  },
  profileEmail: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  profileAction: {
    alignSelf: "flex-start",
  },
  profileActionText: {
    fontSize: 14,
    fontWeight: "800",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
});
