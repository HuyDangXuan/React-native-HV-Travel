import { View, Text, StyleSheet, Image } from "react-native";
import theme from "../../config/theme";

export default function SignUpHeader() {
  return (
    <View style={styles.container}>
      <Image
        source={theme.image.logo}
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
    width: 100,
    height: 100,
    marginBottom: theme.spacing.xs, 
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    textAlign: "center",
  },
});
