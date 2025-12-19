// Google Maps Configuration
// Add your Google Maps API key here
// You can get one from: https://console.cloud.google.com/google/maps-apis
// Make sure to enable the Geocoding API for this key

// TODO: Replace with your actual Google Maps API key
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

export const geocodeAddress = async (address: string): Promise<{
  lat: number;
  lng: number;
  city: string;
  state: string;
  postalCode: string;
  formattedAddress: string;
} | null> => {
  try {
    const encodedAddress = encodeURIComponent(address + ', India');
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const { lat, lng } = result.geometry.location;

      // Extract address components
      const components = result.address_components || [];
      let city = '';
      let state = '';
      let postalCode = '';

      for (const component of components) {
        const types = component.types || [];
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_3') && !city) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        } else if (types.includes('postal_code')) {
          postalCode = component.long_name;
        }
      }

      return {
        lat,
        lng,
        city,
        state,
        postalCode,
        formattedAddress: result.formatted_address || '',
      };
    }

    console.error('Geocoding failed:', data.status, data.error_message);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

