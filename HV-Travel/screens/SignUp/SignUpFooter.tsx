import {View, Text, StyleSheet, TouchableOpacity} from "react-native"
import theme from "../../config/theme";
import { useNavigation } from "@react-navigation/native";

export default function SignUpFooter(){
    const navigation = useNavigation<any>();
    return(
        <View style={styles.container}>
            <Text style={styles.text}>Đã có tài khoản?{' '}
                <Text style={styles.link} onPress={() => navigation.replace("LoginScreen")}>
                                    Đăng nhập</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: theme.spacing.lg,
        alignItems: "center",
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