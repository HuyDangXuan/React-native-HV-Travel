import {View, Text, Image, StyleSheet, TouchableOpacity} from "react-native"
import theme from "../../config/theme";
import { useNavigation } from "@react-navigation/native";

export default function LoginFooter(){
    const navigation = useNavigation<any>();

    return(
        <View style={styles.container}>
            <Text style={styles.text} onPress={()=> navigation.navigate("ForgetPassword")}>
                Quên mật khẩu?</Text>
            <Text style={styles.text}>Chưa có tài khoản?{' '}
                <Text style={styles.link} onPress={() => navigation.replace("SignUp")}>
                    Đăng ký</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: theme.spacing.lg,
        alignItems: "center",
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
    },
    backIcon:{
        width: 24,
        height: 24,
    },
    text: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        marginTop: theme.spacing.sm,
    },
    link: {
        color: theme.colors.primary,
        fontWeight: "bold",
    },
});