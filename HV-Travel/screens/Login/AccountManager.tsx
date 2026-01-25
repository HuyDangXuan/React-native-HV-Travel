import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../config/theme";
import { useNavigation } from "@react-navigation/native";
import { AccountStorageService, StoredAccount } from "../../services/AccountStorageService";
import * as SecureStore from "expo-secure-store";
import { MessageBoxService } from "../MessageBox/MessageBoxService";

export default function AccountManager() {
  const navigation = useNavigation<any>();
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const list = await AccountStorageService.getAccounts();
    console.log("Danh sách tài khoản: ", list);
    setAccounts(list);
  };

  const handleRemove = (account: StoredAccount) => {

    MessageBoxService.confirm({
      title: `Gỡ ${account.fullName}?`,
      content: "Bạn sẽ cần nhập email và mật khẩu vào lần đăng nhập tiếp theo.",
      confirmText: "Gỡ",
      cancelText: "Huỷ",
      onConfirm: async ()=>{
        console.log("gỡ r");
        await AccountStorageService.removeAccount(account.id);
        await SecureStore.deleteItemAsync(`token_${account.id}`);
        loadAccounts();
      }
    })
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.containerHeader}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>

          <Text style={styles.title}>Gỡ trang cá nhân khỏi thiết bị này</Text>
        </View>

        {/* ACCOUNT LIST */}
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <View style={stylesAccount.card}>
              <Image source={item.avatar} style={stylesAccount.avatar} />

              <Text numberOfLines={1} style={stylesAccount.username}>
                {item.email}
              </Text>

              <Pressable
                onPress={() => handleRemove(item)}
                style={stylesAccount.removeBtn}
              >
                <Text style={stylesAccount.removeText}>Gỡ</Text>
              </Pressable>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  containerHeader: {
    marginBottom: theme.spacing.lg,
    alignItems: "flex-start",
    justifyContent: "center",
    fontWeight: "bold",
  },
  moreBtn: {
    top: 0,
    right: 10,
    padding: 8,
    zIndex: 10,
  },
  image: {
    width: 100,
    height: 100,
    margin: theme.spacing.xl,
  },
  title: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    fontWeight: "bold",
    textAlign: "center",
  },
});

const stylesAccount = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  username: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  removeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  removeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
});
