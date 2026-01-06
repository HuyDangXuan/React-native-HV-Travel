import {View} from "react-native"
import { useState } from "react"
import AppInput from "../../components/TextInput"
import AppButton from "../../components/Button"
import { useNavigation } from "@react-navigation/native";
import { MessageBoxService } from "../MessageBox/MessageBoxService"
import LoadingOverlay from "../Loading/LoadingOverlay";
import { AuthService } from "../../services/AuthService"

export default function SignUpForm(){
    const [fullname, setFullname] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [repassword, setRepassword] = useState("")
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    const checkValidData = ()=>{
        if (!fullname.trim()) {
            MessageBoxService.error("Lỗi", "Vui lòng nhập họ tên!", "OK");
            return false;
        }
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
        if (!repassword.trim()){
            MessageBoxService.error("Lỗi", "Vui lòng nhập mật khẩu xác nhận!", "OK");
            return false;
        } 
        if (password.trim().length < 6){
            MessageBoxService.error("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự!", "OK");
            return false;
        }
        if (password.trim() !== repassword.trim()){
            MessageBoxService.error("Lỗi", "Mật khẩu và mật khẩu xác nhận không khớp!", "OK");
            return false;
        } 

        return true;
    }

    const handleSignUp = async() =>
    {
        const resultValid = checkValidData();
        if (!resultValid) return;
        setLoading(true);
        await new Promise((res) => setTimeout(res, 50)); 
        console.log("fullname: ", fullname, " email: ", email, " password: ", password, " repassword: ", repassword);
        try {
            const res = await AuthService.register(fullname, email, password, repassword);
            if (res.status === true){
                MessageBoxService.success("Thành công", "Đăng ký thành công!", "OK",
                ()=> {
                    navigation.replace("LoginScreen");
                });
            }
            console.log("Sign Up success: ", res);
        }
        catch(error:any){
            console.log("Login error: ", error);
            if (error.message === "Request failed"){
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
            else {
                MessageBoxService.error(
                    "Đăng ký thất bại",
                    error.message,
                    "OK"
                );
            }
        }
        finally{
            setLoading(false);
        }
    }

    return(
        <View>
            <AppInput placeholder="Họ tên" value={fullname} onChangeText={setFullname}/>
            <AppInput placeholder="Email" value={email} onChangeText={setEmail} />
            <AppInput placeholder="Mật khẩu" value={password} onChangeText={setPassword} isPassword={true} />
            <AppInput placeholder="Nhập lại mật khẩu" value={repassword} onChangeText={setRepassword} isPassword={true} />
            <AppButton title="Đăng ký" onPress={handleSignUp} />
            <LoadingOverlay visible={loading} />
        </View>
    )

}