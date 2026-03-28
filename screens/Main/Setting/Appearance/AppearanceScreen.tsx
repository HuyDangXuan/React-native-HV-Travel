import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import AppHeader from "../../../../components/ui/AppHeader";
import SectionCard from "../../../../components/ui/SectionCard";
import SettingRow from "../../../../components/ui/SettingRow";
import { ThemeMode } from "../../../../config/theme";
import { useI18n } from "../../../../context/I18nContext";
import { useAppTheme, useThemeMode } from "../../../../context/ThemeModeContext";

export default function AppearanceScreen() {
  const navigation = useNavigation<any>();
  const { t } = useI18n();
  const { mode, setThemeMode } = useThemeMode();
  const theme = useAppTheme();

  const options: ThemeMode[] = ["system", "light", "dark"];
  const labelMap: Record<ThemeMode, string> = {
    system: t("appearance.system"),
    light: t("appearance.light"),
    dark: t("appearance.dark"),
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenBackground }]}>
      <AppHeader
        variant="hero"
        title={t("appearance.title")}
        subtitle={t("appearance.subtitle")}
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.content, { paddingHorizontal: theme.layout.topLevelPadding }]}>
        <SectionCard padded={false} style={{ marginTop: 20 }}>
          {options.map((item, index) => (
            <SettingRow
              key={item}
              icon="contrast-outline"
              title={labelMap[item]}
              value={item === mode ? t("appearance.currentMode") : undefined}
              onPress={() => setThemeMode(item)}
              showBorder={index < options.length - 1}
              trailing={
                item === mode ? (
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
