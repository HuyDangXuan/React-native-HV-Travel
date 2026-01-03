import {View} from "react-native"
import { useState } from "react"
import AppInput from "../../components/TextInput"
import AppButton from "../../components/Button"
import { useNavigation } from "@react-navigation/native"

export default function LoginForm(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigation = useNavigation<any>();
    return(
        <View>
            <AppInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            <AppInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                isPassword={true}
            />
            <AppButton
                title="Đăng nhập"
                onPress={() => {
                    console.log("Email:", email);
                    console.log("Password:", password)
                    navigation.replace("HomeScreen");
                }}
            />
            
        </View>
    )

}