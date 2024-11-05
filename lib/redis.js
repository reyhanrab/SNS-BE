import { createClient } from "@redis/client"; // Make sure you're using the correct Redis client import

const redisClient = createClient({
  url: "redis://127.0.0.1:6379", // Specify URL for Redis server connection
});

export const redisConnect = async () => {
  // Listen for errors
  redisClient.on("error", (err) => {
    console.error("Redis error:", err);
  });

  // Listen for successful connection
  redisClient.on("connect", () => {
    console.log("Connected to Redis");
  });

  try {
    // Connecting to Redis
    await redisClient.connect();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
};

const getApiV1Path = (url) => {
  const basePath = "/api/v1";

  // Ensure the URL starts with '/api/v1'
  if (url.startsWith(basePath)) {
    // Remove '/api/v1' from the start of the URL
    let path = url.slice(basePath.length);

    // Remove any query parameters by splitting at the first occurrence of '?'
    path = path.split("?")[0];

    // Take the first segment after '/api/v1'
    const firstSegment = path.split("/")[1]; // Get the first segment after '/v1'

    // Return the full path with '/api/v1' and the first segment
    return `/${firstSegment}`;
  }

  return url; // If the URL doesn't start with '/api/v1', return it as is
};

// Middleware to check for data in Redis
export const sendDataFromRedis = async (req, res, next) => {
  const key = getApiV1Path(req.originalUrl); // Using the URL as the key for caching
  try {
    const data = await redisClient.get(key); // Use async/await to fetch data
    if (data) {
      return res.json(JSON.parse(data)); // If cache exists, return it
    }
    next(); // If no cache, continue to the route handler
  } catch (err) {
    console.error("Redis get error:", err);
    next(); // Proceed to the next middleware if Redis operation fails
  }
};

// Middleware to save data to Redis
export const saveDataToRedis = (duration = 10800) => {
  return async (req, res, next) => {
    const originalJson = res.json; // Save the original response method

    // Override res.json to cache the response in Redis
    res.json = async (body) => {
      try {
        await redisClient.setEx(req.originalUrl, duration, JSON.stringify(body)); // Cache the response for the specified duration
        originalJson.call(res, body); // Send the response
      } catch (err) {
        console.error("Redis set error:", err);
        originalJson.call(res, body); // Send response even if caching fails
      }
    };
    next(); // Proceed to the next middleware or controller
  };
};

export const clearRedixCache = (cacheKey) => {
  return async (req, res, next) => {
    try {
      // Delete the cache for the specified key
      await redisClient.del(cacheKey);

      console.log(`Cache for ${cacheKey} cleared successfully.`);

      // Proceed to the next middleware or route handler
      next();
    } catch (err) {
      console.error("Error clearing cache:", err);
      next(); // Proceed even if the cache deletion fails
    }
  };
};
