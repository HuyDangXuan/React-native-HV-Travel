  import { View, Image, StyleSheet, BackHandler, Platform } from "react-native";
  import { useEffect } from "react";
  import theme from "../../config/theme";
  import { MessageBoxService } from "../MessageBox/MessageBoxService";
  import api from "../../config/api";

  type Props = {
    onFinish: () => void;
  };

  export default function SplashScreen({ onFinish }: Props) {

    const fetchWithTimeout = async (url: string, timeout = 5000) => {
      return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout API")), timeout)
        ),
      ]);
    };

    const closeApp = () => {
      if (Platform.OS === "android") {
        BackHandler.exitApp();
      } else {
        MessageBoxService.error(
          "Không thể thoát app tự động trên iOS",
          "Vui lòng nhấn nút Home để thoát app.",
          "OK",
          () => {}
        );
      }
    };

    useEffect(() => {
      const checkDB = async () => {
        try {
          console.log("Checking database connection...");

          console.log("api: ", api.check_connect_db);
          const res = await fetchWithTimeout(api.check_connect_db, 5000) as Response;
          const data = await res.json();

          if (data.status) {
            console.log("Connect database successfully!");
            onFinish();
          } else {
            MessageBoxService.error(
              "Kết nối đến Database thất bại!",
              "API trả về status false, vui lòng kiểm tra database.",
              "Thoát app",
              closeApp
            );
          }
        } catch (err: unknown) {
          console.log("API error or timeout (abc):", err);
          MessageBoxService.error(
            "Kết nối đến Database thất bại!",
            "Không nhận được phản hồi từ server (timeout hoặc lỗi mạng).",
            "Thoát app",
            closeApp
          );
        }
      };

      checkDB();

      const timer = setTimeout(() => {
        onFinish(); // fallback: vẫn chạy splash sau 2s nếu muốn
      }, 2000);

      return () => clearTimeout(timer);
    }, []);

    return (
      <View style={styles.container}>
        <Image
          source={require("../../assets/favicon.png")}
          style={styles.logo}
        />
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.white,
    },
    logo: {
      maxWidth: 500,
      maxHeight: 300,
      marginBottom: theme.spacing.md,
    },
  });
