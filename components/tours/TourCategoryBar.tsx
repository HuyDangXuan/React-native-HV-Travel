import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "../../config/theme";
import { TourUiColors } from "./tourUiTypes";

export const getTourCategoryMaterialIcon = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes("bien") || c.includes("beach")) return "beach";
  if (c.includes("thien nhien") || c.includes("rung") || c.includes("nature")) return "pine-tree";
  if (c.includes("van hoa") || c.includes("lich su") || c.includes("cultural")) return "bank";
  if (c.includes("kham pha") || c.includes("adventure")) return "hiking";
  if (c.includes("thanh pho") || c.includes("city")) return "city";
  if (c.includes("cao cap") || c.includes("luxury")) return "diamond-stone";
  if (c.includes("song") || c.includes("lake") || c.includes("nuoc")) return "waves";
  if (c.includes("surfing") || c.includes("luot")) return "surfing";
  return "map";
};

type Props = {
  categories: string[];
  selectedCategory: string | null;
  ui: TourUiColors;
  onSelectCategory: (category: string | null) => void;
};

export default function TourCategoryBar({ categories, selectedCategory, ui, onSelectCategory }: Props) {
  if (categories.length === 0) {
    return <View style={[styles.headerDivider, { backgroundColor: ui.border }]} />;
  }

  return (
    <View style={[styles.categoriesWrap, { backgroundColor: ui.bg }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
        {categories.map((cat, index) => {
          const active = selectedCategory === cat;
          return (
            <Pressable
              key={cat || index}
              style={[
                styles.catItem,
                { backgroundColor: ui.mutedSurface },
                active && styles.catItemActive,
                active && { backgroundColor: ui.primary },
              ]}
              onPress={() => onSelectCategory(active ? null : cat)}
            >
              <MaterialCommunityIcons
                name={getTourCategoryMaterialIcon(cat) as any}
                size={20}
                color={active ? ui.onPrimary : ui.textSecondary}
              />
              <Text
                style={[
                  styles.catText,
                  { color: ui.textSecondary, backgroundColor: "transparent" },
                  active && styles.catTextActive,
                  active && { color: ui.onPrimary },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={[styles.headerDivider, { backgroundColor: ui.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesWrap: {
    backgroundColor: theme.colors.background,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 24,
  },
  headerDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: "transparent",
  },
  catItemActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  catText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray,
  },
  catTextActive: {
    color: theme.colors.white,
    fontWeight: "800",
  },
});
