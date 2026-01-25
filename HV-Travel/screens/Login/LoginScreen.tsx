import React, {useState} from "react";
import { StyleSheet, ScrollView, SafeAreaView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";
import LoginFooter from "./LoginFooter";
import theme from "../../config/theme";

export default function LoginScreen() {
  const [forceLogin, setForceLogin] = useState(false);
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
         <LoginHeader
            showBack={forceLogin}
            onBack={() => setForceLogin(false)}
            onMore={() => navigation.navigate("AccountManager")}
          />
        <LoginForm
          forceLogin={forceLogin}
          setForceLogin={setForceLogin}
        />
        <LoginFooter />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.white },
  container: {
    flex: 1,
    padding: 16,
  },
});
