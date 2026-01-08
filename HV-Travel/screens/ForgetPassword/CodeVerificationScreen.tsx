import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "react-native";
import AppInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AuthService } from "../../services/AuthService";
import LoadingOverlay from "../Loading/LoadingOverlay";
import { MessageBoxService } from "../MessageBox/MessageBoxService";
import { verifyOtpSchema } from "../../validators/authSchema";
import theme from "../../config/theme";

interface FormErrors {
  code?: string;
}

export default function CodeVerificationScreen() {
    const [code, setCode] = useState("");
    const navigation = useNavigation<any>();
    const [resendTimer, setResendTimer] = useState(60);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const route = useRoute<any>();
    const { email, otpId } = route.params as { email: string; otpId: string };

    useEffect(()=>{
        if (!resendDisabled) return;
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

    const [currentOtpId, setCurrentOtpId] = useState(otpId); // state để lưu otpId mới

    const handleResendCode = async () => {
    setLoading(true);
    try {
        const res = await AuthService.forgotPassword(email);
        if (res.status === true) {
        setCurrentOtpId(res.otpId); // cập nhật otpId mới
        setResendDisabled(true);
        setResendTimer(60); // reset timer
        }
    } catch (err: any) {
        MessageBoxService.error("Lỗi", err.message || "Không thể gửi lại mã", "OK");
    } finally {
        setLoading(false);
    }
    };


    const validateField = (fieldName: keyof FormErrors) => {
        const currentValues = { code };

        const { error } = verifyOtpSchema.validate(currentValues, {
        abortEarly: false,
        });

        const fieldError = error?.details.find((e) => e.path[0] === fieldName);

        setErrors((prev) => ({
        ...prev,
        [fieldName]: fieldError?.message,
        }));
    };
    const validateForm = (): boolean => {
        const { error } = verifyOtpSchema.validate(
        { code },
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

  const handleVerifyCode = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    await new Promise((res) => setTimeout(res, 50));

    try {
      const res = await AuthService.verifyOTP(otpId, code);
      if (res.status === true) {
        navigation.navigate("CreateNewPasswordScreen", { otpId });
      }
    } catch (error: any) {
      MessageBoxService.error("Lỗi", error.message, "OK");
    } finally {
      setLoading(false);
    }
  }, [otpId, code, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={theme.icon.back} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={styles.title}>Xác nhận mã</Text>
        <Text style={styles.desc}>
          Chúng tôi đã gửi một mã xác nhận đến email của bạn. Vui lòng kiểm tra hộp thư đến và nhập mã để tiếp tục.
        </Text>

          <AppInput
            placeholder="Mã xác nhận"
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
          <Pressable
            onPress={handleResendCode}
            disabled={resendDisabled}
            >
            <Text style={[styles.resendCode, { color: resendDisabled ? theme.colors.gray : theme.colors.primary }]}>
                {resendDisabled ? `Gửi lại mã (${resendTimer}s)` : "Gửi lại mã"}
            </Text>
            </Pressable>
          

        <AppButton title="Xác nhận" onPress={handleVerifyCode} />

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
  resendCode:{
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
});
