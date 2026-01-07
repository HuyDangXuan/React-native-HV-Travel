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
import { useNavigation, useRoute } from "@react-navigation/native";
import LoadingOverlay from "../Loading/LoadingOverlay";
import { AuthService } from "../../services/AuthService";
import theme from "../../config/theme";
import { MessageBoxService } from "../MessageBox/MessageBoxService";

export default function CreateNewPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const route = useRoute<any>();
  const { otpId } = route.params as { otpId: string };

  const handleResetPassword = useCallback(async () => {
    if (!newPassword.trim()) {
      MessageBoxService.error("Lỗi", "Vui lòng nhập mật khẩu mới!", "OK");
      return;
    }
    if (newPassword.length < 6) {
      MessageBoxService.error("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự!", "OK");
      return;
    }
    if (newPassword !== rePassword) {
      MessageBoxService.error("Lỗi", "Mật khẩu nhập lại không khớp!", "OK");
      return;
    }

    setLoading(true);
    await new Promise((res) => setTimeout(res, 50));

    try {
      const res = await AuthService.resetPassword(otpId, newPassword);
      if (res.status === true) {
        navigation.replace("LoginScreen");
      }
    } catch (error: any) {
      console.log("Reset password error: ", error);
      MessageBoxService.error("Lỗi", "Không thể đặt lại mật khẩu. Vui lòng thử lại.", "OK");
    } finally {
      setLoading(false);
    }
  }, [otpId, newPassword, rePassword, navigation]);

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

        <Text style={styles.title}>Tạo mật khẩu mới</Text>
        <Text style={styles.desc}>Mật khẩu mới của bạn phải có ít nhất 6 ký tự, khác mật khẩu cũ.</Text>

        <AppInput
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          isPassword
          autoComplete="password"
          textContentType="newPassword"
        />

        <AppInput
          placeholder="Nhập lại mật khẩu"
          value={rePassword}
          onChangeText={setRePassword}
          isPassword
          autoComplete="password"
          textContentType="password"
        />

        <AppButton title="Đặt lại mật khẩu" onPress={handleResetPassword} />

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
