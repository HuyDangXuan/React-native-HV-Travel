import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import { onboardingData } from "../../data/onboardingData";
import OnboardingSlide from "../../components/Onboarding/OnboardingSlide";
import OnboardingDots from "../../components/Onboarding/OnboardingDots";
import AppButton from "../../components/Button";
import ScreenContainer from "../../components/ui/ScreenContainer";
import { useI18n } from "../../context/I18nContext";
import { useAppTheme } from "../../context/ThemeModeContext";

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const slide = onboardingData[index];
  const isLast = index === onboardingData.length - 1;
  const navigation = useNavigation<any>();
  const { t } = useI18n();
  const theme = useAppTheme();

  const completeOnboarding = async () => {
    await AsyncStorage.setItem("has_seen_onboarding", "true");
    navigation.replace("LoginScreen");
  };

  return (
    <ScreenContainer variant="auth" edges={["top"]}>
      <View
        style={[
          styles.container,
          {
            padding: theme.layout.topLevelPadding,
            paddingTop: theme.spacing.xl,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.skip,
            {
              borderRadius: theme.radius.pill,
              backgroundColor: theme.semantic.screenSurface,
              borderColor: theme.semantic.divider,
            },
          ]}
          onPress={completeOnboarding}
        >
          <Text style={[styles.skipText, { color: theme.semantic.textPrimary }]}>
            {t("onboarding.skip")}
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.heroCard,
            {
              marginTop: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.xl,
              borderRadius: theme.radius.xxl,
              backgroundColor: theme.semantic.screenSurface,
              borderColor: theme.semantic.divider,
            },
            theme.shadow.md,
          ]}
        >
          <View style={styles.center}>
            <OnboardingSlide
              image={slide.image}
              title={t(slide.titleKey)}
              description={t(slide.descriptionKey)}
            />
          </View>

          <View style={[styles.dotsWrapper, { marginTop: theme.spacing.lg }]}>
            <OnboardingDots total={onboardingData.length} current={index} />
          </View>
        </View>

        <AppButton
          title={isLast ? t("onboarding.start") : t("onboarding.next")}
          onPress={() => (isLast ? completeOnboarding() : setIndex(index + 1))}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skip: {
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  skipText: {
    fontWeight: "800",
  },
  heroCard: {
    flex: 1,
    borderWidth: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dotsWrapper: {
    alignItems: "center",
  },
});
