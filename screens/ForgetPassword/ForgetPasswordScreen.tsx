import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import AppButton from "../../components/Button";
import AppInput from "../../components/TextInput";
import AppHeader from "../../components/ui/AppHeader";
import theme from "../../config/theme";
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
          email: error.message || "Email không tồn tại trong hệ thống.",
        });
      } else if (error?.message === "Request failed") {
        MessageBoxService.error(
          "Lỗi kết nối",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
          "OK"
        );
      } else if (error?.message === "Request timeout") {
        MessageBoxService.error(
          "Hết thời gian chờ",
          "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.",
          "OK"
        );
      } else {
        MessageBoxService.error(
          "Lỗi",
          error?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.",
          "OK"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        variant="compact"
        title="Đặt lại mật khẩu"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={styles.desc}>
          Một mã xác nhận sẽ được gửi đến email của bạn để đặt lại mật khẩu.
        </Text>

        <AppInput
          placeholder="Email"
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

        <AppButton
          title="Gửi mã xác nhận"
          onPress={handleSendEmail}
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: "flex-start",
  },
  desc: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
});
