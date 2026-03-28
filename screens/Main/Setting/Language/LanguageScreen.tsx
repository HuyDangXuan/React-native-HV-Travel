import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import AppHeader from "../../../../components/ui/AppHeader";
import SectionCard from "../../../../components/ui/SectionCard";
import SettingRow from "../../../../components/ui/SettingRow";
import { useI18n } from "../../../../context/I18nContext";
import { useAppTheme } from "../../../../context/ThemeModeContext";
import { getLocaleLabel, Locale } from "../../../../i18n";
import { MessageBoxService } from "../../../MessageBox/MessageBoxService";

export default function LanguageScreen() {
  const navigation = useNavigation<any>();
  const { locale, setLocale, t } = useI18n();
  const theme = useAppTheme();

  const handleChangeLocale = async (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

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
        variant="hero"
        title={t("language.title")}
        subtitle={t("language.subtitle")}
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.content, { paddingHorizontal: theme.layout.topLevelPadding }]}>
        <SectionCard padded={false} style={{ marginTop: 20 }}>
          {options.map((item, index) => (
            <SettingRow
              key={item}
              icon="language-outline"
              title={getLocaleLabel(item)}
              value={item === locale ? t("common.current") : undefined}
              onPress={() => handleChangeLocale(item)}
              showBorder={index < options.length - 1}
              trailing={
                item === locale ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={theme.colors.primary}
                  />
                ) : undefined
              }
            />
          ))}
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
