import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";

import SplashScreen from "./screens/Splash/SplashScreen";
import OnboardingScreen from "./screens/Onboarding/OnboardingScreen";
import LoginScreen from "./screens/Login/LoginScreen";
import SignUpScreen from "./screens/SignUp/SignUpScreen";
import ForgetPasswordScreen from "./screens/ForgetPassword/ForgetPasswordScreen";
import CodeVerificationScreen from "./screens/ForgetPassword/CodeVerificationScreen";
import CreateNewPasswordScreen from "./screens/ForgetPassword/CreateNewPasswordScreen";
import HomeScreen from "./screens/Main/Home/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return <SplashScreen onFinish={() => setIsReady(true)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
        <Stack.Screen name="CodeVerification" component={CodeVerificationScreen} />
        <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
