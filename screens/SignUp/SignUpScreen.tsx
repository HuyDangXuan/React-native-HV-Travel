import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { StyleSheet, View } from "react-native";

import SignUpHeader from "./SignUpHeader";
import SignUpForm from "./SignUpForm";
import SignUpFooter from "./SignUpFooter";
import { useAppTheme } from "../../context/ThemeModeContext";

export default function SignUpScreen() {
  const theme = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenSurface }]}>
      <View style={[styles.container, { padding: theme.spacing.md }]}>
        <SignUpHeader />
        <SignUpForm />
        <SignUpFooter />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
});
