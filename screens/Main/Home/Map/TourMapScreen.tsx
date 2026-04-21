import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AppHeader from "../../../../components/ui/AppHeader";
import SectionCard from "../../../../components/ui/SectionCard";
import EmptyState from "../../../../components/ui/EmptyState";
import { useI18n } from "../../../../context/I18nContext";
import { useAppTheme, useThemeMode } from "../../../../context/ThemeModeContext";

type MapTourInput = {
  id: string;
  name: string;
  destinationCity?: string;
  destinationCountry?: string;
};

type GroupedDestination = {
  city: string;
  country?: string;
  tourIds: string[];
  tourNames: string[];
};

const DEFAULT_REGION: Region = {
  latitude: 10.8231,
  longitude: 106.6297,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1f2937" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#111827" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#111827" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#93c5fd" }] },
];

const buildGroupedDestinations = (tours: MapTourInput[]) => {
  const grouped = new Map<string, GroupedDestination>();

  for (const tour of tours) {
    const city = tour.destinationCity?.trim();
    if (!city) continue;

    const country = tour.destinationCountry?.trim();
    const key = `${city.toLowerCase()}|${(country ?? "").toLowerCase()}`;
    const current = grouped.get(key);

    if (current) {
      current.tourIds.push(tour.id);
      current.tourNames.push(tour.name);
    } else {
      grouped.set(key, {
        city,
        country,
        tourIds: [tour.id],
        tourNames: [tour.name],
      });
    }
  }

  return Array.from(grouped.values());
};

export default function TourMapScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useI18n();
  const appTheme = useAppTheme();
  const { themeName } = useThemeMode();
  const tours: MapTourInput[] = Array.isArray(route?.params?.tours) ? route.params.tours : [];
  const groupedDestinations = useMemo(() => buildGroupedDestinations(tours), [tours]);
  const ui = useMemo(
    () => ({
      bg: appTheme.semantic.screenBackground,
      surface: appTheme.semantic.screenSurface,
      mutedSurface: appTheme.semantic.screenMutedSurface,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      border: appTheme.semantic.divider,
      primary: appTheme.colors.primary,
      onPrimary: appTheme.colors.white,
      overlay: appTheme.colors.overlay,
    }),
    [appTheme]
  );
  const styles = useMemo(() => createStyles(appTheme, ui), [appTheme, ui]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} backgroundColor={ui.surface} />
      <AppHeader
        variant="compact"
        style={{ backgroundColor: ui.surface }}
        title={t("tourMap.title")}
        subtitle={t("tourMap.subtitleCount", { count: groupedDestinations.length })}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.mapWrap}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={DEFAULT_REGION}
          customMapStyle={themeName === "dark" ? DARK_MAP_STYLE : []}
          userInterfaceStyle={themeName === "dark" ? "dark" : "light"}
        />

        <SectionCard style={styles.mapHint}>
          <Ionicons name="map-outline" size={18} color={ui.primary} />
          <Text style={styles.mapHintText}>
            {t("tourMap.overviewHint")}
          </Text>
        </SectionCard>

        {groupedDestinations.length === 0 ? (
          <View style={styles.emptyOverlay}>
            <EmptyState
              icon="location-outline"
              title={t("tourMap.emptyTitle")}
              description={t("tourMap.emptyDescription")}
            />
          </View>
        ) : null}
      </View>

      {groupedDestinations.length > 0 ? (
        <SectionCard style={styles.bottomSheet}>
          <View style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetTextWrap}>
              <Text style={styles.bottomSheetTitle}>{t("tourMap.destinationListTitle")}</Text>
              <Text style={styles.bottomSheetSubtitle}>
                {t("tourMap.destinationListDescription")}
              </Text>
            </View>
            <Pressable
              style={styles.exploreBtn}
              onPress={() =>
                navigation.navigate("Explore", {
                  location: groupedDestinations[0]?.city,
                })
              }
            >
              <Text style={styles.exploreBtnText}>{t("tourMap.exploreAction")}</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tourChipRow}
          >
            {groupedDestinations.map((destination, index) => (
              <View
                key={`${destination.city}-${destination.country ?? index}`}
                style={styles.tourChip}
              >
                <Ionicons name="location-outline" size={14} color={ui.primary} />
                <Text style={styles.tourChipText} numberOfLines={1}>
                  {destination.city}
                  {destination.country ? `, ${destination.country}` : ""}
                </Text>
              </View>
            ))}
          </ScrollView>
        </SectionCard>
      ) : null}
    </SafeAreaView>
  );
}

function createStyles(
  appTheme: ReturnType<typeof useAppTheme>,
  ui: {
    bg: string;
    surface: string;
    mutedSurface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    primary: string;
    onPrimary: string;
    overlay: string;
  }
) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: ui.bg,
    },
    mapWrap: {
      flex: 1,
      backgroundColor: ui.mutedSurface,
    },
    mapHint: {
      position: "absolute",
      top: 16,
      left: 16,
      right: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    mapHintText: {
      flex: 1,
      fontSize: 13,
      color: ui.textPrimary,
      fontWeight: "600",
    },
    emptyOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      backgroundColor: ui.overlay,
    },
    bottomSheet: {
      margin: appTheme.spacing.md,
      padding: appTheme.spacing.md,
      gap: appTheme.spacing.md,
    },
    bottomSheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    bottomSheetTextWrap: {
      flex: 1,
    },
    bottomSheetTitle: {
      ...appTheme.typography.sectionTitle,
      color: ui.textPrimary,
    },
    bottomSheetSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: ui.textSecondary,
      fontWeight: "500",
    },
    exploreBtn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: appTheme.radius.lg,
      backgroundColor: ui.primary,
    },
    exploreBtnText: {
      color: ui.onPrimary,
      fontSize: appTheme.fontSize.sm,
      fontWeight: "800",
    },
    tourChipRow: {
      gap: 10,
    },
    tourChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: appTheme.radius.pill,
      backgroundColor: ui.mutedSurface,
      borderWidth: 1,
      borderColor: ui.border,
    },
    tourChipText: {
      fontSize: appTheme.fontSize.sm,
      color: ui.textPrimary,
      fontWeight: "700",
    },
  });
}
