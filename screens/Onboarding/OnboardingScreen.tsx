import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import { onboardingData } from "../../data/onboardingData";
import OnboardingSlide from "../../components/Onboarding/OnboardingSlide";
import OnboardingDots from "../../components/Onboarding/OnboardingDots";
import AppButton from "../../components/Button";
import ScreenContainer from "../../components/ui/ScreenContainer";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import { useAppTheme } from "../../context/ThemeModeContext";
import { useUser } from "../../context/UserContext";
import {
  getOnboardingStorageValue,
  ONBOARDING_STORAGE_KEY,
} from "../../utils/onboarding";

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);
  const isLast = index === onboardingData.length - 1;
  const listRef = useRef<FlatList<(typeof onboardingData)[number]>>(null);
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { t } = useI18n();
  const theme = useAppTheme();
  const { user } = useUser();

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, getOnboardingStorageValue());
    navigation.replace(token && user ? "MainTabs" : "LoginScreen");
  };

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
      return;
    }

    const nextIndex = index + 1;
    setIndex(nextIndex);
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };

  return (
    <ScreenContainer variant="auth" edges={["top"]}>
      <View
        style={[
          styles.container,
          {
            padding: theme.layout.topLevelPadding,
            paddingTop: theme.spacing.lg,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.skip,
            {
              borderRadius: theme.radius.pill,
              backgroundColor: theme.semantic.screenElevated,
              borderColor: theme.semantic.divider,
            },
            theme.shadow.sm,
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
              marginBottom: theme.spacing.lg,
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.xl,
              paddingBottom: theme.spacing.lg,
              borderRadius: theme.radius.xxl,
              backgroundColor: theme.semantic.screenSurface,
              borderColor: theme.semantic.divider,
            },
            theme.shadow.md,
          ]}
        >
          <View
            style={styles.center}
            onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
          >
            <FlatList
              ref={listRef}
              data={onboardingData}
              keyExtractor={(item) => `${item.id}`}
              horizontal
              pagingEnabled
              bounces={false}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="center"
              decelerationRate="fast"
              onMomentumScrollEnd={(event) => {
                const nextIndex = Math.round(
                  event.nativeEvent.contentOffset.x / Math.max(sliderWidth, 1)
                );
                setIndex(nextIndex);
              }}
              renderItem={({ item }) => (
                <View style={[styles.slidePage, { width: Math.max(sliderWidth, 1) }]}>
                  <OnboardingSlide
                    image={item.image}
                    title={t(item.titleKey)}
                    description={t(item.descriptionKey)}
                  />
                </View>
              )}
            />
          </View>

          <View
            style={[
              styles.progressWrap,
              {
                marginTop: theme.spacing.lg,
                paddingTop: theme.spacing.md,
                borderTopColor: theme.semantic.divider,
              },
            ]}
          >
            <Text style={[styles.progressLabel, { color: theme.semantic.textSecondary }]}>
              {`${index + 1}/${onboardingData.length}`}
            </Text>
            <View style={styles.dotsWrapper}>
              <OnboardingDots total={onboardingData.length} current={index} />
            </View>
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: theme.spacing.lg }]}>
          <AppButton
            title={isLast ? t("onboarding.start") : t("onboarding.next")}
            onPress={handleNext}
          />
        </View>
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
  },
  slidePage: {
    justifyContent: "center",
    alignItems: "center",
  },
  progressWrap: {
    borderTopWidth: 1,
  },
  progressLabel: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  dotsWrapper: {
    alignItems: "center",
  },
  footer: {
    justifyContent: "flex-end",
  },
});
