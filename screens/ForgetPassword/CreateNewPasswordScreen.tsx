import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { StyleSheet, ScrollView, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import AppButton from "../../components/Button";
import AppInput from "../../components/TextInput";
import AppHeader from "../../components/ui/AppHeader";
import theme from "../../config/theme";
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
          "Thành công",
          "Đặt lại mật khẩu thành công!",
          "OK",
          () => navigation.replace("LoginScreen")
        );
      }
    } catch (error: any) {
      if (error?.message === "Request failed") {
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
        title="Tạo mật khẩu mới"
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
          Mật khẩu mới của bạn phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ
          thường và số.
        </Text>

        <AppInput
          placeholder="Mật khẩu mới"
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
          placeholder="Nhập lại mật khẩu"
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
          title="Đặt lại mật khẩu"
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
