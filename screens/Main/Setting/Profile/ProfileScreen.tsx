import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import theme from "../../../../config/theme";
import { useUser } from "../../../../context/UserContext";
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

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        variant="compact"
        style={styles.header}
        title="Tài khoản"
        //subtitle="Quản lý thông tin cá nhân và các tài khoản liên kết."
        onBack={() => navigation.goBack()}
        right={
          <IconButton
            icon="settings-outline"
            onPress={() => navigation.navigate("MainTabs", { screen: "Setting" })}
          />
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <SectionCard style={styles.profileCard} elevated>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/200?img=12" }}
              style={styles.avatar}
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={16} color={theme.colors.white} />
            </View>
          </View>

          <Text style={styles.name}>{user?.fullName || "HV Traveler"}</Text>
          <Text style={styles.email}>{user?.email || "Chưa cập nhật email"}</Text>

          <View style={styles.statsRow}>
            <StatItem value="12" label="Chuyến đi" />
            <View style={styles.statDivider} />
            <StatItem value="8" label="Đánh giá" />
            <View style={styles.statDivider} />
            <StatItem value="4.8" label="Điểm TB" />
          </View>

          <Pressable
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate("EditProfileScreen")}
          >
            <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
          </Pressable>
        </SectionCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <SectionCard>
            <InfoRow
              icon="call-outline"
              label="Số điện thoại"
              value={user?.phoneNumber || "Chưa cập nhật"}
            />
            <Divider />
            <InfoRow
              icon="location-outline"
              label="Thành phố"
              value={user?.address?.city || "Chưa cập nhật"}
            />
            <Divider />
            <InfoRow
              icon="map-outline"
              label="Địa chỉ"
              value={user?.address?.street || "Chưa cập nhật"}
            />
            <Divider />
            <InfoRow
              icon="globe-outline"
              label="Quốc gia"
              value={user?.address?.country || "Chưa cập nhật"}
            />
            <Divider />
            <InfoRow
              icon="ribbon-outline"
              label="Phân khúc"
              value={user?.segment || "Standard"}
            />
          </SectionCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản liên kết</Text>

          <SectionCard style={styles.socialCard}>
            <View style={styles.socialLeft}>
              <View style={[styles.socialIcon, { backgroundColor: "#1877F2" }]}>
                <Feather name="facebook" size={22} color={theme.colors.white} />
              </View>
              <View style={styles.socialMeta}>
                <Text style={styles.socialTitle}>Facebook</Text>
                <Text style={styles.socialDesc}>Chưa kết nối</Text>
              </View>
            </View>
            <View style={styles.connectBtn}>
              <Text style={styles.connectText}>Kết nối</Text>
            </View>
          </SectionCard>

          <SectionCard style={styles.socialCard}>
            <View style={styles.socialLeft}>
              <View style={[styles.socialIcon, { backgroundColor: "#EA4335" }]}>
                <Ionicons name="logo-google" size={22} color={theme.colors.white} />
              </View>
              <View style={styles.socialMeta}>
                <Text style={styles.socialTitle}>Google</Text>
                <Text style={styles.socialDesc}>hv-travel@gmail.com</Text>
              </View>
            </View>
            <View style={styles.connectedBadge}>
              <Ionicons name="checkmark" size={14} color="#059669" />
              <Text style={styles.connectedText}>Đã kết nối</Text>
            </View>
          </SectionCard>
        </View>

        <SectionCard style={styles.membershipCard}>
          <View style={styles.membershipHeader}>
            <View>
              <Text style={styles.membershipTitle}>Thành viên Bạc</Text>
              <Text style={styles.membershipDesc}>Còn 3 chuyến nữa lên Vàng</Text>
            </View>
            <Ionicons name="medal-outline" size={32} color="#C0C0C0" />
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "60%" }]} />
          </View>
          <Text style={styles.progressText}>6/10 chuyến đi</Text>
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <View style={styles.infoIconBox}>
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.layout.detailPadding,
    gap: theme.spacing.lg,
  },
  profileCard: {
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  verifiedBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  name: {
    ...theme.typography.pageTitle,
    color: theme.colors.text,
  },
  email: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
  },
  statLabel: {
    marginTop: 4,
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.border,
  },
  editProfileBtn: {
    marginTop: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primaryLight,
  },
  editProfileText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.text,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "700",
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  socialCard: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "800",
  },
  socialDesc: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "500",
  },
  connectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
  },
  connectText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "800",
    color: theme.colors.text,
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: "#D1FAE5",
  },
  connectedText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "800",
    color: "#059669",
  },
  membershipCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  membershipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  membershipTitle: {
    ...theme.typography.pageTitle,
    color: theme.colors.text,
  },
  membershipDesc: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "500",
  },
  progressBar: {
    marginTop: theme.spacing.lg,
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "700",
  },
});
