import { useState } from "react";
import { View, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import theme from "../config/theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isPassword?: boolean;
};

export default function AppInput({
  value,
  onChangeText,
  placeholder,
  isPassword = false,
}: Props) {
  const [secure, setSecure] = useState(true);

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={isPassword && secure}
        style={styles.input}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Image
            source={
              secure
                ? require("../assets/eye.png")   // icon ẩn mật khẩu
                : require("../assets/hidden.png") // icon hiện mật khẩu
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
