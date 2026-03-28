import { View, Text, Image, StyleSheet } from "react-native";
import { useAppTheme } from "../../context/ThemeModeContext";

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
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} />
      <Text style={[styles.title, { marginTop: theme.spacing.md }, theme.typography.heroTitle]}>
        {title}
      </Text>
      <Text
        style={[
          styles.desc,
          {
            marginTop: theme.spacing.sm,
            paddingHorizontal: theme.spacing.lg,
            color: theme.semantic.textSecondary,
          },
          theme.typography.body,
        ]}
      >
        {description}
      </Text>
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
    textAlign: "center",
  },
  desc: {
    textAlign: "center",
  },
});
