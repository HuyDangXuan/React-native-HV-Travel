import { View } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

import AppInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import { useI18n } from "../../context/I18nContext";
import { MessageBoxService } from "../MessageBox/MessageBoxService";
import { registerSchema } from "../../validators/authSchema";
import { AuthService } from "../../services/AuthService";
import { AuthSessionService } from "../../services/AuthSessionService";

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
  const { t } = useI18n();

  const validateField = (fieldName: keyof FormErrors) => {
    const currentValues = { fullName, email, password, rePassword };
    const { error } = registerSchema.validate(currentValues, { abortEarly: false });
    const fieldError = error?.details.find((e) => e.path[0] === fieldName);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError?.message,
    }));
  };

  const validateForm = (): boolean => {
    const formData = { fullName, email, password, rePassword };
    const { error } = registerSchema.validate(formData, { abortEarly: false });

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
      return;
    }

    setLoading(true);
    await new Promise((res) => setTimeout(res, 50));

    try {
      const deviceId = await AuthSessionService.getOrCreateDeviceId();
      const res = await AuthService.register(fullName, email, password, rePassword, deviceId);

      if (res.status === true) {
        MessageBoxService.success(
          t("signUp.successTitle"),
          t("signUp.successMessage"),
          t("common.ok"),
          () => {
            navigation.replace("LoginScreen");
          }
        );
      }
    } catch (error: any) {
      if (error.status === 409) {
        setErrors({
          email: error.message || t("signUp.emailTaken"),
        });
      } else if (error.status === 400) {
        MessageBoxService.error(
          t("signUp.invalidDataTitle"),
          error.message || t("signUp.invalidDataMessage"),
          t("common.ok")
        );
      } else if (error.message === "Request failed") {
        MessageBoxService.error(
          t("login.connectionErrorTitle"),
          t("login.connectionErrorMessage"),
          t("common.ok")
        );
      } else if (error.message === "Request timeout") {
        MessageBoxService.error(
          t("login.timeoutTitle"),
          t("login.timeoutMessage"),
          t("common.ok")
        );
      } else {
        MessageBoxService.error(
          t("signUp.failedTitle"),
          error.message || t("signUp.failedMessage"),
          t("common.ok")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <AppInput
        placeholder={t("signUp.fullName")}
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

      <AppInput
        placeholder={t("login.password")}
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
        placeholder={t("signUp.confirmPassword")}
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

      <AppButton title={t("signUp.submit")} loading={loading} onPress={handleSignUp} />
    </View>
  );
}
