import {
  createNavigationContainerRef,
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";

import { AuthSessionService } from "./services/AuthSessionService";
import { I18nProvider } from "./context/I18nContext";
import { useI18n } from "./context/I18nContext";
import { ThemeModeProvider, useThemeMode } from "./context/ThemeModeContext";
import { MessageBoxProvider } from "./screens/MessageBox/MessageBoxContext";
import MessageBoxBridge from "./screens/MessageBox/MessageBoxBridge";
import { MessageBoxService } from "./screens/MessageBox/MessageBoxService";

import SplashScreen from "./screens/Splash/SplashScreen";
import OnboardingScreen from "./screens/Onboarding/OnboardingScreen";
import LoginScreen from "./screens/Login/LoginScreen";
import SignUpScreen from "./screens/SignUp/SignUpScreen";
import ForgetPasswordScreen from "./screens/ForgetPassword/ForgetPasswordScreen";
import CodeVerificationScreen from "./screens/ForgetPassword/CodeVerificationScreen";
import CreateNewPasswordScreen from "./screens/ForgetPassword/CreateNewPasswordScreen";

import MainTabs from "./screens/Main/MainTab"; // ✅ NEW
import ChatScreen from "./screens/Main/Inbox/Chat/ChatScreen";
import UserProfileScreen from "./screens/Main/Inbox/Profile/UserProfileScreen";

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
import SecurityScreen from "./screens/Main/Setting/Security/SecurityScreen";
import QrQuickLoginScreen from "./screens/Main/Setting/QrQuickLogin/QrQuickLoginScreen";
import LanguageScreen from "./screens/Main/Setting/Language/LanguageScreen";
import AppearanceScreen from "./screens/Main/Setting/Appearance/AppearanceScreen";
import HelpScreen from "./screens/Main/Setting/Help/HelpScreen";
import TermsScreen from "./screens/Main/Setting/Terms/TermsScreen";
import BankTransferScreen from "./screens/Main/Home/Payment/Method/BankTransferScreen";
import CashPaymentScreen from "./screens/Main/Home/Payment/Method/CashPaymentScreen";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./context/AuthContext";
import AccountManager from "./screens/Login/AccountManager";
import ExploreScreen from "./screens/Main/Home/ExploreScreen/ExploreScreen";
import TourMapScreen from "./screens/Main/Home/Map/TourMapScreen";
import NotificationScreen from "./screens/Main/Home/NotificationScreen";
import TourSearchScreen from "./screens/Main/Home/Search/TourSearchScreen";


const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

function AppShell() {
  const { theme, themeName } = useThemeMode();
  const { t } = useI18n();
  const sessionExpiredHandledRef = useRef(false);
  const navigationTheme =
    themeName === "dark"
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: theme.semantic.screenBackground,
            card: theme.semantic.screenSurface,
            text: theme.semantic.textPrimary,
            border: theme.semantic.divider,
            primary: theme.colors.primary,
            notification: theme.colors.primary,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: theme.semantic.screenBackground,
            card: theme.semantic.screenSurface,
            text: theme.semantic.textPrimary,
            border: theme.semantic.divider,
            primary: theme.colors.primary,
            notification: theme.colors.primary,
          },
        };

  useEffect(() => {
    const unsubscribe = AuthSessionService.subscribeSessionExpired(() => {
      if (sessionExpiredHandledRef.current) {
        return;
      }

      sessionExpiredHandledRef.current = true;
      MessageBoxService.error(
        t("common.error"),
        t("common.sessionExpired"),
        t("common.ok"),
        () => {
          if (navigationRef.isReady()) {
            navigationRef.reset({
              index: 0,
              routes: [{ name: "MainTabs" as never }],
            });
          }

          sessionExpiredHandledRef.current = false;
        }
      );
    });

    return () => {
      unsubscribe();
    };
  }, [t]);

  return (
    <>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="AccountManager"
            component={AccountManager}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="SignUpScreen"
            component={SignUpScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="ForgetPasswordScreen"
            component={ForgetPasswordScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="CodeVerificationScreen"
            component={CodeVerificationScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="CreateNewPasswordScreen"
            component={CreateNewPasswordScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
          <Stack.Screen name="TourDetailScreen" component={TourDetailScreen} />
          <Stack.Screen name="BookingScreen" component={BookingScreen} />
          <Stack.Screen name="PaymentMethodScreen" component={PaymentMethodScreen} />
          <Stack.Screen name="ZaloPayScreen" component={ZaloPayScreen} />
          <Stack.Screen name="VNPayScreen" component={VNPayScreen} />
          <Stack.Screen name="MoMoScreen" component={MoMoScreen} />
          <Stack.Screen
            name="PaymentSuccessScreen"
            component={PaymentSuccessScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="PaymentFailedScreen"
            component={PaymentFailedScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="MyBookingScreen" component={MyBookingScreen} />
          <Stack.Screen name="SecurityScreen" component={SecurityScreen} />
          <Stack.Screen name="QrQuickLoginScreen" component={QrQuickLoginScreen} />
          <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
          <Stack.Screen name="AppearanceScreen" component={AppearanceScreen} />
          <Stack.Screen name="HelpScreen" component={HelpScreen} />
          <Stack.Screen name="TermsScreen" component={TermsScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
          <Stack.Screen
            name="BankTransferScreen"
            component={BankTransferScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="CashPaymentScreen"
            component={CashPaymentScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="Explore" component={ExploreScreen} />
          <Stack.Screen name="TourMapScreen" component={TourMapScreen} />
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
          <Stack.Screen name="TourSearchScreen" component={TourSearchScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeModeProvider>
        <I18nProvider>
          <MessageBoxProvider>
            <MessageBoxBridge />
            <UserProvider>
              <AuthProvider>
                <AppShell />
              </AuthProvider>
            </UserProvider>
          </MessageBoxProvider>
        </I18nProvider>
      </ThemeModeProvider>
    </SafeAreaProvider>
  );
}
