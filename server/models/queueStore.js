const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../queueDB.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

const getQueue = (room) => {
  const db = readDB();
  return db[room] || [];
};

const saveToQueue = (room, token) => {
  const db = readDB();
  if (!db[room]) db[room] = [];
  db[room].push(token);
  writeDB(db);
};

const shiftQueue = (room) => {
  const db = readDB();
  if (db[room] && db[room].length > 0) {
    db[room].shift();
    writeDB(db);
    return true;
  }
  return false;
};

const getAllRooms = () => {
  const db = readDB();
  return Object.keys(db);
};

module.exports = { getQueue, saveToQueue, shiftQueue, getAllRooms };
