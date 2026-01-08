import { View } from "react-native";
import { useState } from "react";
import AppInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import { MessageBoxService } from "../MessageBox/MessageBoxService";
import LoadingOverlay from "../Loading/LoadingOverlay";
import { AuthService } from "../../services/AuthService";
import { loginSchema } from "../../validators/authSchema";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({}); // ⭐ State cho errors
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  // ⭐ Validate single field (gọi khi blur)
  const validateField = (fieldName: keyof FormErrors, value: string) => {
    const { error } = loginSchema.validate(
      { email, password, [fieldName]: value },
      { abortEarly: true }
    );

    const fieldError = error?.details.find((e) => e.path[0] === fieldName);
    
    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError?.message,
    }));
  };

  // ⭐ Validate toàn bộ form (gọi khi submit)
  const validateForm = (): boolean => {
    const { error } = loginSchema.validate(
      { email, password },
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

  const handleLogin = async () => {
    // ⭐ Validate form trước khi submit
    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    setLoading(true);
    await new Promise((res) => setTimeout(res, 50));

    try {
      const res = await AuthService.login(email, password);
      console.log("Login success: ", res);
      
      if (res.status === true) {
        navigation.replace("MainTabs");
        console.log("Login Successfully!");
      }
    } catch (error: any) {
      console.log("Login error: ", error);

      // ⭐ Chỉ dùng MessageBox cho system errors
      if (error.status === 401) {
        MessageBoxService.error(
          "Đăng nhập thất bại!",
          error.message,
          "OK"
        );
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
          error.message,
          "OK"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <AppInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          // ⭐ Clear error khi user đang nhập
          if (errors.email) {
            setErrors((prev) => ({ ...prev, email: undefined }));
          }
        }}
        onBlur={() => validateField("email", email)} // ⭐ Validate khi blur
        error={errors.email} // ⭐ Hiển thị error
      />

      <AppInput
        placeholder="Mật khẩu"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          // ⭐ Clear error khi user đang nhập
          if (errors.password) {
            setErrors((prev) => ({ ...prev, password: undefined }));
          }
        }}
        onBlur={() => validateField("password", password)} // ⭐ Validate khi blur
        error={errors.password} // ⭐ Hiển thị error
        isPassword
      />

      <AppButton title="Đăng nhập" onPress={handleLogin} />

      <LoadingOverlay visible={loading} />
    </View>
  );
}