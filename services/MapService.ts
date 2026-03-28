import AsyncStorage from "@react-native-async-storage/async-storage";
import googleMapsConfig from "../config/googleMaps";

export type GeocodeResult = {
  latitude: number;
  longitude: number;
};

const GEOCODE_CACHE_PREFIX = "tour_geocode_cache:";

const CITY_COORDINATES_FALLBACK: Record<string, GeocodeResult> = {
  "hồ chí minh": { latitude: 10.8231, longitude: 106.6297 },
  "ho chi minh": { latitude: 10.8231, longitude: 106.6297 },
  "tphcm": { latitude: 10.8231, longitude: 106.6297 },
  "hà nội": { latitude: 21.0285, longitude: 105.8542 },
  "ha noi": { latitude: 21.0285, longitude: 105.8542 },
  "đà nẵng": { latitude: 16.0544, longitude: 108.2022 },
  "da nang": { latitude: 16.0544, longitude: 108.2022 },
  "nha trang": { latitude: 12.2388, longitude: 109.1967 },
  "đà lạt": { latitude: 11.9404, longitude: 108.4583 },
  "da lat": { latitude: 11.9404, longitude: 108.4583 },
  "phú quốc": { latitude: 10.2191, longitude: 103.9651 },
  "phu quoc": { latitude: 10.2191, longitude: 103.9651 },
  "vũng tàu": { latitude: 10.346, longitude: 107.0843 },
  "vung tau": { latitude: 10.346, longitude: 107.0843 },
  "hội an": { latitude: 15.8801, longitude: 108.338 },
  "hoi an": { latitude: 15.8801, longitude: 108.338 },
  "huế": { latitude: 16.4637, longitude: 107.5909 },
  "hue": { latitude: 16.4637, longitude: 107.5909 },
  "cần thơ": { latitude: 10.0371, longitude: 105.7882 },
  "can tho": { latitude: 10.0371, longitude: 105.7882 },
  "phan thiết": { latitude: 10.9271, longitude: 108.1017 },
  "phan thiet": { latitude: 10.9271, longitude: 108.1017 },
  "hạ long": { latitude: 20.9505, longitude: 107.0733 },
  "ha long": { latitude: 20.9505, longitude: 107.0733 },
  "sapa": { latitude: 22.3364, longitude: 103.8438 },
  "sa pa": { latitude: 22.3364, longitude: 103.8438 },
};

const toCacheKey = (city: string, country?: string) =>
  `${GEOCODE_CACHE_PREFIX}${city.trim().toLowerCase()}|${(country ?? "").trim().toLowerCase()}`;

export class MapService {
  static getGeocode = async (city: string, country?: string): Promise<GeocodeResult | null> => {
    const trimmedCity = city?.trim();
    if (!trimmedCity) return null;

    const cacheKey = toCacheKey(trimmedCity, country);
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (
          typeof parsed?.latitude === "number" &&
          typeof parsed?.longitude === "number"
        ) {
          return parsed;
        }
      } catch {
      }
    }

    // 1. Try hardcoded fallback first (for common cities)
    const normalizedCity = trimmedCity.toLowerCase();
    if (CITY_COORDINATES_FALLBACK[normalizedCity]) {
      return CITY_COORDINATES_FALLBACK[normalizedCity];
    }

    // 2. Fallback to API if key is present
    if (!googleMapsConfig.geocodingApiKey) {
      console.warn(`Geocoding failed for "${trimmedCity}": Missing EXPO_PUBLIC_GOOGLE_GEOCODING_API_KEY and no hardcoded fallback.`);
      return null;
    }

    const query = [trimmedCity, country?.trim()].filter(Boolean).join(", ");
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}` +
      `&key=${googleMapsConfig.geocodingApiKey}`;

    const response = await fetch(url);
    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status !== "OK" || !Array.isArray(data?.results) || !data.results[0]) {
      console.warn("Geocode failed:", trimmedCity, country, data?.status ?? response.status);
      return null;
    }

    const location = data.results[0]?.geometry?.location;
    if (
      typeof location?.lat !== "number" ||
      typeof location?.lng !== "number"
    ) {
      return null;
    }

    const result = {
      latitude: location.lat,
      longitude: location.lng,
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  };
}
