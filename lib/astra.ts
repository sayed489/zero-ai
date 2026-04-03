import { DataAPIClient } from "@datastax/astra-db-ts"

/**
 * DataStax Astra DB Client — Unified Vector Memory Store
 * Replaces Supabase for ultra-scalable, low-latency persistent memory.
 */

const client = new DataAPIClient(process.env.ASTRA_DB_TOKEN!)
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT!)

// Use the defined collection for user fact storage
export const astraMemories = db.collection(process.env.ASTRA_DB_COLLECTION || "user_memories")

/**
 * Initialize Astra DB collection if needed.
 * Note: Vector dimension 768 matches Gemini text-embedding-004.
 */
export async function initAstra() {
  try {
    await db.createCollection(process.env.ASTRA_DB_COLLECTION || "user_memories", {
      vector: {
        dimension: 768,
        metric: "cosine",
      },
    })
    console.log("[AstraDB] Memories collection initialized")
  } catch (err) {
    console.error("[AstraDB] Initialization error:", err)
  }
}
