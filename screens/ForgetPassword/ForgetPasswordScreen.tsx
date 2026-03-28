import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import AppButton from "../../components/Button";
import AppInput from "../../components/TextInput";
import AppHeader from "../../components/ui/AppHeader";
import { useI18n } from "../../context/I18nContext";
import { useAppTheme } from "../../context/ThemeModeContext";
import { AuthService } from "../../services/AuthService";
import { forgotPasswordSchema } from "../../validators/authSchema";
import { MessageBoxService } from "../MessageBox/MessageBoxService";

interface FormErrors {
  email?: string;
}

export default function ForgetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const navigation = useNavigation<any>();
  const { t } = useI18n();
  const theme = useAppTheme();

  const validateField = (fieldName: keyof FormErrors) => {
    const { error } = forgotPasswordSchema.validate({ email }, { abortEarly: true });
    const fieldError = error?.details.find((detail) => detail.path[0] === fieldName);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError?.message,
    }));
  };

  const validateForm = () => {
    const { error } = forgotPasswordSchema.validate({ email }, { abortEarly: false });

    if (!error) {
      setErrors({});
      return true;
    }

    const nextErrors: FormErrors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0] as keyof FormErrors;
      if (!nextErrors[field]) {
        nextErrors[field] = detail.message;
      }
    });
    setErrors(nextErrors);
    return false;
  };

  const handleSendEmail = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const response = await AuthService.forgotPassword(email);
      if (response.status === true) {
        navigation.navigate("CodeVerificationScreen", {
          email,
          otpId: response.otpId,
        });
      }
    } catch (error: any) {
      if (error?.status === 404) {
        setErrors({
          email: error.message || t("forgotPassword.emailNotFound"),
        });
      } else if (error?.message === "Request failed") {
        MessageBoxService.error(
          t("login.connectionErrorTitle"),
          t("login.connectionErrorMessage"),
          t("common.ok")
        );
      } else if (error?.message === "Request timeout") {
        MessageBoxService.error(
          t("login.timeoutTitle"),
          t("login.timeoutMessage"),
          t("common.ok")
        );
      } else {
        MessageBoxService.error(
          t("common.close"),
          error?.message || t("forgotPassword.genericFailed"),
          t("common.ok")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenSurface }]}>
      <AppHeader variant="compact" title={t("forgotPassword.title")} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.container, { padding: theme.spacing.lg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text
          style={[
            styles.desc,
            {
              fontSize: theme.fontSize.md,
              color: theme.semantic.textPrimary,
              marginBottom: theme.spacing.xl,
            },
          ]}
        >
          {t("forgotPassword.description")}
        </Text>

        <AppInput
          placeholder={t("login.email")}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          onBlur={() => validateField("email")}
          error={errors.email}
        />

        <AppButton title={t("forgotPassword.sendCode")} onPress={handleSendEmail} loading={loading} />
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
    justifyContent: "flex-start",
  },
  desc: {
    textAlign: "center",
  },
});
