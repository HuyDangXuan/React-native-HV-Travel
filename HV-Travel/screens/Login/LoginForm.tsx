import { View, Image, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useCallback, useState } from "react";
import AppInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MessageBoxService } from "../MessageBox/MessageBoxService";
import { AuthService } from "../../services/AuthService";
import { loginSchema } from "../../validators/authSchema";
import { useUser } from "../../context/UserContext";
import { User } from "../../models/User";
import { useEffect } from "react";
import theme from "../../config/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccountStorageService, StoredAccount } from "../../services/AccountStorageService";
import * as SecureStore from "expo-secure-store";

interface FormErrors {
  email?: string;
  password?: string;
}

type Props = {
  forceLogin: boolean;
  setForceLogin: (v: boolean) => void;
};

export default function LoginForm({forceLogin, setForceLogin}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({}); // ⭐ State cho errors
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const { setUser } = useUser();

  // ⭐ Validate single field (gọi khi blur)
  const validateField = (fieldName: keyof FormErrors, value: string) => {
    const { error } = loginSchema.validate(
      { email, password, [fieldName]: value },
      { abortEarly: true }
    );

    const fieldError = error?.details.find((e) => e.path[0] === fieldName);
    
    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError?.message,
    }));
  };

  // ⭐ Validate toàn bộ form (gọi khi submit)
  const validateForm = (): boolean => {
    const { error } = loginSchema.validate(
      { email, password },
      { abortEarly: false }
    );

    if (error) {
      const newErrors: FormErrors = {};
      error.details.forEach((detail) => {
        const field = detail.path[0] as keyof FormErrors;
        if (!newErrors[field]) {
          newErrors[field] = detail.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleLoginSelect = async (userId: string, email: string) => {
    const token = await SecureStore.getItemAsync(`token_${userId}`);
    console.log(`Token of user id ${userId}:`, token);

    if (!token) {
      setEmail(email);
      setForceLogin(true);
      return;
    }

    try {
      const res = await AuthService.authToken(token);
      console.log("AUTH TOKEN RES:", res);

      const user: User = res.data;
      setUser(user);
      navigation.replace("MainTabs");

    } catch (err: any) {
      console.log("AUTH TOKEN ERROR:", err);

      if (err.status === 401) {
        // token die → xoá + quay về login
        await SecureStore.deleteItemAsync(`token_${userId}`);
        setEmail(email);
        setForceLogin(true);
        console.log("phiên đã hết hạn");
      }
    }
  };


  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await AuthService.login(email, password);
      console.log("Login success: ", res);
      
      if (res.status === true) {
        console.log("Login Successfully!");
        const user: User = res.data.user;
        setUser(user);
        await AccountStorageService.saveAccount({
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: theme.image.testAvatar,
          lastLoginAt: Date.now(),
        });
        MessageBoxService.confirm({
          title: "Lưu thông tin đăng nhập?",
          content: `Chúng tôi sẽ lưu thông tin đăng nhập cho ${user.fullName} để bạn không cần nhập lại mật khẩu cho lần sau.`,
          confirmText: "Lưu",
          cancelText: "Lúc khác",
          onConfirm: async()=> {
            await SecureStore.setItemAsync(
              `token_${user._id}`,
              res.data.token,
              { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }
            );
            await SecureStore.setItemAsync(
              "access_token",
              res.data.token,
              { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }
            );
          }
        });
        
        navigation.replace("MainTabs");
      }
    } catch (error: any) {
      console.log("Login error: ", error);

      if (error.status === 401) {
        MessageBoxService.error(
          "Đăng nhập thất bại!",
          error.message,
          "OK"
        );
      } else if (error.message === "Request failed") {
        MessageBoxService.error(
          "Lỗi kết nối",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
          "OK"
        );
      } else if (error.message === "Request timeout") {
        MessageBoxService.error(
          "Hết thời gian chờ",
          "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.",
          "OK"
        );
      } else {
        MessageBoxService.error(
          "Lỗi",
          error.message,
          "OK"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(()=> {
      AccountStorageService.getAccounts().then(setAccounts);
    }, [])
  );

  return (
    forceLogin || accounts.length <= 0 ? (
      <View>
        <AppInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            // ⭐ Clear error khi user đang nhập
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          onBlur={() => validateField("email", email)} // ⭐ Validate khi blur
          error={errors.email} // ⭐ Hiển thị error
        />

        <AppInput
          placeholder="Mật khẩu"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            // ⭐ Clear error khi user đang nhập
            if (errors.password) {
              setErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          onBlur={() => validateField("password", password)} // ⭐ Validate khi blur
          error={errors.password} // ⭐ Hiển thị error
          isPassword
        />

        <AppButton title="Đăng nhập" onPress={handleLogin} loading={loading} />
      </View>
    ): (
      <View style={{flex: 1}}>
        <View style={{flex: 1}}>
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleLoginSelect(item.id, item.email)}
                style={stylesAccount.card}
              >
                <Image source={item.avatar} style={stylesAccount.avatar} />
                <Text numberOfLines={1} style={stylesAccount.username}>
                  {item.fullName}
                </Text>
              </Pressable>
            )}
        />
      </View>
      <View style={{marginTop: 12}}>
        <AppButton 
          title="Đăng nhập bằng tài khoản khác" 
          onPress={()=>setForceLogin(true)} 
          loading={false}>
        </AppButton>
      </View>
      
      </View>
    )
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  containerHeader: {
    marginBottom: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  moreBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 8,
    zIndex: 10,
  },
  image: {
    width: 100,
    height: 100,
    margin: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    textAlign: "center",
  },
});

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
