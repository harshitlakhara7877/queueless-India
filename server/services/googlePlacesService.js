const axios = require('axios');

/**
 * Service to fetch hospitals from Google Places API
 * (Simulated for this implementation, but structured for real API usage)
 */
const fetchHospitalsFromGoogle = async (city) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Places API key missing. Using simulated data for Step 1.');
    // Simulated Google Places Data
    return [
      {
        place_id: `g1-${city}`,
        name: `Apollo Super Speciality ${city}`,
        rating: 4.8,
        user_ratings_total: 1250,
        formatted_address: `Outer Ring Rd, ${city}`,
        photos: [{ photo_reference: 'mock_photo_1' }],
        geometry: { location: { lat: 28.6139, lng: 77.2090 } }
      },
      {
        place_id: `g2-${city}`,
        name: `Fortis Memorial ${city}`,
        rating: 4.6,
        user_ratings_total: 890,
        formatted_address: `Sector 44, ${city}`,
        photos: [{ photo_reference: 'mock_photo_2' }],
        geometry: { location: { lat: 28.4595, lng: 77.0266 } }
      }
    ];
  }

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
      params: {
        query: `hospitals in ${city}`,
        key: apiKey
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Google Places API Error:', error.message);
    throw error;
  }
};

module.exports = { fetchHospitalsFromGoogle };
