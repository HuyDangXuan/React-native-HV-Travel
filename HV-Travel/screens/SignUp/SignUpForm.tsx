import {View} from "react-native"
import { useState } from "react"
import AppInput from "../../components/TextInput"
import AppButton from "../../components/Button"

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
            />
            <AppInput
                placeholder="Nhập lại mật khẩu"
                value={repassword}
                onChangeText={setRepassword}
                secureTextEntry
            />
            <AppButton
                title="Đăng ký"
                onPress={() => {
                    console.log("Email:", email);
                    console.log("Password:", password)
                }}
            />
            
        </View>
    )

}