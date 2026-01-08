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
import { useNavigation } from "@react-navigation/native";
import LoadingOverlay from "../Loading/LoadingOverlay";
import { AuthService } from "../../services/AuthService";
import { forgotPasswordSchema } from "../../validators/authSchema";
import { MessageBoxService } from "../MessageBox/MessageBoxService";
import theme from "../../config/theme";

interface FormErrors {
  email?: string;
}

export default function ForgetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const navigation = useNavigation<any>();

  const validateField = (fieldName: keyof FormErrors) => {
    const { error } = forgotPasswordSchema.validate(
      { email },
      { abortEarly: true }
    );

    const fieldError = error?.details.find((e) => e.path[0] === fieldName);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError?.message,
    }));
  };

  const validateForm = (): boolean => {
    const { error } = forgotPasswordSchema.validate(
      { email },
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

  const handleSendEmail = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    await new Promise((res) => setTimeout(res, 50));

    try {
      const res = await AuthService.forgotPassword(email);
      if (res.status === true) {
        const otpId = res.otpId;
        navigation.navigate("CodeVerificationScreen", { email, otpId });
      }
    } catch (error: any) {
      if (error.status === 404) {
        setErrors({
          email: error.message || "Email không tồn tại trong hệ thống!",
        });
      } else if (error.message === "Request failed") {
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={theme.icon.back} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={styles.title}>Đặt lại mật khẩu</Text>
        <Text style={styles.desc}>
          Một mã xác nhận sẽ được gửi đến Email của bạn để đặt lại mật khẩu
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

        <AppButton title="Gửi mã xác nhận" onPress={handleSendEmail} />

        <LoadingOverlay visible={loading} />
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