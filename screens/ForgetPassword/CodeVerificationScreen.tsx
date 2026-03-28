import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useState } from "react";
import { Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import AppButton from "../../components/Button";
import AppInput from "../../components/TextInput";
import AppHeader from "../../components/ui/AppHeader";
import { useI18n } from "../../context/I18nContext";
import { useAppTheme } from "../../context/ThemeModeContext";
import { AuthService } from "../../services/AuthService";
import { verifyOtpSchema } from "../../validators/authSchema";
import { MessageBoxService } from "../MessageBox/MessageBoxService";

interface FormErrors {
  code?: string;
}

export default function CodeVerificationScreen() {
  const [code, setCode] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentOtpId, setCurrentOtpId] = useState("");

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email, otpId } = route.params as { email: string; otpId: string };
  const { t } = useI18n();
  const theme = useAppTheme();

  useEffect(() => {
    setCurrentOtpId(otpId);
  }, [otpId]);

  useEffect(() => {
    if (!resendDisabled) {
      return;
    }

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setResendDisabled(false);
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendDisabled]);

  const validateField = (fieldName: keyof FormErrors) => {
    const { error } = verifyOtpSchema.validate({ code }, { abortEarly: false });
    const fieldError = error?.details.find((detail) => detail.path[0] === fieldName);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError?.message,
    }));
  };

  const validateForm = () => {
    const { error } = verifyOtpSchema.validate({ code }, { abortEarly: false });

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

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await AuthService.forgotPassword(email);
      if (response.status === true) {
        setCurrentOtpId(response.otpId);
        setResendDisabled(true);
        setResendTimer(60);
      }
    } catch (error: any) {
      MessageBoxService.error(
        t("common.close"),
        error?.message || t("forgotPassword.genericFailed"),
        t("common.ok")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const response = await AuthService.verifyOTP(currentOtpId || otpId, code);
      if (response.status === true) {
        navigation.navigate("CreateNewPasswordScreen", {
          otpId: currentOtpId || otpId,
        });
      }
    } catch (error: any) {
      MessageBoxService.error(
        t("common.close"),
        error?.message || t("forgotPassword.invalidCode"),
        t("common.ok")
      );
    } finally {
      setLoading(false);
    }
  }, [code, currentOtpId, navigation, otpId, t]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenSurface }]}>
      <AppHeader variant="compact" title={t("forgotPassword.verifyTitle")} onBack={() => navigation.goBack()} />

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
          {t("forgotPassword.verifyDescription")}
        </Text>

        <AppInput
          placeholder={t("forgotPassword.verifyPlaceholder")}
          value={code}
          keyboardType="number-pad"
          onChangeText={(text) => {
            setCode(text);
            if (errors.code) {
              setErrors((prev) => ({ ...prev, code: undefined }));
            }
          }}
          onBlur={() => validateField("code")}
          error={errors.code}
        />

        <Pressable onPress={handleResendCode} disabled={resendDisabled || loading}>
          <Text
            style={[
              styles.resendCode,
              {
                color:
                  resendDisabled || loading ? theme.colors.gray : theme.colors.primary,
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            {resendDisabled
              ? t("forgotPassword.resendCountdown", { seconds: resendTimer })
              : t("forgotPassword.resend")}
          </Text>
        </Pressable>

        <AppButton title={t("forgotPassword.verify")} onPress={handleVerifyCode} loading={loading} />
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
  resendCode: {
    fontWeight: "600",
  },
});
