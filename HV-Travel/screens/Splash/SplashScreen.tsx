import { View, Image, StyleSheet, BackHandler, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import theme from "../../config/theme";
import { MessageBoxService } from "../MessageBox/MessageBoxService";
import { AuthService } from "../../services/AuthService";
import { useNavigation } from "@react-navigation/native";
import { onboardingData } from "../../data/onboardingData";
import { useUser } from "../../context/UserContext";
import { User } from "../../models/User";

type Props = {
  onFinish: () => void;
};

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const { setUser } = useUser();
  const authToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("SecureStore");
      console.log("[SplashScreen] access_token storage: " + token);
      if (token) {
        const res = await AuthService.authToken(token);
        if (res) {
          const user: User = res.data;
          setUser(user);
          navigation.replace("MainTabs");
          return;
        } 
      }
      const ONBOARDING_VALUE = await AsyncStorage.getItem("has_seen_onboarding");
      console.log("onboarding skip value storage: " + ONBOARDING_VALUE);
      if (ONBOARDING_VALUE === "true"){
        navigation.replace("LoginScreen");
      }
      else {
        navigation.replace("OnboardingScreen");
      }
      
    } catch (err: any) {
      console.log("API error or timeout:", err);
      if (err.status === 401)
      {
        MessageBoxService.error(
          "Lỗi",
          err.message,
          "OK",
          async () => {
            await AsyncStorage.setItem("token", "");
            navigation.replace("LoginScreen")
          }
        );
      }
      else{
        MessageBoxService.error(
          "Lỗi",
          err.message,
          "OK",
          authToken
        );
      }
      
    }
  };

  useEffect(() => {
    
    authToken();

  }, []);

  return (
    <View style={styles.container}>
      <Image source={theme.icon.favicon} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
  },
  logo: {
    maxWidth: 500,
    maxHeight: 300,
    marginBottom: theme.spacing.md,
  },
});
