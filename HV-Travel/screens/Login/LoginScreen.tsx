import React from "react";
import { StyleSheet, ScrollView, SafeAreaView } from "react-native";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";
import LoginFooter from "./LoginFooter";
import theme from "../../config/theme";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
      >
        <LoginHeader />
        <LoginForm />
        <LoginFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.white },
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "flex-start",
  },
});
