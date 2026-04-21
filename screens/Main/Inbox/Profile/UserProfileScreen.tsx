import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import theme from "../../../../config/theme";
import AppHeader from "../../../../components/ui/AppHeader";
import SectionCard from "../../../../components/ui/SectionCard";
import AppButton from "../../../../components/Button";

export default function UserProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    name = "Marcella",
    avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    location = "Santorini, Hy Lạp",
    joinedDate = "Tháng 6, 2023",
  } = route.params || {};

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.coverWrap}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80" }}
          style={styles.coverImage}
        />
        <AppHeader
          variant="overlay"
          title={name}
          subtitle={`${location} • Thành viên từ ${joinedDate}`}
          onBack={() => navigation.goBack()}
          centerTitle={true}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionCard style={styles.heroCard} elevated>
          <View style={styles.avatarSection}>
            <Image source={{ uri: avatar }} style={styles.profileAvatar} />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-sharp" size={14} color={theme.colors.white} />
            </View>
          </View>

          <View style={styles.statsRow}>
            <Stat value="24" label="Chuyến đi" />
            <View style={styles.dividerVertical} />
            <Stat value="4.9" label="Đánh giá" />
            <View style={styles.dividerVertical} />
            <Stat value="2 năm" label="Thành viên" />
          </View>
        </SectionCard>

        <SectionCard style={styles.section}>
          <Text style={styles.sectionTitle}>Về mình</Text>
          <Text style={styles.sectionText}>
            Mình là một người yêu thích du lịch và khám phá những vùng đất mới. Santorini là nơi
            mình đang sinh sống và mình rất vui khi được chia sẻ những trải nghiệm tuyệt vời tại
            đây cùng các bạn.
          </Text>
        </SectionCard>

        <SectionCard style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đã xác minh</Text>
          <VerifyItem text="Địa chỉ email" />
          <VerifyItem text="Số điện thoại" />
          <VerifyItem text="Căn cước công dân" />
        </SectionCard>

        <SectionCard style={styles.section}>
          <Text style={styles.sectionTitle}>Chỗ nghỉ / Tour của {name}</Text>
          <Pressable style={styles.tourCard}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&q=80" }}
              style={styles.tourThumb}
            />
            <View style={styles.tourInfo}>
              <Text style={styles.tourTitle} numberOfLines={1}>
                Biệt thự hướng biển Santorini
              </Text>
              <Text style={styles.tourPrice}>2.500.000 VNĐ / đêm</Text>
            </View>
          </Pressable>
        </SectionCard>

        <AppButton title="Gửi tin nhắn" onPress={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function VerifyItem({ text }: { text: string }) {
  return (
    <View style={styles.verifyItem}>
      <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.primary} />
      <Text style={styles.verifyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  coverWrap: {
    height: 260,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: theme.layout.detailPadding,
    gap: theme.spacing.lg,
  },
  heroCard: {
    marginTop: -56,
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  avatarSection: {
    marginTop: -70,
    position: "relative",
  },
  profileAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: theme.colors.white,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    width: "100%",
    marginTop: theme.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
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
  dividerVertical: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  section: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.text,
  },
  sectionText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  verifyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  verifyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: "600",
  },
  tourCard: {
    flexDirection: "row",
    gap: 12,
  },
  tourThumb: {
    width: 96,
    height: 96,
    borderRadius: 16,
  },
  tourInfo: {
    flex: 1,
    justifyContent: "center",
  },
  tourTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "800",
  },
  tourPrice: {
    marginTop: 8,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "800",
  },
});
