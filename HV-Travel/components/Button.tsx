// components/AppButton.tsx
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import theme from "../config/theme";

type Props = {
  title: string;
  onPress: () => void;
};

export default function AppButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    alignItems: "center"
  },
  text: {
    color: theme.colors.white,
    fontWeight: "bold"
  },
});
