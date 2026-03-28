import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import AppButton from "../../components/Button";
import AppInput from "../../components/TextInput";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import { useAppTheme } from "../../context/ThemeModeContext";
import { AccountStorageService, StoredAccount } from "../../services/AccountStorageService";
import { AuthSessionService } from "../../services/AuthSessionService";
import { loginSchema } from "../../validators/authSchema";
import LoadingOverlay from "../Loading/LoadingOverlay";
import { MessageBoxService } from "../MessageBox/MessageBoxService";

interface FormErrors {
  email?: string;
  password?: string;
}

type Props = {
  forceLogin: boolean;
  setForceLogin: (value: boolean) => void;
};

export default function LoginForm({ forceLogin, setForceLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);

  const navigation = useNavigation<any>();
  const { signIn, signInWithRememberedAccount } = useAuth();
  const { t } = useI18n();
  const theme = useAppTheme();

  const validateField = (fieldName: keyof FormErrors, value: string) => {
    const { error } = loginSchema.validate(
      { email, password, [fieldName]: value },
      { abortEarly: true }
    );
    const fieldError = error?.details.find((detail) => detail.path[0] === fieldName);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError?.message,
    }));
  };

  const validateForm = () => {
    const { error } = loginSchema.validate({ email, password }, { abortEarly: false });

    if (!error) {
      setErrors({});
      return true;
    }

    const nextErrors: FormErrors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0] as keyof FormErrors;
      if (!nextErrors[field]) {
        nextErrors[field] = detail.message;
      }
    });

    setErrors(nextErrors);
    return false;
  };

  const loadAccounts = useCallback(async () => {
    const storedAccounts = await AccountStorageService.getAccounts();
    setAccounts(storedAccounts);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts])
  );

  const promptPasswordLogin = (account: StoredAccount) => {
    setEmail(account.email);
    setPassword("");
    setForceLogin(true);
  };

  const handleLoginSelect = async (account: StoredAccount) => {
    if (quickLoginLoading) {
      return;
    }

    const canResume = await AuthSessionService.canResumeRememberedAccount(account.id);
    if (!canResume) {
      promptPasswordLogin(account);
      return;
    }

    setQuickLoginLoading(true);
    try {
      await signInWithRememberedAccount(account.id);
      navigation.replace("MainTabs");
    } catch (error: any) {
      if (error?.status === 401) {
        promptPasswordLogin(account);
        MessageBoxService.error(
          t("login.needPasswordTitle"),
          t("login.needPasswordMessage")
        );
        return;
      }

      MessageBoxService.error(
        t("common.close"),
        error?.message || t("login.restoreFailed")
      );
    } finally {
      setQuickLoginLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await signIn(email, password);

      MessageBoxService.confirm({
        title: t("login.rememberTitle"),
        content: t("login.rememberMessage", { name: user.fullName }),
        confirmText: t("common.save"),
        cancelText: t("common.later"),
        onConfirm: async () => {
          await AuthSessionService.rememberCurrentAccount();
          await loadAccounts();
        },
      });

      navigation.replace("MainTabs");
    } catch (error: any) {
      if (error?.status === 401) {
        MessageBoxService.error(t("login.failedTitle"), error.message, t("common.ok"));
      } else if (error?.message === "Request failed") {
        MessageBoxService.error(
          t("login.connectionErrorTitle"),
          t("login.connectionErrorMessage"),
          t("common.ok")
        );
      } else if (error?.message === "Request timeout") {
        MessageBoxService.error(
          t("login.timeoutTitle"),
          t("login.timeoutMessage"),
          t("common.ok")
        );
      } else {
        MessageBoxService.error(
          t("common.close"),
          error?.message || t("login.genericFailed"),
          t("common.ok")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (forceLogin || accounts.length <= 0) {
    return (
      <View>
        <AppInput
          placeholder={t("login.email")}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          onBlur={() => validateField("email", email)}
          error={errors.email}
        />

        <AppInput
          placeholder={t("login.password")}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) {
              setErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          onBlur={() => validateField("password", password)}
          error={errors.password}
          isPassword
        />

        <AppButton title={t("login.submit")} onPress={handleLogin} loading={loading} />
        <LoadingOverlay visible={quickLoginLoading} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <Pressable
              disabled={quickLoginLoading}
              onPress={() => handleLoginSelect(item)}
              style={[
                stylesAccount.card,
                {
                  backgroundColor: theme.semantic.screenSurface,
                  borderColor: theme.semantic.divider,
                },
              ]}
            >
              <Image source={item.avatar || theme.image.testAvatar} style={stylesAccount.avatar} />
              <Text
                numberOfLines={1}
                style={[
                  stylesAccount.username,
                  {
                    color: theme.semantic.textPrimary,
                    fontSize: theme.fontSize.sm,
                  },
                ]}
              >
                {item.fullName}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <AppButton
          title={t("login.otherAccount")}
          onPress={() => setForceLogin(true)}
          loading={false}
          disabled={quickLoginLoading}
        />
      </View>

      <LoadingOverlay visible={quickLoginLoading} />
    </View>
  );
}

const stylesAccount = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    borderWidth: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  username: {
    flex: 1,
    fontWeight: "bold",
  },
});
