import React from "react";
import { Linking, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import AppHeader from "../../../../components/ui/AppHeader";
import SectionCard from "../../../../components/ui/SectionCard";
import SettingRow from "../../../../components/ui/SettingRow";
import { useI18n } from "../../../../context/I18nContext";
import { useAppTheme } from "../../../../context/ThemeModeContext";

export default function HelpScreen() {
  const navigation = useNavigation<any>();
  const { t } = useI18n();
  const theme = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenBackground }]}>
      <AppHeader
        variant="hero"
        title={t("help.title")}
        subtitle={t("help.subtitle")}
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.content, { paddingHorizontal: theme.layout.topLevelPadding }]}>
        <SectionCard padded={false} style={{ marginTop: 20 }}>
          <SettingRow
            icon="help-buoy-outline"
            title={t("help.faqTitle")}
            description={t("help.faqDescription")}
            showBorder
          />
          <SettingRow
            icon="call-outline"
            title={t("help.hotlineTitle")}
            description={t("help.hotlineDescription")}
            onPress={() => Linking.openURL("tel:19006868")}
            showBorder
          />
          <SettingRow
            icon="mail-outline"
            title={t("help.emailTitle")}
            description={t("help.emailDescription")}
            onPress={() => Linking.openURL("mailto:support@hvtravel.vn")}
            showBorder
          />
          <SettingRow
            icon="chatbubble-ellipses-outline"
            title={t("help.inboxTitle")}
            description={t("help.inboxDescription")}
            onPress={() => navigation.navigate("MainTabs", { screen: "Inbox" })}
          />
        </SectionCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
