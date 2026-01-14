import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Pressable,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import theme from '../../../../config/theme';
import { TourService } from '../../../../services/TourService';
import LoadingOverlay from '../../../Loading/LoadingOverlay';
import { MessageBoxService } from '../../../MessageBox/MessageBoxService';

const { width } = Dimensions.get('window');

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
      const tourRes = await TourService.getTours();
      const allTours = Array.isArray(tourRes) ? tourRes : tourRes?.data ?? [];
      
      // Filter tours theo city
      const cityTours = allTours.filter((tour: any) => 
        tour?.city === cityId || 
        tour?.cityId === cityId ||
        tour?.location === location
      );

      setCity(cityData);
      setTours(cityTours);
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
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {location || city?.name || 'Khám phá'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

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
                  <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
                  <Text style={styles.highlightText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchBox}>
          <Feather name="search" size={20} color={theme.colors.gray} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm kiếm tour..."
            placeholderTextColor={theme.colors.gray}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.gray} />
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
              <Ionicons name="boat-outline" size={64} color={theme.colors.gray} />
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
                        <Ionicons name="time-outline" size={14} color={theme.colors.gray} />
                        <Text style={styles.metaText}>{tour?.time || 'N/A'}</Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="car-outline" size={14} color={theme.colors.gray} />
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
      </ScrollView>

      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    paddingBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginHorizontal: theme.spacing.sm,
  },

  // Banner
  banner: {
    height: 220,
    position: 'relative',
    marginTop: theme.spacing.sm,
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
    padding: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bannerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.9,
    lineHeight: 20,
    fontWeight: '600',
  },

  // Highlights
  highlightsContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  highlightsList: {
    gap: theme.spacing.xs,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  highlightText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600',
  },

  // Search
  searchBox: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    height: 52,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '600',
  },

  // Sort
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sortLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sortList: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  sortChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sortText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sortTextActive: {
    color: theme.colors.white,
  },

  // Tours
  toursSection: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  toursGrid: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  tourCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tourImage: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.surface,
  },
  discountBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: '#DC2626',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  discountText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
  },
  tourContent: {
    padding: theme.spacing.md,
  },
  tourName: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  tourMeta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    fontWeight: '600',
  },
  tourFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  oldPrice: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  newPrice: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  ratingText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.text,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
    fontWeight: '600',
  },
});