import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./Home/HomeScreen";
import FavouriteScreen from "./Favourites/FavouriteScreen";
import InboxScreen from "./Inbox/InboxScreen";
import SettingScreen from "./Setting/SettingScreen";
import { useI18n } from "../../context/I18nContext";
import { useAppTheme } from "../../context/ThemeModeContext";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { t } = useI18n();
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: "600",
        },
        tabBarStyle: {
          height: 80,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          backgroundColor: theme.semantic.screenSurface,
          borderTopWidth: 0,
          ...theme.shadow.md,
        },
        tabBarIcon: ({ color, focused, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "ellipse";

          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          if (route.name === "Favourite") iconName = focused ? "heart" : "heart-outline";
          if (route.name === "Inbox") iconName = focused ? "mail" : "mail-outline";
          if (route.name === "Setting") iconName = focused ? "settings" : "settings-outline";

          return <Ionicons name={iconName} size={size ?? 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t("tabs.home") }} />
      <Tab.Screen
        name="Favourite"
        component={FavouriteScreen}
        options={{ title: t("tabs.favourite") }}
      />
      <Tab.Screen name="Inbox" component={InboxScreen} options={{ title: t("tabs.inbox") }} />
      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{ title: t("tabs.settings") }}
      />
    </Tab.Navigator>
  );
}
