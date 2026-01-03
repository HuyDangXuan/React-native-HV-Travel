import {View} from "react-native"
import { useState } from "react"
import AppInput from "../../components/TextInput"
import AppButton from "../../components/Button"
import { useNavigation } from "@react-navigation/native"
import { MessageBoxProvider, useMessageBox } from "../MessageBox/MessageBoxContext"
import { MessageBoxService } from "../MessageBox/MessageBoxService"

function MessageBoxBridge() {
  const { show } = useMessageBox();

  MessageBoxService.register(show);

  return null;
}

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
                    console.log("Password:", password);
                    MessageBoxService.success("Đăng nhập thành công!", "Chào mừng bạn đến với HV Travel.");
                    navigation.navigate("HomeScreen");
                }}
            />
            
        </View>
    )

}