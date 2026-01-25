import React, { useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../config/theme";
import { useNavigation } from "@react-navigation/native";
import { AuthService } from "../../../services/AuthService";
import * as SecureStore from "expo-secure-store";
import { useUser } from "../../../context/UserContext";
import { MessageBoxService } from "../../MessageBox/MessageBoxService";

type RowItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  danger?: boolean;
};

type Section = {
  id: string;
  title: string;
  items: RowItem[];
};

export default function SettingScreen() {
  const navigation = useNavigation<any>();
  const {user} = useUser();

  const handleLogout = async ()=> {
    const token = await SecureStore.getItemAsync("access_token") || '';
    await SecureStore.setItemAsync("token", "");
    navigation.replace("LoginScreen");
  }
  const sections: Section[] = useMemo(
    () => [
      {
        id: "account",
        title: "Tài Khoản",
        items: [
          { id: "profile", label: "Tài Khoản", icon: "person-circle-outline", onPress: () => {
            navigation.navigate("ProfileScreen");
          } },
          { id: "payhis", label: "Lịch Sử Giao Dịch", icon: "card-outline", onPress: () => {} },
          { id: "booking", label: "Chuyến Đi Đã Đặt", icon: "cart-outline", onPress: () => {
            navigation.navigate("MyBookingScreen");
          } },
        ],
      },
      {
        id: "setting",
        title: "Cài Đặt Ứng Dụng",
        items: [
          { id: "lang", label: "Ngôn Ngữ", icon: "language-outline", onPress: () => {} },
          { id: "dark", label: "Chế Độ Tối", icon: "flash-outline", onPress: () => {} },
        ],
      },
      {
        id: "help",
        title: "Trợ Giúp & Điều Khoản",
        items: [
          { id: "help2", label: "Trợ Giúp", icon: "help-circle-outline", onPress: () => {} },
          { id: "terms", label: "Điều Khoản & Tình Trạng", icon: "alert-circle-outline", onPress: () => {} },
          {
            id: "logout",
            label: "Đăng Xuất",
            icon: "log-out-outline",
            danger: true,
            onPress: () => {
              MessageBoxService.confirm({
                  title: "Hệ thống",
                  content: "Bạn có chắc muốn đăng xuất không?",
                  cancelText: "Không",
                  confirmText: "Đăng xuất",
                  onConfirm: async() => {handleLogout()},
              });
              
            },
          },
        ],
      },
    ],
    [navigation]
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Profile header */}
      <View style={styles.profileWrap}>
        <Image
          source={{ uri: "https://i.pravatar.cc/200?img=12" }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user?.fullName}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(s) => s.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 18 }}
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View style={styles.card}>
              {section.items.map((row, idx) => {
                const isLast = idx === section.items.length - 1;

                return (
                  <Pressable
                    key={row.id}
                    onPress={row.onPress}
                    style={[styles.row, !isLast && styles.rowBorder]}
                  >
                    <View style={styles.left}>
                      <Ionicons
                        name={row.icon}
                        size={22}
                        color={row.danger ? theme.colors.error : theme.colors.primary}
                      />
                      <Text style={[styles.label, row.danger && { color: theme.colors.error }]}>
                        {row.label}
                      </Text>
                    </View>

                    {/* Chevron (trừ Logout bạn vẫn có thể để) */}
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.gray} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.white },

  profileWrap: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  profileName: {
    fontSize: theme.fontSize.xl,
    fontWeight: "800",
    color: theme.colors.text,
  },
  profileEmail: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
  },

  section: { paddingHorizontal: 18, paddingTop: 16 },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "700",
    marginBottom: 10,
  },

  card: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },

  row: {
    height: 56,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { fontSize: theme.fontSize.md, fontWeight: "700", color: theme.colors.text },
});
