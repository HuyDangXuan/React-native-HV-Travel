// components/AppButton.tsx
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import theme from "../config/theme";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function AppButton({ title, loading, disabled, onPress }: Props) {
  return (
    <TouchableOpacity style={[
      styles.button,
      (loading || disabled) && styles.buttonDisabled
      ]} onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}>
      { loading ? (
        <LottieView source={theme.animation.loading} 
        autoPlay
        loop
        style={styles.loading}
      />
      ): (
        <Text style={styles.text}>{title}</Text>
      )}
      
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loading: {
    width: 100,
    height: 80,
  },
  text: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: theme.fontSize.md,
  },
});
