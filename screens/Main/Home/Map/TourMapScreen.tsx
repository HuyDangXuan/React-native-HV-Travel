import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import theme from "../../../../config/theme";
import AppHeader from "../../../../components/ui/AppHeader";
import SectionCard from "../../../../components/ui/SectionCard";
import EmptyState from "../../../../components/ui/EmptyState";

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
  const tours: MapTourInput[] = Array.isArray(route?.params?.tours) ? route.params.tours : [];
  const groupedDestinations = useMemo(() => buildGroupedDestinations(tours), [tours]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader
        variant="compact"
        title="Bản đồ tour"
        subtitle={`${groupedDestinations.length} điểm đến có tour`}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.mapWrap}>
        <MapView style={StyleSheet.absoluteFill} initialRegion={DEFAULT_REGION} />

        <SectionCard style={styles.mapHint}>
          <Ionicons name="map-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.mapHintText}>
            Bản đồ hiện đang ở chế độ tổng quan, chưa gắn marker theo tour.
          </Text>
        </SectionCard>

        {groupedDestinations.length === 0 ? (
          <View style={styles.emptyOverlay}>
            <EmptyState
              icon="location-outline"
              title="Chưa có điểm đến để hiển thị"
              description="Khi dữ liệu tour có thành phố điểm đến, danh sách sẽ xuất hiện ở khung bên dưới."
            />
          </View>
        ) : null}
      </View>

      {groupedDestinations.length > 0 ? (
        <SectionCard style={styles.bottomSheet}>
          <View style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetTextWrap}>
              <Text style={styles.bottomSheetTitle}>Danh sách điểm đến</Text>
              <Text style={styles.bottomSheetSubtitle}>
                Xem nhanh các thành phố hiện có tour trong dữ liệu của bạn
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
              <Text style={styles.exploreBtnText}>Xem tour</Text>
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
                <Ionicons name="location-outline" size={14} color={theme.colors.primary} />
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  mapWrap: {
    flex: 1,
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
    color: theme.colors.text,
    fontWeight: "600",
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  bottomSheet: {
    margin: 16,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
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
    ...theme.typography.sectionTitle,
    color: theme.colors.text,
  },
  bottomSheetSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.gray,
    fontWeight: "500",
  },
  exploreBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
  },
  exploreBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
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
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
  },
  tourChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: "700",
  },
});
