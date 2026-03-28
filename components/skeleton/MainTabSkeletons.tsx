import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import theme from "../../config/theme";
import SkeletonBlock from "./SkeletonBlock";

export function TourCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.homeCard}>
          <SkeletonBlock style={styles.homeImage} />
          <SkeletonBlock style={styles.homeTitle} />
          <SkeletonBlock style={styles.homeMeta} />
          <SkeletonBlock style={styles.homeMetaShort} />
          <SkeletonBlock style={styles.homePrice} />
        </View>
      ))}
    </View>
  );
}

export function FavouriteCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.homeCard}>
          <SkeletonBlock style={styles.homeImage} />
          <SkeletonBlock style={styles.homeTitle} />
          <SkeletonBlock style={styles.homeMeta} />
          <SkeletonBlock style={styles.homePrice} />
        </View>
      ))}
    </View>
  );
}

export function InboxItemSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.inboxList}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.inboxRow}>
          <SkeletonBlock style={styles.avatar} />
          <View style={styles.inboxContent}>
            <View style={styles.inboxHeader}>
              <SkeletonBlock style={styles.inboxName} />
              <SkeletonBlock style={styles.inboxTime} />
            </View>
            <SkeletonBlock style={styles.inboxLine} />
            <SkeletonBlock style={styles.inboxLineShort} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function HomeContentSkeleton() {
  return (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeaderRow}>
        <SkeletonBlock style={styles.sectionTitleSkeleton} />
        <SkeletonBlock style={styles.sectionActionSkeleton} />
      </View>
      <TourCardSkeletonGrid />
    </View>
  );
}

export function FavouriteContentSkeleton() {
  return (
    <View style={styles.contentSection}>
      <FavouriteCardSkeletonGrid />
    </View>
  );
}

export function ExploreTourSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.exploreList}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.exploreCard}>
          <SkeletonBlock style={styles.exploreImage} />
          <View style={styles.exploreContent}>
            <SkeletonBlock style={styles.exploreTitle} />
            <SkeletonBlock style={styles.exploreMeta} />
            <SkeletonBlock style={styles.exploreMetaShort} />
            <View style={styles.exploreFooter}>
              <SkeletonBlock style={styles.explorePrice} />
              <SkeletonBlock style={styles.exploreRating} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function TourSearchSuggestionsSkeleton() {
  return (
    <View style={styles.searchSuggestionWrap}>
      <View style={styles.searchSuggestionHeader}>
        <SkeletonBlock style={styles.searchSuggestionTitle} />
        <SkeletonBlock style={styles.searchSuggestionAction} />
      </View>
      <View style={styles.searchSuggestionChips}>
        <SkeletonBlock style={styles.searchSuggestionChip} />
        <SkeletonBlock style={styles.searchSuggestionChipWide} />
        <SkeletonBlock style={styles.searchSuggestionChip} />
      </View>
      <ExploreTourSkeletonList count={3} />
    </View>
  );
}

export function ChatTimelineSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.chatList}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.chatRow}>
          <SkeletonBlock style={styles.chatAvatar} />
          <View style={styles.chatBubbleWrap}>
            <SkeletonBlock style={styles.chatName} />
            <SkeletonBlock style={styles.chatBubbleLarge} />
            <SkeletonBlock style={styles.chatBubbleSmall} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function BookingCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.bookingList}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <SkeletonBlock style={styles.bookingTitle} />
            <SkeletonBlock style={styles.bookingBadge} />
          </View>
          <SkeletonBlock style={styles.bookingMeta} />
          <SkeletonBlock style={styles.bookingMetaShort} />
          <View style={styles.bookingFooter}>
            <SkeletonBlock style={styles.bookingDate} />
            <SkeletonBlock style={styles.bookingAction} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function TourDetailSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScreen}>
      <SkeletonBlock style={styles.detailHero} />
      <View style={styles.detailCard}>
        <SkeletonBlock style={styles.detailMeta} />
        <View style={styles.detailRow}>
          <SkeletonBlock style={styles.detailTitle} />
          <SkeletonBlock style={styles.detailPrice} />
        </View>
        <View style={styles.detailQuickRow}>
          <SkeletonBlock style={styles.detailChip} />
          <SkeletonBlock style={styles.detailChip} />
        </View>
        <View style={styles.detailTabs}>
          <SkeletonBlock style={styles.detailTab} />
          <SkeletonBlock style={styles.detailTab} />
          <SkeletonBlock style={styles.detailTabWide} />
        </View>
      </View>
      <View style={styles.detailContent}>
        <SkeletonBlock style={styles.detailSectionTitle} />
        <SkeletonBlock style={styles.detailParagraph} />
        <SkeletonBlock style={styles.detailParagraph} />
        <SkeletonBlock style={styles.detailParagraphShort} />
        <View style={styles.detailInfoCard}>
          <SkeletonBlock style={styles.detailLine} />
          <SkeletonBlock style={styles.detailLineShort} />
          <SkeletonBlock style={styles.detailLine} />
        </View>
      </View>
    </ScrollView>
  );
}

export function HomeScreenSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.homeScreen}>
      <View style={styles.homeHeader}>
        <SkeletonBlock style={styles.heroTitle} />
        <SkeletonBlock style={styles.heroSubtitle} />
      </View>
      <SkeletonBlock style={styles.searchBar} />
      <View style={styles.categoryRow}>
        <SkeletonBlock style={styles.categoryChip} />
        <SkeletonBlock style={styles.categoryChipWide} />
        <SkeletonBlock style={styles.categoryChip} />
      </View>
      <TourCardSkeletonGrid />
    </ScrollView>
  );
}

export function FavouriteScreenSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screen}>
      <SkeletonBlock style={styles.pageTitle} />
      <SkeletonBlock style={styles.pageSubtitle} />
      <View style={styles.categoryRow}>
        <SkeletonBlock style={styles.categoryChip} />
        <SkeletonBlock style={styles.categoryChipWide} />
        <SkeletonBlock style={styles.categoryChip} />
      </View>
      <FavouriteCardSkeletonGrid />
    </ScrollView>
  );
}

export function InboxScreenSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screen}>
      <SkeletonBlock style={styles.pageTitle} />
      <SkeletonBlock style={styles.pageSubtitleWide} />
      <View style={styles.tabRow}>
        <SkeletonBlock style={styles.tabChip} />
        <SkeletonBlock style={styles.tabChip} />
      </View>
      <InboxItemSkeletonList />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: theme.layout.topLevelPadding,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 16,
  },
  homeScreen: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 120,
    gap: 18,
  },
  homeHeader: {
    gap: 10,
  },
  heroTitle: {
    width: 180,
    height: 24,
    borderRadius: 10,
  },
  heroSubtitle: {
    width: 140,
    height: 14,
    borderRadius: 8,
  },
  searchBar: {
    width: "100%",
    height: 56,
    borderRadius: 28,
  },
  pageTitle: {
    width: 160,
    height: 28,
    borderRadius: 10,
  },
  pageSubtitle: {
    width: 210,
    height: 14,
    borderRadius: 8,
  },
  pageSubtitleWide: {
    width: "92%",
    height: 14,
    borderRadius: 8,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 10,
  },
  categoryChip: {
    width: 88,
    height: 36,
    borderRadius: 18,
  },
  categoryChipWide: {
    width: 120,
    height: 36,
    borderRadius: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  homeCard: {
    width: "48%",
    marginBottom: 24,
  },
  homeImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 24,
    marginBottom: 12,
  },
  homeTitle: {
    width: "82%",
    height: 16,
    marginBottom: 8,
  },
  homeMeta: {
    width: "68%",
    height: 12,
    marginBottom: 6,
  },
  homeMetaShort: {
    width: "52%",
    height: 12,
    marginBottom: 10,
  },
  homePrice: {
    width: "58%",
    height: 14,
  },
  tabRow: {
    flexDirection: "row",
    gap: 24,
  },
  tabChip: {
    width: 110,
    height: 28,
    borderRadius: 14,
  },
  inboxList: {
    gap: 18,
  },
  inboxRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  contentSection: {
    gap: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleSkeleton: {
    width: 170,
    height: 22,
    borderRadius: 10,
  },
  sectionActionSkeleton: {
    width: 92,
    height: 34,
    borderRadius: 17,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  inboxContent: {
    flex: 1,
    gap: 8,
    paddingTop: 4,
  },
  inboxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  inboxName: {
    width: "54%",
    height: 14,
  },
  inboxTime: {
    width: 52,
    height: 12,
  },
  inboxLine: {
    width: "88%",
    height: 12,
  },
  inboxLineShort: {
    width: "62%",
    height: 12,
  },
  exploreList: {
    gap: 16,
  },
  searchSuggestionWrap: {
    gap: 18,
  },
  searchSuggestionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchSuggestionTitle: {
    width: 170,
    height: 24,
    borderRadius: 10,
  },
  searchSuggestionAction: {
    width: 84,
    height: 18,
    borderRadius: 9,
  },
  searchSuggestionChips: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  searchSuggestionChip: {
    width: 88,
    height: 34,
    borderRadius: 999,
  },
  searchSuggestionChipWide: {
    width: 122,
    height: 34,
    borderRadius: 999,
  },
  exploreCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: theme.colors.white,
  },
  exploreImage: {
    width: "100%",
    height: 200,
    borderRadius: 24,
    marginBottom: 12,
  },
  exploreContent: {
    gap: 8,
    paddingBottom: 4,
  },
  exploreTitle: {
    width: "72%",
    height: 18,
  },
  exploreMeta: {
    width: "46%",
    height: 12,
  },
  exploreMetaShort: {
    width: "34%",
    height: 12,
  },
  exploreFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  explorePrice: {
    width: 120,
    height: 16,
  },
  exploreRating: {
    width: 52,
    height: 28,
    borderRadius: 14,
  },
  chatList: {
    gap: 18,
  },
  chatRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  chatBubbleWrap: {
    flex: 1,
    gap: 8,
    paddingTop: 2,
  },
  chatName: {
    width: 94,
    height: 12,
  },
  chatBubbleLarge: {
    width: "78%",
    height: 52,
    borderRadius: 20,
  },
  chatBubbleSmall: {
    width: "48%",
    height: 12,
  },
  bookingList: {
    gap: 14,
  },
  bookingCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.white,
    padding: 16,
    gap: 10,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  bookingTitle: {
    width: "54%",
    height: 16,
  },
  bookingBadge: {
    width: 88,
    height: 28,
    borderRadius: 14,
  },
  bookingMeta: {
    width: "42%",
    height: 12,
  },
  bookingMetaShort: {
    width: "34%",
    height: 12,
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  bookingDate: {
    width: 110,
    height: 14,
  },
  bookingAction: {
    width: 86,
    height: 14,
  },
  detailScreen: {
    paddingBottom: 120,
  },
  detailHero: {
    width: "100%",
    height: 280,
    borderRadius: 0,
  },
  detailCard: {
    marginHorizontal: theme.spacing.md,
    marginTop: -40,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    gap: 14,
  },
  detailMeta: {
    width: 120,
    height: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },
  detailTitle: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  detailPrice: {
    width: 100,
    height: 34,
    borderRadius: 12,
  },
  detailQuickRow: {
    flexDirection: "row",
    gap: 12,
  },
  detailChip: {
    width: 110,
    height: 18,
    borderRadius: 9,
  },
  detailTabs: {
    flexDirection: "row",
    gap: 10,
  },
  detailTab: {
    width: 92,
    height: 36,
    borderRadius: 18,
  },
  detailTabWide: {
    width: 138,
    height: 36,
    borderRadius: 18,
  },
  detailContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    gap: 14,
  },
  detailSectionTitle: {
    width: 180,
    height: 22,
    borderRadius: 10,
  },
  detailParagraph: {
    width: "100%",
    height: 14,
  },
  detailParagraphShort: {
    width: "72%",
    height: 14,
  },
  detailInfoCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    gap: 12,
  },
  detailLine: {
    width: "88%",
    height: 14,
  },
  detailLineShort: {
    width: "54%",
    height: 14,
  },
});
