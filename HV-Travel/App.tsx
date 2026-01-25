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

import MainTabs from "./screens/Main/MainTab"; // ✅ NEW

import TourDetailScreen from "./screens/Main/Home/Details/TourDetail";
import BookingScreen from "./screens/Main/Home/Booking/BookingScreen";
import PaymentMethodScreen from "./screens/Main/Home/Payment/PaymentMethodScreen";
import ZaloPayScreen from "./screens/Main/Home/Payment/Method/ZaloPayScreen";
import VNPayScreen from "./screens/Main/Home/Payment/Method/VNPayScreen";
import MoMoScreen from "./screens/Main/Home/Payment/Method/MoMoScreen";
import PaymentSuccessScreen from "./screens/Main/Home/Payment/Method/PaymentResults/PaymentSuccessScreen";
import PaymentFailedScreen from "./screens/Main/Home/Payment/Method/PaymentResults/PaymentFailedScreen";
import MyBookingScreen from "./screens/Main/Setting/MyBooking/MyBookingScreen";
import ProfileScreen from "./screens/Main/Setting/Profile/ProfileScreen";
import EditProfileScreen from "./screens/Main/Setting/Profile/EditProfile/EditProfileScreen";
import BankTransferScreen from "./screens/Main/Home/Payment/Method/BankTransferScreen";
import CashPaymentScreen from "./screens/Main/Home/Payment/Method/CashPaymentScreen";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./context/AuthContext";
import AccountManager from "./screens/Login/AccountManager";
import ExploreScreen from "./screens/Main/Home/ExploreScreen/ExploreScreen";


const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <MessageBoxProvider>
      <MessageBoxBridge />
      <UserProvider>
      <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{gestureEnabled: false}}/>
          <Stack.Screen name="AccountManager" component={AccountManager} options={{gestureEnabled: false}}/>
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{gestureEnabled: false}}/>
          <Stack.Screen name="ForgetPasswordScreen" component={ForgetPasswordScreen} options={{gestureEnabled: false}}/>
          <Stack.Screen name="CodeVerificationScreen" component={CodeVerificationScreen} options={{gestureEnabled: false}}/>
          <Stack.Screen name="CreateNewPasswordScreen" component={CreateNewPasswordScreen} options={{gestureEnabled: false}}/>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{gestureEnabled: false}} />
          <Stack.Screen name="TourDetailScreen" component={TourDetailScreen} />
          <Stack.Screen name="BookingScreen" component={BookingScreen} />
          <Stack.Screen name="PaymentMethodScreen" component={PaymentMethodScreen} />
          <Stack.Screen name="ZaloPayScreen" component={ZaloPayScreen} />
          <Stack.Screen name="VNPayScreen" component={VNPayScreen} />
          <Stack.Screen name="MoMoScreen" component={MoMoScreen} />
          <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} options={{gestureEnabled: false}} />
          <Stack.Screen name="PaymentFailedScreen" component={PaymentFailedScreen} options={{gestureEnabled: false}} />
          <Stack.Screen name="MyBookingScreen" component={MyBookingScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
          <Stack.Screen name="BankTransferScreen" component={BankTransferScreen} options={{gestureEnabled: false}} />
          <Stack.Screen name="CashPaymentScreen" component={CashPaymentScreen} options={{gestureEnabled: false}} />
          <Stack.Screen name="Explore" component={ExploreScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      </AuthProvider>
      </UserProvider>
    </MessageBoxProvider>
  );
}
