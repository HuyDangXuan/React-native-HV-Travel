const googleMapsConfig = {
  geocodingApiKey: process.env.EXPO_PUBLIC_GOOGLE_GEOCODING_API_KEY ?? "",
  mapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
};

export const hasGoogleGeocodingKey = Boolean(googleMapsConfig.geocodingApiKey);
export const hasGoogleMapsKey = Boolean(googleMapsConfig.mapsApiKey);

export default googleMapsConfig;
