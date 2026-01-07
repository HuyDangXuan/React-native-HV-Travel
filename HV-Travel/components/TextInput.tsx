import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInputProps,
} from "react-native";
import theme from "../config/theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isPassword?: boolean;
} & Omit<TextInputProps, "value" | "onChangeText" | "placeholder" | "secureTextEntry">;

export default function AppInput({
  value,
  onChangeText,
  placeholder,
  isPassword = false,
  ...rest
}: Props) {
  const [secure, setSecure] = useState(true);

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={isPassword && secure}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={isPassword ? "password" : "email"}
        textContentType={isPassword ? "password" : "emailAddress"}
        keyboardType={isPassword ? "default" : "email-address"}
        returnKeyType={isPassword ? "done" : "next"}
        {...rest}
      />

      {isPassword && (
        <TouchableOpacity onPress={() => setSecure((p) => !p)} hitSlop={10}>
          <Image
            source={
              secure
                ? require("../assets/eye.png")
                : require("../assets/hidden.png")
            }
            style={styles.icon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
