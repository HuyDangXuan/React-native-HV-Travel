import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { onboardingData } from "../../data/onboardingData";
import OnboardingSlide from "../../components/Onboarding/OnboardingSlide";
import OnboardingDots from "../../components/Onboarding/OnboardingDots";
import AppButton from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import theme from "../../config/theme";

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const slide = onboardingData[index];
  const isLast = index === onboardingData.length - 1;

  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      
      <TouchableOpacity
        style={styles.skip}
        onPress={() => navigation.replace("LoginScreen")}
      >
        <Text style={styles.skipText}>Bỏ qua</Text>
      </TouchableOpacity>

      <View style={styles.center}>
        <OnboardingSlide
          image={slide.image}
          title={slide.title}
          description={slide.description}
        />

        <View style={styles.dotsWrapper}>
          <OnboardingDots
            total={onboardingData.length}
            current={index}
          />
        </View>
      </View>

      <AppButton
        title={isLast ? "Bắt đầu" : "Tiếp theo"}
        onPress={() => {
          if (isLast) {
            navigation.replace("LoginScreen");
          } else {
            setIndex(index + 1);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg
  },

  skip: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },

  skipText: {
    color: theme.colors.text,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  dotsWrapper: {
    marginVertical: theme.spacing.lg,
  },
});

