import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/ThemeModeContext";
import { useUser } from "../../context/UserContext";
import {
  hasSeenCurrentOnboarding,
  ONBOARDING_STORAGE_KEY,
} from "../../utils/onboarding";

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const { loading, token } = useAuth();
  const { user } = useUser();
  const theme = useAppTheme();

  useEffect(() => {
    if (loading) {
      return;
    }

    const routeNext = async () => {
      const onboardingValue = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!hasSeenCurrentOnboarding(onboardingValue)) {
        navigation.replace("OnboardingScreen");
        return;
      }

      navigation.replace(token && user ? "MainTabs" : "LoginScreen");
    };

    routeNext();
  }, [loading, navigation, token, user]);

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.screenBackground }]}>
      <Image source={theme.icon.favicon} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 220,
    height: 152,
  },
});
