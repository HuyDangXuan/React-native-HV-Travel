import { View, Text, StyleSheet, Image } from "react-native";

import { useI18n } from "../../context/I18nContext";
import { useAppTheme } from "../../context/ThemeModeContext";

export default function SignUpHeader() {
  const { t } = useI18n();
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { marginBottom: theme.spacing.lg }]}>
      <Image
        source={theme.image.logo}
        style={[styles.image, { marginBottom: theme.spacing.xs }]}
        resizeMode="contain"
      />

      <Text
        style={[
          styles.title,
          {
            fontSize: theme.fontSize.xl,
            color: theme.semantic.textPrimary,
          },
        ]}
      >
        {t("signUp.title")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 100,
    height: 100,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
  },
});
