import { MongoClient } from "mongodb";

// Cached MongoClient promise. In dev, persist across hot reloads via globalThis
// so we don't open a new connection on every file change.

const uri = process.env.MONGODB_URI;
export const DB_NAME = process.env.MONGODB_DB ?? "procareerlaunchpad";
export const hasMongo = !!uri;

const g = globalThis as unknown as { _mongoClientPromise?: Promise<MongoClient> };

export function getMongoClient(): Promise<MongoClient> | null {
  if (!uri) return null;
  if (!g._mongoClientPromise) {
    const client = new MongoClient(uri);
    g._mongoClientPromise = client.connect();
  }
  return g._mongoClientPromise;
}
