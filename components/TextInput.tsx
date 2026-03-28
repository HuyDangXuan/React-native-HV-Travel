import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  KeyboardTypeOptions,
} from "react-native";
import theme from "../config/theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isPassword?: boolean;
  error?: string;
  onBlur?: () => void;
  keyboardType?: KeyboardTypeOptions;
};

export default function AppInput({
  value,
  onChangeText,
  placeholder,
  isPassword = false,
  error,
  onBlur,
  keyboardType = "default",
}: Props) {
  const [secure, setSecure] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {placeholder ? <Text style={styles.label}>{placeholder}</Text> : null}
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          error && styles.containerError,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={error ? theme.colors.error : theme.colors.placeholder}
          secureTextEntry={isPassword && secure}
          style={styles.input}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Image
              source={secure ? theme.icon.eye : theme.icon.hidden}
              style={[styles.icon, error && styles.iconError]}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: "700",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
    minHeight: 56,
  },
  containerFocused: {
    borderColor: theme.colors.primary,
  },
  containerError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: theme.colors.icon || theme.colors.text,
  },
  iconError: {
    tintColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
