// MongoDB Utility
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

if (!dbName) {
  throw new Error("Missing DB_NAME in environment variables");
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  try {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });

    global._mongoClientPromise = client.connect();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}

clientPromise = global._mongoClientPromise;

export async function getDatabase() {
  const client = await clientPromise;
  return client.db(dbName);
}
