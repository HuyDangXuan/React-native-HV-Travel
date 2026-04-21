import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { TourService } from '../../../../services/TourService';
import LoadingOverlay from '../../../Loading/LoadingOverlay';
import { MessageBoxService } from '../../../MessageBox/MessageBoxService';
import { extractNumber } from '../../../../utils/PriceUtils';
import { Tour } from '../../../../models/Tour';
import { shouldTriggerOverlayRefresh } from '../../../../utils/pullToRefresh';
import { ExploreTourSkeletonList } from '../../../../components/skeleton/MainTabSkeletons';
import { useAppTheme, useThemeMode } from '../../../../context/ThemeModeContext';
import AppHeader from '../../../../components/ui/AppHeader';

const PULL_REFRESH_THRESHOLD = 72;

export default function ExploreScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Lấy params từ navigation
  const { location, cityId } = route?.params || {};

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSort, setSelectedSort] = useState('popular'); // popular, price-asc, price-desc, rating

  const [city, setCity] = useState<any>(null);
  const [tours, setTours] = useState<any[]>([]);
  const pullOffsetRef = useRef(0);
  const showInitialSkeleton = loading && !city && tours.length === 0;
  const appTheme = useAppTheme();
  const { themeName } = useThemeMode();
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
      danger: appTheme.colors.error,
    }),
    [appTheme]
  );
  const styles = useMemo(() => createStyles(appTheme, ui), [appTheme, ui]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!cityId) {
      MessageBoxService.error('Lỗi', 'Không tìm thấy thông tin thành phố', 'OK');
      return;
    }

    setLoading(true);
    try {
      // Lấy thông tin thành phố
      const cityRes = await TourService.getCityById(cityId);
      const cityData = Array.isArray(cityRes) ? cityRes[0] : cityRes?.data || cityRes;

      // Lấy danh sách tour theo thành phố
      const allTours = await TourService.getTours();

      // Filter tours theo city
      const cityTours = allTours.filter((tour: Tour) =>
        (tour?.destination?.city || '').toLowerCase() === String(location || '').toLowerCase()
      );

      const mappedCityTours = cityTours.map((tour: Tour) => ({
        ...tour,
        price: {
          adult: extractNumber(tour?.price?.adult),
          child: extractNumber(tour?.price?.child),
          infant: extractNumber(tour?.price?.infant),
          discount: extractNumber(tour?.price?.discount),
        },
      }));

      setCity(cityData);
      setTours(mappedCityTours);
    } catch (error: any) {
      console.error('Fetch error:', error);
      MessageBoxService.error('Lỗi', error?.message || 'Không thể tải dữ liệu', 'OK');
    } finally {
      setLoading(false);
    }
  }, [cityId, location]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    if (loading || refreshing) return;
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData, loading, refreshing]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    pullOffsetRef.current = Math.min(
      pullOffsetRef.current,
      event.nativeEvent.contentOffset.y
    );
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    pullOffsetRef.current = 0;
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    if (
      shouldTriggerOverlayRefresh({
        minOffsetY: pullOffsetRef.current,
        threshold: PULL_REFRESH_THRESHOLD,
        isBusy: refreshing || loading,
      })
    ) {
      onRefresh();
    }
  }, [loading, onRefresh, refreshing]);

  // Filter & Sort tours
  const filteredTours = tours
    .filter(tour => {
      const searchKey = search.trim().toLowerCase();
      if (!searchKey) return true;
      return (tour?.name || '').toLowerCase().includes(searchKey);
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case 'price-asc':
          return (a?.newPrice?.adult || a?.price?.adult || 0) - (b?.newPrice?.adult || b?.price?.adult || 0);
        case 'price-desc':
          return (b?.newPrice?.adult || b?.price?.adult || 0) - (a?.newPrice?.adult || a?.price?.adult || 0);
        case 'rating':
          return (b?.rating || 0) - (a?.rating || 0);
        default: // popular
          return 0;
      }
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} backgroundColor={ui.surface} />

      <AppHeader
        variant="compact"
        style={styles.header}
        title={location || city?.name || 'Khám phá'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
      >
        {showInitialSkeleton ? (
          <View style={styles.skeletonContent}>
            <ExploreTourSkeletonList />
          </View>
        ) : (
          <>
        {/* City Banner */}
        {city && (
          <View style={styles.banner}>
            <Image
              source={{ uri: city?.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200' }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerTitle}>{city?.name || location}</Text>
              {city?.description && (
                <Text style={styles.bannerDesc} numberOfLines={2}>
                  {city.description}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Highlights */}
        {city?.highlights && city.highlights.length > 0 && (
          <View style={styles.highlightsContainer}>
            <Text style={styles.sectionTitle}>Điểm nổi bật</Text>
            <View style={styles.highlightsList}>
              {city.highlights.map((item: string, index: number) => (
                <View key={index} style={styles.highlightItem}>
                  <Ionicons name="checkmark-circle" size={18} color={ui.primary} />
                  <Text style={styles.highlightText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchBox}>
          <Feather name="search" size={20} color={ui.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm kiếm tour..."
            placeholderTextColor={ui.textSecondary}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={ui.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sắp xếp:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sortList}>
              {[
                { id: 'popular', label: 'Phổ biến' },
                { id: 'price-asc', label: 'Giá tăng dần' },
                { id: 'price-desc', label: 'Giá giảm dần' },
                { id: 'rating', label: 'Đánh giá cao' },
              ].map((sort) => (
                <Pressable
                  key={sort.id}
                  style={[
                    styles.sortChip,
                    selectedSort === sort.id && styles.sortChipActive,
                  ]}
                  onPress={() => setSelectedSort(sort.id)}
                >
                  <Text
                    style={[
                      styles.sortText,
                      selectedSort === sort.id && styles.sortTextActive,
                    ]}
                  >
                    {sort.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tours List */}
        <View style={styles.toursSection}>
          <Text style={styles.sectionTitle}>
            Tất cả tours ({filteredTours.length})
          </Text>

          {filteredTours.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="boat-outline" size={64} color={ui.textSecondary} />
              <Text style={styles.emptyTitle}>Không tìm thấy tour</Text>
              <Text style={styles.emptyDesc}>
                {search ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có tour nào tại địa điểm này'}
              </Text>
            </View>
          ) : (
            <View style={styles.toursGrid}>
              {filteredTours.map((tour) => (
                <Pressable
                  key={tour._id}
                  style={styles.tourCard}
                  onPress={() => navigation.navigate('TourDetailScreen', { id: tour._id })}
                >
                  <Image
                    source={{
                      uri: tour?.thumbnail_url || tour?.images?.[0] || 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200'
                    }}
                    style={styles.tourImage}
                    resizeMode="cover"
                  />

                  {/* Discount Badge */}
                  {tour?.discount > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{tour.discount}%</Text>
                    </View>
                  )}

                  <View style={styles.tourContent}>
                    <Text style={styles.tourName} numberOfLines={2}>
                      {tour?.name || 'Tour Name'}
                    </Text>

                    <View style={styles.tourMeta}>
                      <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={14} color={ui.textSecondary} />
                        <Text style={styles.metaText}>{tour?.time || 'N/A'}</Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="car-outline" size={14} color={ui.textSecondary} />
                        <Text style={styles.metaText}>{tour?.vehicle || 'N/A'}</Text>
                      </View>
                    </View>

                    <View style={styles.tourFooter}>
                      <View>
                        {tour?.oldPrice?.adult && (
                          <Text style={styles.oldPrice}>
                            {formatPrice(tour.oldPrice.adult)}
                          </Text>
                        )}
                        <Text style={styles.newPrice}>
                          {formatPrice(tour?.newPrice?.adult || tour?.price?.adult || 0)}
                        </Text>
                      </View>

                      <View style={styles.ratingBox}>
                        <Ionicons name="star" size={14} color="#FFB800" />
                        <Text style={styles.ratingText}>{tour?.rating || '5.0'}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
          </>
        )}
      </ScrollView>

      <LoadingOverlay visible={refreshing} />
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
    danger: string;
  }
) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: ui.bg,
    },
    container: {
      paddingBottom: 20,
    },
    skeletonContent: {
      paddingHorizontal: appTheme.spacing.md,
      paddingTop: appTheme.spacing.md,
    },

    // Header
    header: {
      backgroundColor: ui.surface,
    },

    // Banner
    banner: {
      height: 220,
      position: 'relative',
      marginTop: appTheme.spacing.sm,
    },
    bannerImage: {
      width: '100%',
      height: '100%',
    },
    bannerOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: appTheme.spacing.md,
      backgroundColor: ui.overlay,
    },
    bannerTitle: {
      fontSize: appTheme.fontSize.xl,
      fontWeight: '800',
      color: '#f8fafc',
      marginBottom: 4,
    },
    bannerDesc: {
      fontSize: appTheme.fontSize.sm,
      color: '#e2e8f0',
      opacity: 0.95,
      lineHeight: 20,
      fontWeight: '600',
    },

    // Highlights
    highlightsContainer: {
      padding: appTheme.spacing.md,
      backgroundColor: ui.surface,
    },
    sectionTitle: {
      ...appTheme.typography.sectionTitle,
      color: ui.textPrimary,
      marginBottom: appTheme.spacing.sm,
    },
    highlightsList: {
      gap: appTheme.spacing.xs,
    },
    highlightItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: appTheme.spacing.sm,
    },
    highlightText: {
      flex: 1,
      fontSize: appTheme.fontSize.sm,
      color: ui.textPrimary,
      fontWeight: '600',
    },

    // Search
    searchBox: {
      marginHorizontal: appTheme.spacing.md,
      marginTop: appTheme.spacing.md,
      height: 52,
      borderRadius: appTheme.radius.lg,
      backgroundColor: ui.surface,
      paddingHorizontal: appTheme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: appTheme.spacing.sm,
      borderWidth: 1,
      borderColor: ui.border,
    },
    searchInput: {
      flex: 1,
      fontSize: appTheme.fontSize.md,
      color: ui.textPrimary,
      fontWeight: '600',
    },

    // Sort
    sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: appTheme.spacing.md,
      marginTop: appTheme.spacing.md,
      gap: appTheme.spacing.sm,
    },
    sortLabel: {
      fontSize: appTheme.fontSize.sm,
      fontWeight: '700',
      color: ui.textPrimary,
    },
    sortList: {
      flexDirection: 'row',
      gap: appTheme.spacing.sm,
      paddingRight: appTheme.spacing.md,
    },
    sortChip: {
      paddingHorizontal: appTheme.spacing.md,
      paddingVertical: appTheme.spacing.sm,
      borderRadius: appTheme.radius.md,
      backgroundColor: ui.surface,
      borderWidth: 1,
      borderColor: ui.border,
    },
    sortChipActive: {
      backgroundColor: ui.primary,
      borderColor: ui.primary,
    },
    sortText: {
      fontSize: appTheme.fontSize.sm,
      fontWeight: '700',
      color: ui.textPrimary,
    },
    sortTextActive: {
      color: ui.onPrimary,
    },

    // Tours
    toursSection: {
      paddingHorizontal: appTheme.spacing.md,
      marginTop: appTheme.spacing.lg,
    },
    toursGrid: {
      gap: appTheme.spacing.md,
      marginTop: appTheme.spacing.md,
    },
    tourCard: {
      backgroundColor: ui.surface,
      borderRadius: appTheme.radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: ui.border,
      ...appTheme.shadow.sm,
    },
    tourImage: {
      width: '100%',
      height: 200,
      backgroundColor: ui.mutedSurface,
    },
    discountBadge: {
      position: 'absolute',
      top: appTheme.spacing.sm,
      right: appTheme.spacing.sm,
      backgroundColor: ui.danger,
      paddingHorizontal: appTheme.spacing.sm,
      paddingVertical: 4,
      borderRadius: appTheme.radius.sm,
    },
    discountText: {
      color: '#ffffff',
      fontSize: appTheme.fontSize.xs,
      fontWeight: '800',
    },
    tourContent: {
      padding: appTheme.spacing.md,
    },
    tourName: {
      fontSize: appTheme.fontSize.md,
      fontWeight: '800',
      color: ui.textPrimary,
      marginBottom: appTheme.spacing.sm,
      lineHeight: 22,
    },
    tourMeta: {
      flexDirection: 'row',
      gap: appTheme.spacing.md,
      marginBottom: appTheme.spacing.sm,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: appTheme.fontSize.xs,
      color: ui.textSecondary,
      fontWeight: '600',
    },
    tourFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: appTheme.spacing.xs,
    },
    oldPrice: {
      fontSize: appTheme.fontSize.xs,
      color: ui.textSecondary,
      textDecorationLine: 'line-through',
      fontWeight: '600',
    },
    newPrice: {
      fontSize: appTheme.fontSize.md,
      fontWeight: '800',
      color: ui.primary,
    },
    ratingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: ui.mutedSurface,
      paddingHorizontal: appTheme.spacing.sm,
      paddingVertical: 4,
      borderRadius: appTheme.radius.sm,
      borderWidth: 1,
      borderColor: ui.border,
    },
    ratingText: {
      fontSize: appTheme.fontSize.xs,
      fontWeight: '700',
      color: ui.textPrimary,
    },

    // Empty State
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: appTheme.spacing.xl * 2,
    },
    emptyTitle: {
      fontSize: appTheme.fontSize.lg,
      fontWeight: '700',
      color: ui.textPrimary,
      marginTop: appTheme.spacing.md,
    },
    emptyDesc: {
      fontSize: appTheme.fontSize.sm,
      color: ui.textSecondary,
      marginTop: appTheme.spacing.xs,
      textAlign: 'center',
      paddingHorizontal: appTheme.spacing.xl,
      fontWeight: '600',
    },
  });
}
