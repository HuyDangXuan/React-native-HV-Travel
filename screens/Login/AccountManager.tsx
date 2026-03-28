import React, { useEffect, useState } from "react";
import { View, Image, Text, StyleSheet, ScrollView, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import AppHeader from "../../components/ui/AppHeader";
import { useI18n } from "../../context/I18nContext";
import { useAppTheme } from "../../context/ThemeModeContext";
import { AccountStorageService, StoredAccount } from "../../services/AccountStorageService";
import { MessageBoxService } from "../MessageBox/MessageBoxService";

export default function AccountManager() {
  const navigation = useNavigation<any>();
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const { t } = useI18n();
  const theme = useAppTheme();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const list = await AccountStorageService.getAccounts();
    setAccounts(list);
  };

  const handleRemove = (account: StoredAccount) => {
    MessageBoxService.confirm({
      title: t("accountManager.removeTitle", { name: account.fullName }),
      content: t("accountManager.removeMessage"),
      confirmText: t("accountManager.removeAction"),
      cancelText: t("common.cancel"),
      onConfirm: async () => {
        await AccountStorageService.removeAccount(account.id);
        loadAccounts();
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenSurface }]}>
      <AppHeader
        variant="compact"
        title={t("accountManager.title")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.container, { padding: theme.layout.detailPadding }]}
      >
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <View
              style={[
                stylesAccount.card,
                {
                  backgroundColor: theme.semantic.screenSurface,
                  borderColor: theme.semantic.divider,
                },
              ]}
            >
              <Image source={item.avatar || theme.image.testAvatar} style={stylesAccount.avatar} />

              <Text
                numberOfLines={1}
                style={[
                  stylesAccount.username,
                  { color: theme.semantic.textPrimary, fontSize: theme.fontSize.sm },
                ]}
              >
                {item.email}
              </Text>

              <Pressable
                onPress={() => handleRemove(item)}
                style={[
                  stylesAccount.removeBtn,
                  {
                    borderColor: theme.semantic.divider,
                    backgroundColor: theme.semantic.screenMutedSurface,
                  },
                ]}
              >
                <Text style={[stylesAccount.removeText, { color: theme.semantic.textPrimary }]}>
                  {t("common.remove")}
                </Text>
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
  },
  container: {
    flexGrow: 1,
  },
});

const stylesAccount = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  username: {
    flex: 1,
    fontWeight: "600",
  },
  removeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  removeText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
