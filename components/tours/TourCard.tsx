import React from "react";
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../config/theme";
import { TourUiCard, TourUiColors } from "./tourUiTypes";

const { width } = Dimensions.get("window");

type Props = {
  tour: TourUiCard;
  ui: TourUiColors;
  formatPrice: (price: number) => string;
  perPersonLabel: string;
  defaultDestination: string;
  favouriteActive?: boolean;
  favouriteBusy?: boolean;
  onPress: () => void;
  onFavouritePress?: () => void;
};

export default function TourCard({
  tour,
  ui,
  formatPrice,
  perPersonLabel,
  defaultDestination,
  favouriteActive = false,
  favouriteBusy = false,
  onPress,
  onFavouritePress,
}: Props) {
  return (
    <Pressable style={[styles.card, { backgroundColor: "transparent" }]} onPress={onPress}>
      <View style={[styles.imageWrap, { backgroundColor: ui.mutedSurface }]}>
        <Image source={{ uri: tour.thumbnail }} style={styles.image} />

        {onFavouritePress ? (
          <Pressable
            style={[styles.favBtn, favouriteBusy && styles.disabledButton]}
            onPress={(event) => {
              event.stopPropagation();
              onFavouritePress();
            }}
            disabled={favouriteBusy}
          >
            <Ionicons
              name={favouriteActive ? "heart" : "heart-outline"}
              size={24}
              color={favouriteActive ? "#ef4444" : ui.onPrimary}
              style={styles.favIconShadow}
            />
          </Pressable>
        ) : null}

        {(tour.discountPercent ?? 0) > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{tour.discountPercent}%</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: ui.textPrimary }]} numberOfLines={1}>
            {tour.name}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.ratingText, { color: ui.textPrimary }]}>{tour.rating || "4.9"}</Text>
          </View>
        </View>
        <Text style={[styles.cardSub, { color: ui.textSecondary }]} numberOfLines={1}>
          {tour.destinationCity || defaultDestination}
        </Text>
        <Text style={[styles.cardSub, { color: ui.textSecondary }]} numberOfLines={1}>
          {tour.durationText}
        </Text>
        <View style={styles.priceRow}>
          {tour.originalPrice ? (
            <Text style={[styles.oldPrice, { color: ui.placeholder }]}>{formatPrice(tour.originalPrice)}</Text>
          ) : null}
          <View style={styles.priceCurrentRow}>
            <Text style={[styles.priceVal, { color: ui.primary }]}>{formatPrice(tour.displayPrice)}</Text>
            <Text style={[styles.priceUnit, { color: ui.textSecondary }]}>{perPersonLabel}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: (width - 32 - 16) / 2,
    marginBottom: 24,
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: theme.colors.border,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  favIconShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  discountText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  cardInfo: {
    paddingRight: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  cardSub: {
    fontSize: 13,
    color: theme.colors.gray,
    marginBottom: 2,
    fontWeight: "500",
  },
  priceRow: {
    marginTop: 6,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
  },
  oldPrice: {
    fontSize: 13,
    color: theme.colors.placeholder,
    textDecorationLine: "line-through",
  },
  priceCurrentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceVal: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: theme.colors.gray,
    fontWeight: "500",
  },
});
