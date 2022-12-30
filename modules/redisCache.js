// Load modules and constants
require('dotenv').config();
const redis = require('redis');

let redisOptions = {
  socket: {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
  },
};

// Only add this if external Redis will be used
/*
if (process.env.NODE_ENV === 'production') {
  redisOptions = {
    socket: {
      rejectUnauthorized: false,
      tls: true,
    },
  };
}
*/

const client = redis.createClient(redisOptions);

// function getCache - retrieves from cache
async function getCache(key) {
  client.on('error', (err) => {
    console.log('Error connecting to Redis Cache, please ensure system is up and running.');
    console.log(err);
  });

  await client.connect();
  const records = await client.get(key);
  await client.disconnect();

  return records;
}

// function getCache - sets records in cache with expiry
async function setCache(key, value, expiryTime) {
  client.on('error', (err) => {
    console.log('Error connecting to Redis Cache, please ensure system is up and running.');
    console.log(err);
  });

  await client.connect();

  // Stringify JSON items
  if (Array.isArray(value) || typeof value === 'object') {
    value = JSON.stringify(value); // eslint-disable-line no-param-reassign
  }

  await client.set(key, value, { EX: expiryTime });

  await client.disconnect();
}

module.exports = {
  getCache,
  setCache,
};
