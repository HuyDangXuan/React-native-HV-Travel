import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import theme from "../../../../../config/theme";

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState("Huy Đặng Xuân");
  const [email, setEmail] = useState("hv-travel@gmail.com");
  const [phone, setPhone] = useState("+84 170 000 0000");
  const [gender, setGender] = useState("Nam");
  const [dob, setDob] = useState("01/01/1990");
  const [address, setAddress] = useState("Hà Nội, Việt Nam");

  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const handleSave = () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên đầy đủ");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    // Save logic here
    console.log("Saving profile...");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>

          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>

          <Pressable style={styles.headerBtn} onPress={handleSave} hitSlop={10}>
            <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: "https://i.pravatar.cc/200?img=12" }}
                style={styles.avatar}
              />
              <View style={styles.avatarOverlay}>
                <Ionicons name="camera" size={24} color={theme.colors.white} />
              </View>
            </View>
            <Pressable onPress={() => {}} style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
            </Pressable>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

            <Field
              label="Tên đầy đủ"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên của bạn"
            />

            <Field
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
            />

            <Field
              label="Số điện thoại"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="+84 xxx xxx xxx"
              keyboardType="phone-pad"
            />

            <Field
              label="Địa chỉ"
              icon="location-outline"
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ"
            />
          </View>

          {/* Additional Info */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>

            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Pressable
                  style={styles.selectField}
                  onPress={() => setShowGenderPicker(true)}
                >
                  <View style={styles.selectLeft}>
                    <View style={styles.selectIcon}>
                      <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.selectLabel}>Giới tính</Text>
                      <Text style={styles.selectValue}>{gender}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.gray} />
                </Pressable>
              </View>

              <View style={{ flex: 1 }}>
                <Pressable style={styles.selectField} onPress={() => {}}>
                  <View style={styles.selectLeft}>
                    <View style={styles.selectIcon}>
                      <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.selectLabel}>Ngày sinh</Text>
                      <Text style={styles.selectValue}>{dob}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.gray} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.dangerSection}>
            <Text style={styles.dangerTitle}>Vùng nguy hiểm</Text>
            <Pressable style={styles.dangerBtn} onPress={() => {}}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
              <Text style={styles.dangerText}>Xóa tài khoản</Text>
            </Pressable>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={styles.bottomBar}>
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Lưu thay đổi</Text>
          </Pressable>
        </View>

        {/* Gender Picker Modal */}
        {showGenderPicker && (
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowGenderPicker(false)}
          >
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitle}>Chọn giới tính</Text>
              {["Nam", "Nữ", "Khác"].map((g) => (
                <Pressable
                  key={g}
                  style={styles.pickerOption}
                  onPress={() => {
                    setGender(g);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{g}</Text>
                  {gender === g && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        )}
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
}: {
  label: string;
  icon: any;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: any;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.field}>
        <View style={styles.fieldIconBox}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.gray}
          style={styles.input}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },

  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "800",
    color: theme.colors.text,
  },

  container: {
    padding: theme.spacing.md,
  },

  // Avatar Section
  avatarSection: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: theme.colors.white,
  },
  changePhotoBtn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  changePhotoText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: theme.colors.primary,
  },

  // Form Section
  formSection: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  fieldWrapper: {
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  field: {
    height: 54,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fieldIconBox: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "600",
  },

  // Select Field
  row2: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  selectField: {
    height: 70,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flex: 1,
  },
  selectIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  selectLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    fontWeight: "600",
  },
  selectValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: "700",
    marginTop: 2,
  },

  // Danger Zone
  dangerSection: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  dangerTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: theme.spacing.md,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  dangerText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: "#DC2626",
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingBottom: 34,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveBtn: {
    height: 54,
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

  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerModal: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    paddingBottom: 34,
  },
  pickerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pickerOptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "600",
  },
});