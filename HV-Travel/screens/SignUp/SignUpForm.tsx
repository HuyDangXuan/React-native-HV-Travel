import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import AppInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import { MessageBoxService } from "../MessageBox/MessageBoxService";
import LoadingOverlay from "../Loading/LoadingOverlay";
import { registerSchema } from "../../validators/authSchema";
import { AuthService } from "../../services/AuthService";

interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
    rePassword?: string;
}

export default function SignUpForm() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const navigation = useNavigation<any>();

    // ⭐ Giờ không cần type riêng nữa
    const validateField = (fieldName: keyof FormErrors) => {
        const currentValues = { fullName, email, password, rePassword };

        const { error } = registerSchema.validate(currentValues, { 
        abortEarly: false
        });
        const fieldError = error?.details.find((e) => e.path[0] === fieldName);

        setErrors((prev) => ({
        ...prev,
        [fieldName]: fieldError?.message,
        }));
    };

    const validateForm = (): boolean => {
        const formData = { fullName, email, password, rePassword };
        
        const { error } = registerSchema.validate(formData, { 
            abortEarly: false 
        });

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

  const handleSignUp = async () => {
    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    setLoading(true);
    await new Promise((res) => setTimeout(res, 50));

    try {
      const res = await AuthService.register(fullName, email, password, rePassword);

      if (res.status === true) {
        MessageBoxService.success(
          "Thành công",
          "Đăng ký thành công!",
          "OK",
          () => {
            navigation.replace("LoginScreen");
          }
        );
      }
      
    } catch (error: any) {
      console.log("Sign Up error:", error);

      if (error.status === 409) {
        setErrors({
          email: error.message || "Email này đã được sử dụng!",
        });
      } 
      else if (error.status === 400) {
        MessageBoxService.error(
          "Dữ liệu không hợp lệ",
          error.message || "Vui lòng kiểm tra lại thông tin!",
          "OK"
        );
      } 
      else if (error.message === "Request failed") {
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
          "Đăng ký thất bại",
          error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.",
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
        placeholder="Họ tên"
        value={fullName}
        onChangeText={(text) => {
          setFullName(text);
          if (errors.fullName) {
            setErrors((prev) => ({ ...prev, fullName: undefined }));
          }
        }}
        onBlur={() => validateField("fullName")}
        error={errors.fullName}
      />

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

      <AppInput
        placeholder="Mật khẩu"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) {
            setErrors((prev) => ({ ...prev, password: undefined }));
          }
        }}
        onBlur={() => validateField("password")}
        error={errors.password}
        isPassword
      />

      <AppInput
        placeholder="Nhập lại mật khẩu"
        value={rePassword}
        onChangeText={(text) => {
          setRePassword(text);
          if (errors.rePassword) {
            setErrors((prev) => ({ ...prev, rePassword: undefined }));
          }
        }}
        onBlur={() => validateField("rePassword")}
        error={errors.rePassword}
        isPassword
      />

      <AppButton title="Đăng ký" onPress={handleSignUp} />

      <LoadingOverlay visible={loading} />
    </View>
  );
}