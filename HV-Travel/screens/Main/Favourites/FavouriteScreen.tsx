import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../config/theme";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const GAP = 14;
const CARD_W = (width - 18 * 2 - GAP) / 2; // paddingHorizontal=18, gap giữa 2 cột
const CARD_H = 190;

type FavItem = {
  id: string;
  title: string;
  rating: number;
  image: string;
};

const FAVS: FavItem[] = [
  {
    id: "f1",
    title: "Cox's Bazar",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "f2",
    title: "Maldives Package",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "f3",
    title: "Bandarbans Package",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "f4",
    title: "Bali Package",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "f5",
    title: "Kashmir Package",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1200&q=80&auto=format&fit=crop",
  },
];

export default function FavouriteScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      // TODO: gọi API / reload favourites thật ở đây
      // await fetchFavourites();

      // Demo giả lập load
      await new Promise((r) => setTimeout(r, 1200));
    } finally {
      setRefreshing(false);
    }
  }, []);


  const renderItem = ({ item }: { item: FavItem }) => (
    <Pressable style={styles.card} onPress={() => navigation.navigate("TourDetailScreen")}>
      <ImageBackground source={{ uri: item.image }} style={styles.img} imageStyle={styles.imgRadius}>
        {/* Overlay mờ nhẹ (để chữ nổi) */}
        <View style={styles.overlay} />

        {/* Bookmark góc phải */}
        <Pressable style={styles.bookmark} onPress={() => {}}>
          <Ionicons name="bookmark" size={20} color={theme.colors.primary} />
        </Pressable>

        {/* Text + rating */}
        <View style={styles.meta}>
          <View style={styles.locRow}>
            <Ionicons name="location" size={14} color="#FFFFFF" />
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
          </View>

          <View style={styles.starRow}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <Ionicons key={idx} name="star" size={14} color="#FBBF24" />
            ))}
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>

        <Text style={styles.headerTitle}>Yêu thích</Text>

        {/* placeholder để title cân giữa */}
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={FAVS}
        keyExtractor={(i) => i.id}
        numColumns={2}
        renderItem={renderItem}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.white },

  header: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.text,
  },

  list: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 18,
    gap: GAP,
  },

  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  img: { flex: 1 },
  imgRadius: { borderRadius: 18 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  bookmark: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },

  meta: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },
  locRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { flex: 1, color: "#FFFFFF", fontSize: 15, fontWeight: "800" },

  starRow: { flexDirection: "row", gap: 4, marginTop: 8 },
});
