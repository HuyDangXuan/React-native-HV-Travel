import { View, Text, Image, StyleSheet } from "react-native";
import theme from "../../config/theme";

type Props = {
  image: any;
  title: string;
  description: string;
};

export default function OnboardingSlide({
  image,
  title,
  description,
}: Props) {
  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  image: {
    width: 260,
    height: 260,
    resizeMode: "contain",
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    marginTop: theme.spacing.md,
  },
  desc: {
    textAlign: "center",
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    color: theme.colors.gray,
  },
});
