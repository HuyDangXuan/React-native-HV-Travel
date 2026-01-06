import {View, Image, Text, TouchableOpacity, StyleSheet} from 'react-native';
import AppInput from '../../components/TextInput';
import AppButton from '../../components/Button';
import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthService } from '../../services/AuthService';   
import LoadingOverlay from '../Loading/LoadingOverlay';
import theme from '../../config/theme';

export default function CodeVerificationScreen(){
    const [code, setCode] = useState("")
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);
    const route = useRoute();
    const { otpId } = route.params as { otpId: string };

    const handleVerifyCode = async() =>{
        setLoading(true);
        await new Promise((res) => setTimeout(res, 50));
        try {
            const res = await AuthService.verifyOTP(otpId, code);
            if (res.status === true){
                console.log("Verify OTP response: ", res);
                navigation.navigate("CreateNewPasswordScreen", {otpId: otpId});
            }
        }
        catch(error: any){
            console.log("Verify OTP error: ", error);
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
            <Text style={styles.title}>Xác nhận mã</Text>
            <Text style={styles.desc}>Chúng tôi đã gửi một mã xác nhận đến email của bạn. Vui lòng kiểm tra hộp thư đến và nhập mã để tiếp tục.</Text>
            <AppInput
                placeholder="Mã xác nhận"
                value={code}
                onChangeText={setCode}
            />
            <AppButton
                title="Xác nhận"
                onPress={() => {
                    handleVerifyCode();
                }}
            />
            

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