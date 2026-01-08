import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import AppInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import { useNavigation, useRoute } from "@react-navigation/native";
import LoadingOverlay from "../Loading/LoadingOverlay";
import { AuthService } from "../../services/AuthService";
import { resetPasswordSchema } from "../../validators/authSchema";
import theme from "../../config/theme";
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
    const currentValues = { newPassword, reNewPassword };

    const { error } = resetPasswordSchema.validate(currentValues, {
      abortEarly: false,
    });

    const fieldError = error?.details.find((e) => e.path[0] === fieldName);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError?.message,
    }));
  };

  const validateForm = (): boolean => {
    const { error } = resetPasswordSchema.validate(
      { newPassword, reNewPassword },
      { abortEarly: false }
    );

    if (error) {
      const newErrors: FormErrors = {};
      error.details.forEach((detail) => {
        const field = detail.path[0] as keyof FormErrors;
        if (!newErrors[field]) {
          newErrors[field] = detail.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    await new Promise((res) => setTimeout(res, 50));

    try {
      const res = await AuthService.resetPassword(otpId, newPassword);
      if (res.status === true) {
        MessageBoxService.success(
          "Thành công",
          "Đặt lại mật khẩu thành công!",
          "OK",
          () => {
            navigation.replace("LoginScreen");
          }
        );
      }
    } catch (error: any) {
      if (error.message === "Request failed") {
        MessageBoxService.error(
          "Lỗi kết nối",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
          "OK"
        );
      } else if (error.message === "Request timeout") {
        MessageBoxService.error(
          "Hết thời gian chờ",
          "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.",
          "OK"
        );
      } else {
        MessageBoxService.error(
          "Lỗi",
          error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.",
          "OK"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image source={theme.icon.back} style={styles.backIcon} />
          </TouchableOpacity>

          <Text style={styles.title}>Tạo mật khẩu mới</Text>
          <Text style={styles.desc}>
            Mật khẩu mới của bạn phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
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

        <AppButton title="Đặt lại mật khẩu" onPress={handleResetPassword} />

        <LoadingOverlay visible={loading} />
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.white },
  container: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    justifyContent: "flex-start",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    marginBottom: theme.spacing.md,
    textAlign: "center",
    marginTop: 40,
  },
  desc: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
});