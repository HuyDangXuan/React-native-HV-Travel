import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import AppButton from "../../components/Button";
import AppInput from "../../components/TextInput";
import theme from "../../config/theme";
import { useAuth } from "../../context/AuthContext";
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
          "Cần đăng nhập lại",
          "Vui lòng nhập lại mật khẩu để tiếp tục."
        );
        return;
      }

      MessageBoxService.error(
        "Lỗi",
        error?.message || "Không thể khôi phục phiên đăng nhập."
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
        title: "Lưu thông tin đăng nhập?",
        content: `Chúng tôi sẽ ghi nhớ tài khoản ${user.fullName} trên thiết bị này để lần sau bạn không phải chọn lại nếu chưa đăng xuất.`,
        confirmText: "Lưu",
        cancelText: "Lúc khác",
        onConfirm: async () => {
          await AuthSessionService.rememberCurrentAccount();
          await loadAccounts();
        },
      });

      navigation.replace("MainTabs");
    } catch (error: any) {
      if (error?.status === 401) {
        MessageBoxService.error("Đăng nhập thất bại", error.message, "OK");
      } else if (error?.message === "Request failed") {
        MessageBoxService.error(
          "Lỗi kết nối",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
          "OK"
        );
      } else if (error?.message === "Request timeout") {
        MessageBoxService.error(
          "Hết thời gian chờ",
          "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.",
          "OK"
        );
      } else {
        MessageBoxService.error("Lỗi", error?.message || "Không thể đăng nhập.", "OK");
      }
    } finally {
      setLoading(false);
    }
  };

  if (forceLogin || accounts.length <= 0) {
    return (
      <View>
        <AppInput
          placeholder="Email"
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
          placeholder="Mật khẩu"
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

        <AppButton title="Đăng nhập" onPress={handleLogin} loading={loading} />
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
              style={stylesAccount.card}
            >
              <Image source={item.avatar || theme.image.testAvatar} style={stylesAccount.avatar} />
              <Text numberOfLines={1} style={stylesAccount.username}>
                {item.fullName}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <AppButton
          title="Đăng nhập bằng tài khoản khác"
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
    backgroundColor: "#fff",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  username: {
    flex: 1,
    fontSize: 14,
    color: "#222",
    fontWeight: "bold",
  },
});
