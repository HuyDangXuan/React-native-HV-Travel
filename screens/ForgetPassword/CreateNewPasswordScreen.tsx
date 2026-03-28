import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { StyleSheet, ScrollView, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import AppButton from "../../components/Button";
import AppInput from "../../components/TextInput";
import AppHeader from "../../components/ui/AppHeader";
import { useI18n } from "../../context/I18nContext";
import { useAppTheme } from "../../context/ThemeModeContext";
import { AuthService } from "../../services/AuthService";
import { resetPasswordSchema } from "../../validators/authSchema";
import { MessageBoxService } from "../MessageBox/MessageBoxService";

interface FormErrors {
  newPassword?: string;
  reNewPassword?: string;
}

export default function CreateNewPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { otpId } = route.params as { otpId: string };
  const { t } = useI18n();
  const theme = useAppTheme();

  const validateField = (fieldName: keyof FormErrors) => {
    const { error } = resetPasswordSchema.validate(
      { newPassword, reNewPassword },
      { abortEarly: false }
    );
    const fieldError = error?.details.find((detail) => detail.path[0] === fieldName);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError?.message,
    }));
  };

  const validateForm = () => {
    const { error } = resetPasswordSchema.validate(
      { newPassword, reNewPassword },
      { abortEarly: false }
    );

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

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const response = await AuthService.resetPassword(otpId, newPassword);
      if (response.status === true) {
        MessageBoxService.success(
          t("forgotPassword.resetSuccessTitle"),
          t("forgotPassword.resetSuccessMessage"),
          t("common.ok"),
          () => navigation.replace("LoginScreen")
        );
      }
    } catch (error: any) {
      if (error?.message === "Request failed") {
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
      <AppHeader
        variant="compact"
        title={t("forgotPassword.createPasswordTitle")}
        onBack={() => navigation.goBack()}
      />

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
          {t("forgotPassword.createPasswordDescription")}
        </Text>

        <AppInput
          placeholder={t("forgotPassword.newPassword")}
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (errors.newPassword) {
              setErrors((prev) => ({ ...prev, newPassword: undefined }));
            }
          }}
          onBlur={() => validateField("newPassword")}
          error={errors.newPassword}
          isPassword
        />

        <AppInput
          placeholder={t("forgotPassword.confirmNewPassword")}
          value={reNewPassword}
          onChangeText={(text) => {
            setReNewPassword(text);
            if (errors.reNewPassword) {
              setErrors((prev) => ({ ...prev, reNewPassword: undefined }));
            }
          }}
          onBlur={() => validateField("reNewPassword")}
          error={errors.reNewPassword}
          isPassword
        />

        <AppButton
          title={t("forgotPassword.resetPassword")}
          onPress={handleResetPassword}
          loading={loading}
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
    justifyContent: "flex-start",
  },
  desc: {
    textAlign: "center",
  },
});
