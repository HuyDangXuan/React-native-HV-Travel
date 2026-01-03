import { View, StyleSheet } from "react-native";
import theme from "../../config/theme";

type Props = {
  total: number;
  current: number;
};

export default function OnboardingDots({ total, current }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            current === i && styles.active,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
    container: 
    {
        flexDirection: "row",
        justifyContent: "center"
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.gray,
        margin: theme.spacing.xs,
    },
    active: {
        width: 15,
        backgroundColor: theme.colors.primary,
    },
});
