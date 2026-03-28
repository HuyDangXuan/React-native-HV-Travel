import React, { useState } from "react";
import {
  Image,
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../context/ThemeModeContext";

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
  const theme = useAppTheme();

  return (
    <View style={[styles.wrapper, { marginBottom: theme.spacing.md }]}>
      {placeholder ? (
        <Text
          style={[
            styles.label,
            { marginBottom: theme.spacing.xs, color: theme.semantic.textPrimary },
          ]}
        >
          {placeholder}
        </Text>
      ) : null}
      <View
        style={[
          styles.container,
          {
            borderColor: error
              ? theme.colors.error
              : isFocused
                ? theme.colors.primary
                : theme.semantic.divider,
            borderRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing.md,
            backgroundColor: theme.semantic.screenSurface,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={error ? theme.colors.error : theme.colors.placeholder}
          secureTextEntry={isPassword && secure}
          style={[
            styles.input,
            {
              paddingVertical: theme.spacing.md,
              color: theme.semantic.textPrimary,
              fontSize: theme.fontSize.md,
            },
          ]}
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
              style={[
                styles.icon,
                { tintColor: error ? theme.colors.error : theme.colors.icon },
              ]}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <Text
          style={[
            styles.errorText,
            { color: theme.colors.error, marginTop: 4, marginLeft: 4 },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    minHeight: 56,
  },
  input: {
    flex: 1,
  },
  icon: {
    width: 24,
    height: 24,
  },
  errorText: {
    fontSize: 12,
  },
});
