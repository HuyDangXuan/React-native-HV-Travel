import {View} from "react-native"
import { useState } from "react"
import AppInput from "../../components/TextInput"
import AppButton from "../../components/Button"
import { MessageBoxProvider, useMessageBox } from "../MessageBox/MessageBoxContext"
import { MessageBoxService } from "../MessageBox/MessageBoxService"


export default function SignUpForm(){
    const [fullname, setFullname] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [repassword, setRepassword] = useState("")
    return(
        <View>
            <AppInput
                placeholder="Họ tên"
                value={fullname}
                onChangeText={setFullname}
            />
            <AppInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            <AppInput
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                isPassword={true}
            />
            <AppInput
                placeholder="Nhập lại mật khẩu"
                value={repassword}
                onChangeText={setRepassword}
                isPassword={true}
            />
            <AppButton
                title="Đăng ký"
                onPress={() => {
                    console.log("Email:", email);
                    console.log("Password:", password);
                    const answer = MessageBoxService.confirm({
                        title: "Xác nhận đăng ký",
                        content: `Bạn có chắc chắn muốn đăng ký tài khoản với email ${email}?`,
                        onConfirm: () => {
                            setTimeout(() => {
                                MessageBoxService.success("Đăng ký thành công!", "Chào mừng bạn đến với HV Travel.", "OK");
                            }, 20);
                        },
                        onCancel: () => {
                            setTimeout(() => {
                                MessageBoxService.error("Đăng ký thất bại!", "Vui lòng kiểm tra lại thông tin.", "OK");
                            }, 20);
                        },
                    });
                    
                    
                }}
            />
            
        </View>
    )

}