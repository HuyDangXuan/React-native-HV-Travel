import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import theme from "../../config/theme";

import HomeScreen from "./Home/HomeScreen";
import FavouriteScreen from "./Favourites/FavouriteScreen";
import SettingScreen from "./Setting/SettingScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
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
          backgroundColor: theme.colors.white,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },

        tabBarIcon: ({ color, focused, size }) => {
          let iconName: any;

          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          if (route.name === "Favourite") iconName = focused ? "heart" : "heart-outline";
          if (route.name === "Setting") iconName = focused ? "settings" : "settings-outline";

          return <Ionicons name={iconName} size={size ?? 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Trang chủ" }} />
      <Tab.Screen name="Favourite" component={FavouriteScreen} options={{ title: "Yêu thích" }} />
      <Tab.Screen name="Setting" component={SettingScreen} options={{ title: "Cài đặt" }} />
    </Tab.Navigator>
  );
}
