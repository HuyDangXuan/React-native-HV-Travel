import {View, Image, Text, TouchableOpacity, StyleSheet} from 'react-native';
import AppInput from '../../components/TextInput';
import AppButton from '../../components/Button';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import theme from '../../config/theme';

export default function CreateNewPasswordScreen(){
    const [newPassword, setNewPassword] = useState("")
    const [rePassword, setRePassword] = useState("")
    const navigation = useNavigation<any>();

    return(
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image source={theme.icon.back} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.title}>Tạo mật khẩu mới</Text>
            <Text style={styles.desc}>Mật khẩu mới của bạn phải có ít nhất 8 ký tự, khác mật khẩu cũ.</Text>
            <AppInput
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword={true}
            />
            <AppInput
                placeholder="Nhập lại mật khẩu"
                value={rePassword}
                onChangeText={setRePassword}
                isPassword={true}
            />
            <AppButton
                title="Đặt lại mật khẩu"
                onPress={() => {
                    console.log("New Password:", newPassword);
                    navigation.replace("LoginScreen");
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