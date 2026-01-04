// screens/SplashScreen.tsx
import { View, Text, StyleSheet, Image } from "react-native";
import { useEffect } from "react";
import theme from "../../config/theme";

type Props = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish(); // báo là splash xong
    }, 2000); // 2s

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/favicon.png")}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
  },
  logo: {
    maxWidth: 500,
    maxHeight: 300,
    marginBottom: theme.spacing.md,
  },
});
