import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

import theme from "../../config/theme";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const { loading, token } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (loading) {
      return;
    }

    const routeNext = async () => {
      if (token && user) {
        navigation.replace("MainTabs");
        return;
      }

      const onboardingValue = await AsyncStorage.getItem("has_seen_onboarding");
      navigation.replace(onboardingValue === "true" ? "LoginScreen" : "OnboardingScreen");
    };

    routeNext();
  }, [loading, navigation, token, user]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image source={theme.icon.favicon} style={styles.logo} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  logoWrap: {
    width: 176,
    height: 176,
    borderRadius: 88,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.md,
  },
  logo: {
    width: 96,
    height: 96,
  },
});
