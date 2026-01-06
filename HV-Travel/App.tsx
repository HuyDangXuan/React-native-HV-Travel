import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";

import { MessageBoxProvider } from "./screens/MessageBox/MessageBoxContext";
import MessageBoxBridge from "./screens/MessageBox/MessageBoxBridge";


import SplashScreen from "./screens/Splash/SplashScreen";
import OnboardingScreen from "./screens/Onboarding/OnboardingScreen";
import LoginScreen from "./screens/Login/LoginScreen";
import SignUpScreen from "./screens/SignUp/SignUpScreen";
import ForgetPasswordScreen from "./screens/ForgetPassword/ForgetPasswordScreen";
import CodeVerificationScreen from "./screens/ForgetPassword/CodeVerificationScreen";
import CreateNewPasswordScreen from "./screens/ForgetPassword/CreateNewPasswordScreen";
import HomeScreen from "./screens/Main/Home/HomeScreen";
import TourDetailScreen from "./screens/Main/Home/Details/TourDetail";
import BookingScreen from "./screens/Main/Home/Booking/BookingScreen";
import PaymentMethodScreen from "./screens/Main/Home/Payment/PaymentMethodScreen";
import ZaloPayScreen from "./screens/Main/Home/Payment/Method/ZaloPayScreen";
import VNPayScreen from "./screens/Main/Home/Payment/Method/VNPayScreen";
import MoMoScreen from "./screens/Main/Home/Payment/Method/MoMoScreen";
import PaymentSuccessScreen from "./screens/Main/Home/Payment/Method/PaymentResults/PaymentSuccessScreen";
import PaymentFailedScreen from "./screens/Main/Home/Payment/Method/PaymentResults/PaymentFailedScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return <SplashScreen onFinish={() => setIsReady(true)} />;
  }

  return (
    <MessageBoxProvider>
      <MessageBoxBridge />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
          <Stack.Screen name="CodeVerification" component={CodeVerificationScreen} />
          <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="TourDetailScreen" component={TourDetailScreen} />
          <Stack.Screen name="BookingScreen" component={BookingScreen} />
          <Stack.Screen name="PaymentMethodScreen" component={PaymentMethodScreen} />
          <Stack.Screen name="ZaloPayScreen" component={ZaloPayScreen} />
          <Stack.Screen name="VNPayScreen" component={VNPayScreen} />
          <Stack.Screen name="MoMoScreen" component={MoMoScreen} />
          <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} />
          <Stack.Screen name="PaymentFailedScreen" component={PaymentFailedScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </MessageBoxProvider>
    
  );
}
