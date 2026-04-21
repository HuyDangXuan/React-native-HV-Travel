import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import AppHeader from "../../../../components/ui/AppHeader";
import SectionCard from "../../../../components/ui/SectionCard";
import { useI18n } from "../../../../context/I18nContext";
import { useAppTheme } from "../../../../context/ThemeModeContext";
import { getLocaleLabel, Locale } from "../../../../i18n";
import { MessageBoxService } from "../../../MessageBox/MessageBoxService";

export default function LanguageScreen() {
  const navigation = useNavigation<any>();
  const { locale, setLocale, t } = useI18n();
  const theme = useAppTheme();

  const handleChangeLocale = async (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    await setLocale(nextLocale);
    MessageBoxService.success(
      t("language.changedTitle"),
      t("language.changedMessage", { language: getLocaleLabel(nextLocale) })
    );
  };

  const options: Locale[] = ["vi", "en"];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenBackground }]}>
      <AppHeader
        variant="compact"
        style={{ backgroundColor: theme.semantic.screenBackground }}
        title={t("language.title")}
        onBack={() => navigation.goBack()}
        centerTitle={true}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: theme.layout.detailPadding,
            paddingBottom: 24,
            gap: theme.spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 16 }}>
          <SectionCard style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, { color: theme.semantic.textPrimary }]}>
              {t("language.title")}
            </Text>
            <Text style={[styles.summaryText, { color: theme.semantic.textSecondary }]}>
              {t("language.subtitle")}
            </Text>
          </SectionCard>
        </View>

        <SectionCard style={styles.optionGroupCard}>
          {options.map((item, index) => {
            const active = item === locale;

            return (
              <Pressable
                key={item}
                style={[
                  styles.optionRow,
                  index < options.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.semantic.divider,
                    paddingBottom: 14,
                    marginBottom: 14,
                  },
                ]}
                onPress={() => handleChangeLocale(item)}
              >
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: theme.colors.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="language-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>

                <View style={styles.optionContent}>
                  <View style={styles.optionHeader}>
                    <Text style={[styles.optionTitle, { color: theme.semantic.textPrimary }]}>
                      {getLocaleLabel(item)}
                    </Text>
                    {active ? (
                      <View
                        style={[
                          styles.currentBadge,
                          { backgroundColor: theme.colors.primaryLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.currentBadgeText,
                            { color: theme.colors.primary },
                          ]}
                        >
                          {t("common.current")}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.optionMeta, { color: theme.semantic.textSecondary }]}>
                    {item === "vi" ? "Tiếng Việt" : "English"}
                  </Text>
                </View>

                <Ionicons
                  name={active ? "checkmark-circle" : "chevron-forward"}
                  size={active ? 22 : 18}
                  color={active ? theme.colors.primary : theme.semantic.textSecondary}
                />
              </Pressable>
            );
          })}
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {},
  summaryCard: {
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  optionGroupCard: {
    marginTop: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
    gap: 6,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  optionMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  currentBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
});
