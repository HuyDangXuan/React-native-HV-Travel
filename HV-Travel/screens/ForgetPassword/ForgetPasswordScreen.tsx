import React, { useCallback, useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import AppInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import LoadingOverlay from "../Loading/LoadingOverlay";
import { AuthService } from "../../services/AuthService";
import theme from "../../config/theme";

export default function ForgetPasswordScreen() {
  const [email, setEmail] = useState("");
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const handleSendEmail = useCallback(async () => {
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
    } finally {
      setLoading(false);
    }
  }, [email, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={theme.icon.back} style={styles.backIcon} />
          </TouchableOpacity>

          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.desc}>
            Một mã xác nhận sẽ được gửi đến Email của bạn để đặt lại mật khẩu
          </Text>

          <AppInput placeholder="Email" value={email} onChangeText={setEmail} />

          <AppButton title="Gửi Email" onPress={handleSendEmail} />

          <LoadingOverlay visible={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.white },

  container: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl, // ✅ thay marginTop: 50
    justifyContent: "flex-start",
  },

  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10, // dễ bấm hơn
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
    marginTop: 40, // chừa chỗ cho nút back
  },
  desc: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
});
