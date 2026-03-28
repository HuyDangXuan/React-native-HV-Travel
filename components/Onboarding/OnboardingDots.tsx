import { View, StyleSheet } from "react-native";
import { useAppTheme } from "../../context/ThemeModeContext";

type Props = {
  total: number;
  current: number;
};

export default function OnboardingDots({ total, current }: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              borderRadius: theme.radius.xl,
              backgroundColor:
                current === i ? theme.colors.primary : theme.semantic.divider,
            },
            current === i && styles.active,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
  },
  active: {
    width: 22,
  },
});
