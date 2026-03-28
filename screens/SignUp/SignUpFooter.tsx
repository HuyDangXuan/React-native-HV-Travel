import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useI18n } from "../../context/I18nContext";
import { useAppTheme } from "../../context/ThemeModeContext";

export default function SignUpFooter() {
  const navigation = useNavigation<any>();
  const { t } = useI18n();
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { marginTop: theme.spacing.lg }]}>
      <Text
        style={[
          styles.text,
          {
            fontSize: theme.fontSize.md,
            color: theme.semantic.textPrimary,
            marginTop: theme.spacing.sm,
          },
        ]}
      >
        {t("signUp.hasAccount")}{" "}
        <Text
          style={[styles.link, { color: theme.colors.primary }]}
          onPress={() => navigation.replace("LoginScreen")}
        >
          {t("signUp.signIn")}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  text: {},
  link: {
    fontWeight: "bold",
  },
});
