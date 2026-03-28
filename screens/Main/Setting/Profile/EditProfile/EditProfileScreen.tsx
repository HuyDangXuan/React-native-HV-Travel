import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import theme from "../../../../../config/theme";
import { useUser } from "../../../../../context/UserContext";
import { useAuth } from "../../../../../context/AuthContext";
import { CustomerService } from "../../../../../services/CustomerService";
import { MessageBoxService } from "../../../../MessageBox/MessageBoxService";
import LoadingOverlay from "../../../../Loading/LoadingOverlay";
import AppHeader from "../../../../../components/ui/AppHeader";
import IconButton from "../../../../../components/ui/IconButton";
import SectionCard from "../../../../../components/ui/SectionCard";

const DEFAULT_AVATAR = "https://i.pravatar.cc/200?img=12";

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, setUser } = useUser();
  const { token } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
    setPhoneNumber(user?.phoneNumber || "");
    setStreet(user?.address?.street || "");
    setCity(user?.address?.city || "");
    setCountry(user?.address?.country || "");
  }, [user]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      MessageBoxService.error("Lỗi", "Vui lòng nhập tên đầy đủ", "OK");
      return;
    }

    if (!email.trim()) {
      MessageBoxService.error("Lỗi", "Vui lòng nhập email", "OK");
      return;
    }

    if (!token) {
      MessageBoxService.error(
        "Phiên đăng nhập đã hết hạn",
        "Vui lòng đăng nhập lại",
        "OK",
        () => navigation.replace("Login")
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        address: {
          street: street.trim(),
          city: city.trim(),
          country: country.trim(),
        },
      };

      const updatedCustomer = await CustomerService.updateProfile(token, payload);

      if (!updatedCustomer) {
        throw new Error("Không nhận được dữ liệu hồ sơ mới từ máy chủ.");
      }

      setUser(updatedCustomer);
      MessageBoxService.success("Thành công", "Đã cập nhật hồ sơ", "OK", () =>
        navigation.goBack()
      );
    } catch (error: any) {
      if (error?.status === 401) {
        MessageBoxService.error(
          "Phiên đăng nhập đã hết hạn",
          "Vui lòng đăng nhập lại",
          "OK",
          () => navigation.replace("Login")
        );
        return;
      }

      MessageBoxService.error(
        "Lỗi",
        error?.message || "Không thể cập nhật hồ sơ lúc này",
        "OK"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPress = () => {
    MessageBoxService.warning(
      "Chưa hỗ trợ",
      "Tính năng đổi ảnh đại diện sẽ được bổ sung sau.",
      "OK"
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AppHeader
          variant="compact"
          style={styles.header}
          title="Chỉnh sửa hồ sơ"
          //subtitle="Cập nhật thông tin hiển thị của tài khoản."
          left={<IconButton icon="close" onPress={() => navigation.goBack()} />}
          right={<IconButton icon="checkmark" onPress={handleSave} color={theme.colors.primary} />}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <SectionCard style={styles.avatarSection}>
            <Pressable style={styles.avatarWrap} onPress={handleAvatarPress}>
              <Image source={{ uri: user?.avatarUrl || DEFAULT_AVATAR }} style={styles.avatar} />
              <View style={styles.avatarOverlay}>
                <Ionicons name="camera" size={24} color={theme.colors.white} />
              </View>
            </Pressable>

            <Pressable onPress={handleAvatarPress} style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
            </Pressable>
          </SectionCard>

          <SectionCard style={styles.formSection}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <Field
              label="Tên đầy đủ"
              icon="person-outline"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập tên của bạn"
            />
            <Field
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            <Field
              label="Số điện thoại"
              icon="call-outline"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+84 xxx xxx xxx"
              keyboardType="phone-pad"
            />
          </SectionCard>

          <SectionCard style={styles.formSection}>
            <Text style={styles.sectionTitle}>Địa chỉ</Text>
            <Field
              label="Địa chỉ"
              icon="map-outline"
              value={street}
              onChangeText={setStreet}
              placeholder="Nhập địa chỉ"
            />
            <Field
              label="Thành phố"
              icon="business-outline"
              value={city}
              onChangeText={setCity}
              placeholder="Nhập thành phố"
            />
            <Field
              label="Quốc gia"
              icon="globe-outline"
              value={country}
              onChangeText={setCountry}
              placeholder="Nhập quốc gia"
            />
          </SectionCard>
          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Lưu thay đổi</Text>
          </Pressable>
        </View>

        <LoadingOverlay visible={saving} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  editable = true,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldInputWrap, !editable && styles.fieldInputDisabled]}>
        <View style={styles.fieldIconBox}>
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          style={styles.input}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.background,
  },
  flex: { flex: 1 },
  container: {
    padding: theme.layout.detailPadding,
    gap: theme.spacing.lg,
  },
  avatarSection: {
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  avatarOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: 54,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoBtn: {
    marginTop: theme.spacing.md,
  },
  changePhotoText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  formSection: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.text,
  },
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: theme.colors.text,
  },
  fieldInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.white,
  },
  fieldInputDisabled: {
    backgroundColor: theme.colors.surface,
  },
  fieldIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  bottomBar: {
    padding: theme.layout.bottomBarPadding,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  saveBtn: {
    minHeight: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "800",
  },
});
