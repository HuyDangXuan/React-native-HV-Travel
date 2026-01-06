import { View } from "react-native";
import { useState } from "react";
import AppInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import { MessageBoxService } from "../MessageBox/MessageBoxService";
import LoadingOverlay from "../Loading/LoadingOverlay";
import { AuthService } from "../../services/AuthService";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const checkValidData = () =>{
    if (!email.trim()) {
      MessageBoxService.error("Lỗi", "Vui lòng nhập email!", "OK");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      MessageBoxService.error("Lỗi", "Email không hợp lệ!", "OK");
      return false;
    }
    if (!password.trim()){
      MessageBoxService.error("Lỗi", "Vui lòng nhập mật khẩu!", "OK");
      return false;
    }

    return true;

  }
  const handleLogin = async () => {
    
    const resultValid = await checkValidData();
    if (!resultValid) return;
    setLoading(true);
    await new Promise((res) => setTimeout(res, 50));
    try{
      const res = await AuthService.login(email, password);
      console.log("Login success: ", res);
      if (res.status === true){
        navigation.replace("HomeScreen");
        console.log("Login Successfully!");
      }
    }
    catch(error: any){
      console.log("Login error: ", error);
      
      if (error.status === 401){
        MessageBoxService.error(
          "Đăng nhập thất bại!",
          error.message,
          "Ok",
        );
      }
      else if (error.message === "Request failed"){
        MessageBoxService.error(
          "Lỗi kết nối",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
          "OK"
        );
      }
      else if (error.message === "Request timeout"){
        MessageBoxService.error(
          "Hết thời gian chờ",
          "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.",
          "OK"
        );
      }
      else{
        MessageBoxService.error(
          "Lỗi",
          "Đã xảy ra lỗi. Vui lòng thử lại sau.",
          "OK"
        );
      }
    }
    finally{
      setLoading(false);
    }

    
  };

  return (
    <View>
      <AppInput placeholder="Email" value={email} onChangeText={setEmail} />
      <AppInput placeholder="Password" value={password} onChangeText={setPassword} isPassword />

      <AppButton title="Đăng nhập" onPress={handleLogin} />

      <LoadingOverlay visible={loading} />
    </View>
  );
}
