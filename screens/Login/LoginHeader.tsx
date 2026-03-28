import { View, StyleSheet, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../../context/ThemeModeContext";

type Props = {
  showBack?: boolean;
  onBack?: () => void;
  onMore?: () => void;
};

export default function LoginHeader({ showBack = false, onBack, onMore }: Props) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { marginBottom: theme.spacing.lg }]}>
      {showBack ? (
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={theme.semantic.textPrimary} />
        </Pressable>
      ) : (
        <Pressable onPress={onMore} style={styles.moreBtn} hitSlop={10}>
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color={theme.semantic.textPrimary}
          />
        </Pressable>
      )}

      <Image
        source={theme.image.logo}
        style={[
          styles.image,
          { marginTop: theme.spacing.lg, marginBottom: theme.spacing.xs },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 100,
    height: 100,
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
