const { getHospitalsByCity } = require('../services/hospitalService');
const { getQueue, saveToQueue } = require('../models/queueStore');

const getHospitals = async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'City is required' });

  try {
    // Pass a getter for the persistent queue
    const hospitals = await getHospitalsByCity(city, (room) => getQueue(room));
    res.json({ city, hospitals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
};

const bookToken = async (req, res) => {
  const { hospitalId, hospitalName, service, location } = req.body;
  
  if (!hospitalId || !service) {
    return res.status(400).json({ error: 'Hospital and Service are required' });
  }

  const room = `${hospitalId}-${service}`;
  const queue = getQueue(room);
  const avgTimePerPatient = 5;

  // Persistence Check: If empty for demo, seed it (just like before)
  if (queue.length === 0) {
    const seedSize = Math.floor(Math.random() * 8) + 3;
    for (let i = 0; i < seedSize; i++) {
      saveToQueue(room, {
        id: `seed-${hospitalId}-${i}`,
        tokenNumber: i + 1,
        status: 'waiting'
      });
    }
  }

  const updatedQueue = getQueue(room);
  const tokenNumber = updatedQueue.length + 1;

  const token = {
    id: `t-${Date.now()}`,
    tokenNumber,
    hospitalId,
    hospitalName,
    service,
    location,
    createdAt: Date.now(),
    status: 'waiting'
  };

  saveToQueue(room, token);
  
  const tokensAhead = updatedQueue.length;
  const estimatedWaitTime = tokensAhead * avgTimePerPatient;

  res.json({
    ...token,
    tokensAhead,
    estimatedWaitTime
  });
};

const getQueueStatus = async (req, res) => {
  const { hospitalId, service } = req.query;
  const room = `${hospitalId}-${service}`;
  const queue = getQueue(room);
  res.json({
    currentQueue: queue.length,
    estimatedWait: queue.length * 5
  });
};

module.exports = { getHospitals, bookToken, getQueueStatus };
