import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { onboardingData } from "../../data/onboardingData";
import OnboardingSlide from "../../components/Onboarding/OnboardingSlide";
import OnboardingDots from "../../components/Onboarding/OnboardingDots";
import AppButton from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import theme from "../../config/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenContainer from "../../components/ui/ScreenContainer";

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const slide = onboardingData[index];
  const isLast = index === onboardingData.length - 1;
  const ONBOARDING_KEY = "has_seen_onboarding";
  const navigation = useNavigation<any>();

  return (
    <ScreenContainer variant="auth" edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.skip}
          onPress={async () => {
            await AsyncStorage.setItem(ONBOARDING_KEY, "true");
            navigation.replace("LoginScreen");
          }}
        >
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <View style={styles.center}>
            <OnboardingSlide
              image={slide.image}
              title={slide.title}
              description={slide.description}
            />
          </View>

          <View style={styles.dotsWrapper}>
            <OnboardingDots total={onboardingData.length} current={index} />
          </View>
        </View>

        <AppButton
          title={isLast ? "Bắt đầu" : "Tiếp theo"}
          onPress={async () => {
            if (isLast) {
              await AsyncStorage.setItem(ONBOARDING_KEY, "true");
              navigation.replace("LoginScreen");
            } else {
              setIndex(index + 1);
            }
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.layout.topLevelPadding,
    paddingTop: theme.spacing.xl,
  },
  skip: {
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skipText: {
    color: theme.colors.text,
    fontWeight: "800",
  },
  heroCard: {
    flex: 1,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.md,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dotsWrapper: {
    marginTop: theme.spacing.lg,
    alignItems: "center",
  },
});
