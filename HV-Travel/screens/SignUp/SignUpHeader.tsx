import { View, Text, StyleSheet, Image } from "react-native";
import theme from "../../config/theme";

export default function SignUpHeader() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/header-signup.png")} // thay bằng đường dẫn ảnh của mày
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Đăng ký tài khoản</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    alignItems: "center",   
    justifyContent: "center"
  },
  image: {
    width: 500,
    height: 300,
    marginBottom: theme.spacing.xs, 
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    textAlign: "center",
  },
});
