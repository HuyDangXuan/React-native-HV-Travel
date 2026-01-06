import { View, Image, StyleSheet, BackHandler, Platform } from "react-native";
import { useEffect } from "react";
import theme from "../../config/theme";
import { MessageBoxService } from "../MessageBox/MessageBoxService";
import { DatabaseService } from "../../services/DatabaseService";

type Props = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: Props) {

  const checkDB = async () => {
    try {
      console.log("Checking database connection...");
      const res = await DatabaseService.checkConnection();
      if (res) {
        console.log("Connect database successfully!");
        onFinish();
      } else {
        console.log("Connect database failed!");
        MessageBoxService.error(
          "Kết nối đến Database thất bại!",
          "Ứng dụng hiện tại không thể tải dữ liệu. Vui lòng kiểm tra kết nối internet hoặc thử lại sau.",
          "Thử lại",
          checkDB
        );
      }
    } catch (err: unknown) {
      console.log("API error or timeout:", err);
      MessageBoxService.error(
          "Kết nối đến Database thất bại!",
          "Ứng dụng hiện tại không thể tải dữ liệu. Vui lòng kiểm tra kết nối internet hoặc thử lại sau.",
          "Thử lại",
          checkDB
        );
    }
  };

  useEffect(() => {
    
    checkDB();

  }, []);

  return (
    <View style={styles.container}>
      <Image source={theme.icon.favicon} style={styles.logo} />
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
