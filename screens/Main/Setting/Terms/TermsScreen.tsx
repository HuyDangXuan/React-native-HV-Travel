import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import AppHeader from "../../../../components/ui/AppHeader";
import SectionCard from "../../../../components/ui/SectionCard";
import { useI18n } from "../../../../context/I18nContext";
import { useAppTheme } from "../../../../context/ThemeModeContext";

function TermBlock({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const theme = useAppTheme();

  return (
    <View style={styles.termBlock}>
      <Text style={[styles.termTitle, { color: theme.semantic.textPrimary }]}>{title}</Text>
      <Text style={[styles.termBody, { color: theme.semantic.textSecondary }]}>{body}</Text>
    </View>
  );
}

export default function TermsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useI18n();
  const theme = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenBackground }]}>
      <AppHeader
        variant="hero"
        title={t("terms.title")}
        subtitle={t("terms.subtitle")}
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.content, { paddingHorizontal: theme.layout.topLevelPadding }]}>
        <SectionCard style={{ marginTop: 20 }}>
          <TermBlock title={t("terms.bookingTitle")} body={t("terms.bookingBody")} />
          <TermBlock title={t("terms.paymentTitle")} body={t("terms.paymentBody")} />
          <TermBlock title={t("terms.accountTitle")} body={t("terms.accountBody")} />
          <TermBlock title={t("terms.privacyTitle")} body={t("terms.privacyBody")} />
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
  termBlock: {
    gap: 8,
    marginBottom: 18,
  },
  termTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  termBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
});
