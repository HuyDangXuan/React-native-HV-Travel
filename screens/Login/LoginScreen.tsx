import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";
import LoginFooter from "./LoginFooter";
import { useAppTheme } from "../../context/ThemeModeContext";

export default function LoginScreen() {
  const [forceLogin, setForceLogin] = useState(false);
  const navigation = useNavigation<any>();
  const theme = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenSurface }]}>
      <View style={[styles.container, { padding: theme.spacing.md }]}>
        <LoginHeader
          showBack={forceLogin}
          onBack={() => setForceLogin(false)}
          onMore={() => navigation.navigate("AccountManager")}
        />
        <LoginForm forceLogin={forceLogin} setForceLogin={setForceLogin} />
        <LoginFooter />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
  },
});
