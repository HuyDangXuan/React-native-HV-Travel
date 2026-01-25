import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import theme from "../../config/theme";

type Props = {
  showBack?: boolean;
  onBack?: () => void;
  onMore?: () => void;
};

export default function LoginHeader({
  showBack = false,
  onBack,
  onMore,
}: Props) {
  return (
    <View style={styles.container}>
      
      {/* Arrow Back */}
      {showBack && (
        <Pressable
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
      )}

      {/* More button */}
      {!showBack && (
        <Pressable
          onPress={onMore}
          style={styles.moreBtn}
          hitSlop={10}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color="#333" />
        </Pressable>
      )}

      {/* Logo */}
      <Image
        source={theme.image.logo}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: theme.spacing.lg,
    alignItems: "center",   
    justifyContent: "center"
  },
  image: {
    width: 100,
    height: 100,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs, 
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    textAlign: "center",
  },
  moreBtn: {
    position: "absolute",
    top: 0,
    right: 0,
  },
   backBtn: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
