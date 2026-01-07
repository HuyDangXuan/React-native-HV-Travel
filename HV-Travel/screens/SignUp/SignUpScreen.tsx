import React from "react";
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import SignUpHeader from "./SignUpHeader";
import SignUpForm from "./SignUpForm";
import SignUpFooter from "./SignUpFooter";

export default function SignUpScreen() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SignUpHeader />
        <SignUpForm />
        <SignUpFooter />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "flex-start", // ✅ bỏ center
  },
});
