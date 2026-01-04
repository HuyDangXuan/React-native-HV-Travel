import { View } from "react-native";
import { useState } from "react";
import AppInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import { MessageBoxService } from "../MessageBox/MessageBoxService";
import LoadingOverlay from "../Loading/LoadingOverlay";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    console.log("Email:", email);
    console.log("Password:", password);

    // Hiển thị loading overlay
    setLoading(true);

    // Cho React kịp render overlay
    await new Promise((res) => setTimeout(res, 50));

    // Giả lập API call 2s
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setLoading(false);

    MessageBoxService.success(
      "Đăng nhập thành công!",
      "Chào mừng bạn đến với HV Travel.",
      "Oke đi thôi",
      () => {
        navigation.replace("HomeScreen");
        console.log("Navigated to HomeScreen");
      },
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <AppInput placeholder="Email" value={email} onChangeText={setEmail} />
      <AppInput placeholder="Password" value={password} onChangeText={setPassword} isPassword />

      <AppButton title="Đăng nhập" onPress={handleLogin} />

      <LoadingOverlay visible={loading} />
    </View>
  );
}
