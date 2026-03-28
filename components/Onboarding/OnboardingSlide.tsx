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
      <View
        style={[
          styles.imageStageInner,
          {
            backgroundColor: theme.semantic.screenElevated,
            borderColor: theme.semantic.divider,
          },
        ]}
      >
        <Image source={image} style={styles.image} />
      </View>
      <Text
        style={[
          styles.title,
          {
            marginTop: theme.spacing.lg,
            color: theme.semantic.textPrimary,
          },
          theme.typography.heroTitle,
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.desc,
          {
            marginTop: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
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
    width: "100%",
  },
  imageStageInner: {
    width: 290,
    height: 290,
    borderRadius: 145,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 260,
    height: 260,
    resizeMode: "contain",
  },
  title: {
    textAlign: "center",
    maxWidth: 300,
  },
  desc: {
    textAlign: "center",
    maxWidth: 320,
  },
});
