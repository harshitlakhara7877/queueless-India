const { fetchHospitalsFromGoogle } = require('./googlePlacesService');
const { fetchHospitalsFromOSM } = require('./osmService');

// Service Pools for Unique Hospital Data
const SERVICE_POOLS = [
  ["OPD", "General", "Dermatology"],
  ["Emergency", "ICU", "Trauma"],
  ["Cardiology", "Heart Care", "Neurology"],
  ["Orthopedic", "Physiotherapy", "Sports Medicine"],
  ["Pediatrics", "Gynecology", "ENT"]
];

const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d670db',
  'https://images.unsplash.com/photo-1587350859728-117622bc937e',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514',
  'https://images.unsplash.com/photo-1586773860418-d319a39855df',
  'https://images.unsplash.com/photo-1538108176635-8b6fa352865c',
  'https://images.unsplash.com/photo-1512678080530-7760d81faba6',
  'https://images.unsplash.com/photo-1504813184591-01592fd03cf7',
  'https://images.unsplash.com/photo-1511174511562-5f7f185854c8'
];

function assignServices(index) {
  return SERVICE_POOLS[index % SERVICE_POOLS.length];
}

/**
 * Orchestrator Service
 * @param {string} city
 * @param {function} getQueueFn - Function to get queue by room key
 */
const getHospitalsByCity = async (city, getQueueFn) => {
  let rawHospitals = [];

  try {
    rawHospitals = await fetchHospitalsFromGoogle(city);
    if (rawHospitals.length < 5) {
      const osmResults = await fetchHospitalsFromOSM(city);
      rawHospitals = [...rawHospitals, ...osmResults];
    }
  } catch (error) {
    rawHospitals = await fetchHospitalsFromOSM(city);
  }

  if (rawHospitals.length < 10) {
    const additional = 10 - rawHospitals.length;
    for (let i = 0; i < additional; i++) {
      rawHospitals.push({
        id: `sim-${city}-${i}`,
        name: `${city} ${['MediCare', 'City Hospital', 'Health Center', 'Clinic'][i % 4]} ${i + 1}`,
        rating: (Math.random() * (4.9 - 4.2) + 4.2).toFixed(1),
        address: `Main Road, ${city}`
      });
    }
  }

  const avgTimePerPatient = 5;

  return rawHospitals.slice(0, 15).map((h, idx) => {
    const hospitalId = h.place_id || h.id;
    const services = assignServices(idx);
    
    const queueStatus = {};
    services.forEach(service => {
      const key = `${hospitalId}-${service}`;
      const queue = getQueueFn(key);
      const queueLength = queue.length;
      
      queueStatus[service] = {
        currentQueue: queueLength,
        estimatedWait: queueLength * avgTimePerPatient
      };
    });

    return {
      id: hospitalId,
      name: h.name,
      rating: h.rating || 4.2,
      location: h.formatted_address || h.address,
      image: `${MOCK_IMAGES[idx % MOCK_IMAGES.length]}?auto=format&fit=crop&q=80&w=800`,
      services: services,
      queueStatus: queueStatus
    };
  });
};

module.exports = { getHospitalsByCity };
