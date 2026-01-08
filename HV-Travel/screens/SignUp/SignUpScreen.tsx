import React from "react";
import { StyleSheet, ScrollView, SafeAreaView } from "react-native";
import SignUpHeader from "./SignUpHeader";
import SignUpForm from "./SignUpForm";
import SignUpFooter from "./SignUpFooter";
import theme from "../../config/theme";

export default function SignUpScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
      >
        <SignUpHeader />
        <SignUpForm />
        <SignUpFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "flex-start",
  },
});
