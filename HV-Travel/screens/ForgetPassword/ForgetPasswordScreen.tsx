import React, { useCallback, useState } from "react";
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
import theme from "../../config/theme";
import { MessageBoxService } from "../MessageBox/MessageBoxService";

export default function ForgetPasswordScreen() {
  const [email, setEmail] = useState("");
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const handleSendEmail = useCallback(async () => {
    if (!email.trim()) {
      MessageBoxService.error("Lỗi", "Vui lòng nhập email!", "OK");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      MessageBoxService.error("Lỗi", "Email không hợp lệ!", "OK");
      return;
    }

    setLoading(true);
    await new Promise((res) => setTimeout(res, 50));

    try {
      const res = await AuthService.forgotPassword(email);
      if (res.status === true) {
        const otpId = res.otpId;
        navigation.navigate("CodeVerificationScreen", { otpId });
      }
    } catch (error: any) {
      console.log("Forgot password error: ", error);
      MessageBoxService.error("Lỗi", "Không thể gửi email. Vui lòng thử lại.", "OK");
    } finally {
      setLoading(false);
    }
  }, [email, navigation]);

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

        <Text style={styles.title}>Đặt lại mật khẩu</Text>
        <Text style={styles.desc}>
          Một mã xác nhận sẽ được gửi đến Email của bạn để đặt lại mật khẩu
        </Text>

        <AppInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <AppButton title="Gửi Email" onPress={handleSendEmail} />

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
