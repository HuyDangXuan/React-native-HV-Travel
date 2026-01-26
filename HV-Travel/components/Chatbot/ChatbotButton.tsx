import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../config/theme";

export default function ChatbotButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.btn} onPress={onPress}>
      <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    right: 20,
    bottom: 90, // né bottom CTA
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
