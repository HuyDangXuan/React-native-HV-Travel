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
import { AuthService } from "../../services/AuthService";
import LoadingOverlay from "../Loading/LoadingOverlay";
import theme from "../../config/theme";

export default function CodeVerificationScreen() {
  const [code, setCode] = useState("");
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const route = useRoute<any>();
  const { otpId } = route.params as { otpId: string };

  const handleVerifyCode = useCallback(async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 50));

    try {
      const res = await AuthService.verifyOTP(otpId, code);
      if (res.status === true) {
        navigation.navigate("CreateNewPasswordScreen", { otpId });
      }
    } catch (error: any) {
      console.log("Verify OTP error: ", error);
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
          onChangeText={setCode}
          keyboardType="number-pad"
        />

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
});
