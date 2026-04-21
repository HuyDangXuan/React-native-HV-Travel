import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CameraView, BarcodeScanningResult, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import AppHeader from "../../../../components/ui/AppHeader";
import SectionCard from "../../../../components/ui/SectionCard";
import { useAuth } from "../../../../context/AuthContext";
import { useI18n } from "../../../../context/I18nContext";
import { useAppTheme, useThemeMode } from "../../../../context/ThemeModeContext";
import { MessageBoxService } from "../../../MessageBox/MessageBoxService";
import { AuthService } from "../../../../services/AuthService";
import { AuthSessionService } from "../../../../services/AuthSessionService";

type QuickLoginPayload = {
  accessToken?: string;
  refreshToken?: string;
  email?: string;
  password?: string;
};

const readString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const looksLikeJwt = (value: string) => value.split(".").length === 3 && !value.includes(" ");

const parseJsonPayload = (raw: string): QuickLoginPayload | null => {
  if (!raw.startsWith("{")) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const source =
      parsed &&
      typeof parsed === "object" &&
      parsed.data &&
      typeof parsed.data === "object"
        ? (parsed.data as Record<string, unknown>)
        : parsed;

    const accessToken = readString(
      source.accessToken ?? source.token ?? source.authToken ?? source.bearerToken
    );
    const refreshToken = readString(source.refreshToken);
    const email = readString(source.email);
    const password = readString(source.password);

    if (!accessToken && !email) return null;

    return {
      accessToken: accessToken || undefined,
      refreshToken: refreshToken || undefined,
      email: email || undefined,
      password: password || undefined,
    };
  } catch {
    return null;
  }
};

const parseQueryPayload = (raw: string): QuickLoginPayload | null => {
  const querySource = raw.includes("?") ? raw.slice(raw.indexOf("?") + 1) : raw;
  if (!querySource.includes("=")) return null;

  const payload: Record<string, string> = {};

  for (const pair of querySource.split("&")) {
    if (!pair) continue;

    const [key, ...rest] = pair.split("=");
    const decodedKey = safeDecode(key).trim();
    const decodedValue = safeDecode(rest.join("=")).trim();

    if (decodedKey) {
      payload[decodedKey] = decodedValue;
    }
  }

  const accessToken = readString(
    payload.accessToken || payload.token || payload.authToken || payload.bearerToken
  );
  const refreshToken = readString(payload.refreshToken);
  const email = readString(payload.email);
  const password = readString(payload.password);

  if (!accessToken && !email) return null;

  return {
    accessToken: accessToken || undefined,
    refreshToken: refreshToken || undefined,
    email: email || undefined,
    password: password || undefined,
  };
};

const parseQuickLoginPayload = (rawData: string): QuickLoginPayload | null => {
  const raw = readString(rawData);
  if (!raw) return null;

  const fromJson = parseJsonPayload(raw);
  if (fromJson) return fromJson;

  const fromQuery = parseQueryPayload(raw);
  if (fromQuery) return fromQuery;

  const bearerToken = raw.toLowerCase().startsWith("bearer ") ? raw.slice(7).trim() : raw;
  if (looksLikeJwt(bearerToken)) {
    return { accessToken: bearerToken };
  }

  return null;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "message" in error) {
    const value = String((error as { message?: unknown }).message ?? "").trim();
    if (value) return value;
  }

  return fallback;
};

export default function QrQuickLoginScreen() {
  const navigation = useNavigation<any>();
  const { t } = useI18n();
  const { signIn, signInWithToken } = useAuth();
  const theme = useAppTheme();
  const { themeName } = useThemeMode();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanned, setIsScanned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scannerStatusText = useMemo(() => {
    if (isSubmitting) return t("qrQuickLogin.processing");
    if (isScanned) return t("qrQuickLogin.scanned");
    return t("qrQuickLogin.scanHint");
  }, [isScanned, isSubmitting, t]);

  const submitQuickLogin = useCallback(
    async (payload: QuickLoginPayload) => {
      if (payload.email && payload.password) {
        await signIn(payload.email, payload.password);
        return;
      }

      if (payload.accessToken && payload.refreshToken) {
        const customer = await AuthService.authToken(payload.accessToken);
        await AuthSessionService.setSessionFromAuthResponse({
          data: {
            customer,
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
          },
        });
        return;
      }

      if (payload.accessToken) {
        await signInWithToken(payload.accessToken);
        return;
      }

      throw { status: 400, message: t("qrQuickLogin.invalidMessage") };
    },
    [signIn, signInWithToken, t]
  );

  const handleBarcodeScanned = useCallback(
    async ({ data }: BarcodeScanningResult) => {
      if (isScanned || isSubmitting) return;

      setIsScanned(true);
      setIsSubmitting(true);

      try {
        const payload = parseQuickLoginPayload(data);
        if (!payload) {
          throw { status: 400, message: t("qrQuickLogin.invalidMessage") };
        }

        await submitQuickLogin(payload);

        MessageBoxService.success(
          t("qrQuickLogin.successTitle"),
          t("qrQuickLogin.successMessage"),
          t("common.ok"),
          () => navigation.goBack()
        );
      } catch (error) {
        MessageBoxService.error(
          t("qrQuickLogin.invalidTitle"),
          getErrorMessage(error, t("qrQuickLogin.invalidMessage")),
          t("common.ok"),
          () => setIsScanned(false)
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isScanned, isSubmitting, navigation, submitQuickLogin, t]
  );

  const handleRequestPermission = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenBackground }]}> 
      <StatusBar style={themeName === "dark" ? "light" : "dark"} backgroundColor={theme.semantic.screenBackground} />
      <AppHeader
        variant="compact"
        style={{ backgroundColor: theme.semantic.screenBackground }}
        title={t("qrQuickLogin.title")}
        onBack={() => navigation.goBack()}
        centerTitle={true}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: theme.layout.detailPadding,
            paddingBottom: 24,
            gap: theme.spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 16 }}>
          <SectionCard style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, { color: theme.semantic.textPrimary }]}> 
              {t("qrQuickLogin.title")}
            </Text>
            <Text style={[styles.summaryText, { color: theme.semantic.textSecondary }]}> 
              {t("qrQuickLogin.subtitle")}
            </Text>
          </SectionCard>
        </View>

        {!permission?.granted ? (
          <SectionCard style={styles.permissionCard}>
            <View style={[styles.permissionIcon, { backgroundColor: theme.colors.primaryLight }]}> 
              <Ionicons name="camera-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.permissionTitle, { color: theme.semantic.textPrimary }]}> 
              {t("qrQuickLogin.permissionTitle")}
            </Text>
            <Text style={[styles.permissionText, { color: theme.semantic.textSecondary }]}> 
              {t("qrQuickLogin.permissionDescription")}
            </Text>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleRequestPermission}
            >
              <Text style={[styles.primaryButtonText, { color: theme.colors.white }]}> 
                {t("qrQuickLogin.grantPermission")}
              </Text>
            </Pressable>
          </SectionCard>
        ) : (
          <SectionCard style={styles.scannerCard} padded={false}>
            <View style={[styles.cameraWrap, { backgroundColor: theme.semantic.screenMutedSurface }]}> 
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={isScanned || isSubmitting ? undefined : handleBarcodeScanned}
              />
              <View
                pointerEvents="none"
                style={[styles.scanFrame, { borderColor: theme.colors.primary }]}
              />
            </View>

            <View style={[styles.scannerFooter, { borderTopColor: theme.semantic.divider }]}> 
              <Text style={[styles.scannerHint, { color: theme.semantic.textSecondary }]}> 
                {scannerStatusText}
              </Text>
              <Pressable
                style={[
                  styles.secondaryButton,
                  {
                    backgroundColor: theme.semantic.screenMutedSurface,
                    borderColor: theme.semantic.divider,
                  },
                ]}
                onPress={() => setIsScanned(false)}
                disabled={isSubmitting}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.semantic.textPrimary }]}> 
                  {t("qrQuickLogin.scanAgain")}
                </Text>
              </Pressable>
            </View>
          </SectionCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {},
  summaryCard: {
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  permissionCard: {
    marginTop: 12,
    alignItems: "center",
    gap: 10,
    paddingVertical: 20,
  },
  permissionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionTitle: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  permissionText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  scannerCard: {
    marginTop: 12,
  },
  cameraWrap: {
    height: 330,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  scanFrame: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -108,
    marginTop: -108,
    width: 216,
    height: 216,
    borderWidth: 2,
    borderRadius: 18,
  },
  scannerFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  scannerHint: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  primaryButton: {
    marginTop: 2,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
