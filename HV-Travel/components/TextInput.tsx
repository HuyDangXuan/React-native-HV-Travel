import { useState } from "react";
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text } from "react-native";
import theme from "../config/theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isPassword?: boolean;
  error?: string; // ⭐ Thêm prop error
  onBlur?: () => void; // ⭐ Thêm onBlur handler
};

export default function AppInput({
  value,
  onChangeText,
  placeholder,
  isPassword = false,
  error,
  onBlur,
}: Props) {
  const [secure, setSecure] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused, // ⭐ Style khi focus
          error && styles.containerError, // ⭐ Style khi có lỗi
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={error ? theme.colors.error : theme.colors.placeholder}
          secureTextEntry={isPassword && secure}
          style={styles.input}
          onFocus={() => setIsFocused(true)} // ⭐ Thêm focus handler
          onBlur={() => {
            setIsFocused(false);
            onBlur?.(); // ⭐ Gọi validation khi blur
          }}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Image
              source={
                secure
                  ? theme.icon.eye
                  : theme.icon.hidden
              }
              style={[
                styles.icon,
                error && styles.iconError, // ⭐ Tint icon khi có lỗi
              ]}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && ( // ⭐ Hiện error message
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.sm,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white , // ⭐ Thêm background
  },
  containerFocused: {
    borderColor: theme.colors.primary, // ⭐ Màu khi focus
    borderWidth: 2,
  },
  containerError: {
    borderColor: theme.colors.error, // ⭐ Màu khi lỗi
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: theme.colors.icon || theme.colors.text, // ⭐ Màu icon mặc định
  },
  iconError: {
    tintColor: theme.colors.error || theme.colors.error, // ⭐ Màu icon khi lỗi
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});