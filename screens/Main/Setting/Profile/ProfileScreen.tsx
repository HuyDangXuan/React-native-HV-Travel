import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useUser } from "../../../../context/UserContext";
import { useI18n } from "../../../../context/I18nContext";
import { useAppTheme } from "../../../../context/ThemeModeContext";
import AppHeader from "../../../../components/ui/AppHeader";
import IconButton from "../../../../components/ui/IconButton";
import SectionCard from "../../../../components/ui/SectionCard";

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user } = useUser();
  const { t } = useI18n();
  const theme = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenBackground }]}>
      <AppHeader
        variant="compact"
        style={{ backgroundColor: theme.semantic.screenBackground }}
        title={t("profile.title")}
        onBack={() => navigation.goBack()}
        right={
          <IconButton
            icon="settings-outline"
            onPress={() => navigation.navigate("MainTabs", { screen: "Setting" })}
          />
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, { padding: theme.layout.detailPadding, gap: theme.spacing.lg }]}
      >
        <SectionCard style={[styles.profileCard, { padding: theme.spacing.xl }]} elevated>
          <View style={[styles.avatarContainer, { marginBottom: theme.spacing.md }]}>
            <Image
              source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/200?img=12" }}
              style={[styles.avatar, { borderColor: theme.colors.primary }]}
            />
            <View
              style={[
                styles.verifiedBadge,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.semantic.screenSurface,
                },
              ]}
            >
              <Ionicons name="checkmark" size={16} color={theme.colors.white} />
            </View>
          </View>

          <Text style={[styles.name, theme.typography.pageTitle, { color: theme.semantic.textPrimary }]}>
            {user?.fullName || t("settings.profileFallbackName")}
          </Text>
          <Text style={[styles.email, { color: theme.semantic.textSecondary, fontSize: theme.fontSize.sm }]}>
            {user?.email || t("profile.fallbackEmail")}
          </Text>

          <View
            style={[
              styles.statsRow,
              {
                marginTop: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.sm,
                borderRadius: theme.radius.lg,
                backgroundColor: theme.semantic.screenMutedSurface,
              },
            ]}
          >
            <StatItem value="12" label={t("profile.tripCount")} />
            <View style={[styles.statDivider, { backgroundColor: theme.semantic.divider }]} />
            <StatItem value="8" label={t("profile.reviewCount")} />
            <View style={[styles.statDivider, { backgroundColor: theme.semantic.divider }]} />
            <StatItem value="4.8" label={t("profile.avgScore")} />
          </View>

          <Pressable
            style={[
              styles.editProfileBtn,
              {
                marginTop: theme.spacing.lg,
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.primaryLight,
              },
            ]}
            onPress={() => navigation.navigate("EditProfileScreen")}
          >
            <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.editProfileText, { color: theme.colors.primary }]}>
              {t("profile.editProfile")}
            </Text>
          </Pressable>
        </SectionCard>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, theme.typography.sectionTitle, { color: theme.semantic.textPrimary }]}>
            {t("profile.personalInfo")}
          </Text>
          <SectionCard>
            <InfoRow
              icon="call-outline"
              label={t("profile.phone")}
              value={user?.phoneNumber || t("profile.notUpdated")}
            />
            <Divider dividerColor={theme.semantic.divider} />
            <InfoRow
              icon="location-outline"
              label={t("profile.city")}
              value={user?.address?.city || t("profile.notUpdated")}
            />
            <Divider dividerColor={theme.semantic.divider} />
            <InfoRow
              icon="map-outline"
              label={t("profile.address")}
              value={user?.address?.street || t("profile.notUpdated")}
            />
            <Divider dividerColor={theme.semantic.divider} />
            <InfoRow
              icon="globe-outline"
              label={t("profile.country")}
              value={user?.address?.country || t("profile.notUpdated")}
            />
            <Divider dividerColor={theme.semantic.divider} />
            <InfoRow
              icon="ribbon-outline"
              label={t("profile.segment")}
              value={user?.segment || t("profile.defaultSegment")}
            />
          </SectionCard>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, theme.typography.sectionTitle, { color: theme.semantic.textPrimary }]}>
            {t("profile.linkedAccounts")}
          </Text>

          <SectionCard style={styles.socialCard}>
            <View style={styles.socialLeft}>
              <View style={[styles.socialIcon, { backgroundColor: "#1877F2" }]}>
                <Feather name="facebook" size={22} color={theme.colors.white} />
              </View>
              <View style={styles.socialMeta}>
                <Text style={[styles.socialTitle, { color: theme.semantic.textPrimary }]}>
                  {t("profile.facebook")}
                </Text>
                <Text style={[styles.socialDesc, { color: theme.semantic.textSecondary }]}>
                  {t("profile.notConnected")}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.connectBtn,
                {
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.primaryLight,
                },
              ]}
            >
              <Text style={[styles.connectText, { color: theme.colors.primary }]}>
                {t("profile.connect")}
              </Text>
            </View>
          </SectionCard>

          <SectionCard style={styles.socialCard}>
            <View style={styles.socialLeft}>
              <View style={[styles.socialIcon, { backgroundColor: "#EA4335" }]}>
                <Ionicons name="logo-google" size={22} color={theme.colors.white} />
              </View>
              <View style={styles.socialMeta}>
                <Text style={[styles.socialTitle, { color: theme.semantic.textPrimary }]}>
                  {t("profile.google")}
                </Text>
                <Text style={[styles.socialDesc, { color: theme.semantic.textSecondary }]}>
                  hv-travel@gmail.com
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.connectedBadge,
                {
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.primaryLight,
                },
              ]}
            >
              <Ionicons name="checkmark" size={14} color="#059669" />
              <Text style={[styles.connectedText, { color: "#059669" }]}>
                {t("profile.connected")}
              </Text>
            </View>
          </SectionCard>
        </View>

        <SectionCard style={[styles.membershipCard, { padding: theme.spacing.lg }]}>
          <View style={styles.membershipHeader}>
            <View>
              <Text style={[styles.membershipTitle, { color: theme.semantic.textPrimary }]}>
                {t("profile.membershipTitle")}
              </Text>
              <Text style={[styles.membershipDesc, { color: theme.semantic.textSecondary }]}>
                {t("profile.membershipDescription")}
              </Text>
            </View>
            <Ionicons name="medal-outline" size={32} color="#C0C0C0" />
          </View>
          <View
            style={[
              styles.progressBar,
              {
                marginTop: theme.spacing.md,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.semantic.screenMutedSurface,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: "60%", borderRadius: theme.radius.pill, backgroundColor: theme.colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { marginTop: theme.spacing.sm, color: theme.semantic.textSecondary }]}>
            {t("profile.progressTrips")}
          </Text>
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <View
          style={[
            styles.infoIconBox,
            {
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.primaryLight,
            },
          ]}
        >
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <Text style={[styles.infoLabel, { color: theme.semantic.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: theme.semantic.textPrimary }]}>{value}</Text>
    </View>
  );
}

function Divider({ dividerColor }: { dividerColor: string }) {
  return <View style={[styles.divider, { backgroundColor: dividerColor }]} />;
}

function StatItem({ value, label }: { value: string; label: string }) {
  const theme = useAppTheme();

  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: theme.semantic.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.semantic.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {},
  profileCard: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  verifiedBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  name: {},
  email: {
    marginTop: 4,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  editProfileText: {
    fontWeight: "800",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {},
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
  },
  divider: {
    height: 1,
  },
  socialCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  socialLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  socialMeta: {
    flex: 1,
  },
  socialTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  socialDesc: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "500",
  },
  connectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  connectText: {
    fontSize: 13,
    fontWeight: "800",
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  connectedText: {
    fontSize: 13,
    fontWeight: "800",
  },
  membershipCard: {},
  membershipHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  membershipTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  membershipDesc: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  progressBar: {
    height: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  progressText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
