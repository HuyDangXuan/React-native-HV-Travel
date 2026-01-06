import {View, Image, Text, TouchableOpacity, StyleSheet} from 'react-native';
import AppInput from '../../components/TextInput';
import AppButton from '../../components/Button';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import LoadingOverlay from '../Loading/LoadingOverlay';
import { AuthService } from '../../services/AuthService';
import theme from '../../config/theme';

export default function ForgetPasswordScreen(){
    const [email, setEmail] = useState("");
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);

    const handleSendEmail = async() =>{
        setLoading(true);
        await new Promise((res) => setTimeout(res, 50));
        try {
            const res = await AuthService.forgotPassword(email);
            if (res.status === true){
                const otpId = res.otpId;
                console.log("Forgot password response: ", res);
                navigation.navigate("CodeVerificationScreen", {otpId});
            }
        }
        catch(error: any){
            console.log("Forgot password error: ", error);
        }
        finally{
            setLoading(false);
        }
    }

    return(
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image source={theme.icon.back} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.desc}>Một mã xác nhận sẽ được gửi đến Email của bạn để đặt lại mật khẩu</Text>
            <AppInput placeholder="Email" value={email} onChangeText={setEmail} />
            <AppButton title="Gửi Email"
                onPress={() => handleSendEmail()}
            />
            <LoadingOverlay visible={loading} />

        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        padding: theme.spacing.lg,
        marginTop: 50
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        position: "absolute",
        top: 25,
        left: 20,
        zIndex: 10,
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
    },
    desc: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
        textAlign: "center",
    }
});