import type { vercelKv } from "@vercel/kv"

// Check if Vercel KV environment variables are available
const isKVAvailable =
  typeof process !== "undefined" && process.env && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN

// Create a localStorage fallback implementation
const localStorageKV = {
  // Get a value from localStorage\
  get: async <T>(key: string): Promise<T | null> => {
    if (typeof window === 'undefined') return null;
try {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) as T : null;
} catch (error) {
  console.error(`Error getting ${key} from localStorage:`, error)
  return null;
}
},
  
  // Set a value in localStorage
  set: async (key: string, value: any): Promise<string> =>
{
  if (typeof window === "undefined") return 'OK';
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return 'OK';
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error)
    return 'ERROR';
  }
}
,
  
  // Delete a value from localStorage
  del: async (key: string): Promise<number> =>
{
  if (typeof window === "undefined") return 0;
  try {
    localStorage.removeItem(key)
    return 1;
  } catch (error) {
    console.error(`Error deleting ${key} from localStorage:`, error)
    return 0;
  }
}
,
  
  // Add values to a set in localStorage
  sadd: async (key: string, ...members: string[]): Promise<number> =>
{
  if (typeof window === "undefined") return 0;
  try {
    const existingSet = localStorage.getItem(key)
    const set = existingSet ? new Set(JSON.parse(existingSet)) : new Set()
    let added = 0

    members.forEach((member) => {
      if (!set.has(member)) {
        set.add(member)
        added++
      }
    })

    localStorage.setItem(key, JSON.stringify(Array.from(set)))
    return added;
  } catch (error) {
    console.error(`Error adding to set ${key} in localStorage:`, error)
    return 0;
  }
}
,
  
  // Remove values from a set in localStorage
  srem: async (key: string, ...members: string[]): Promise<number> =>
{
  if (typeof window === "undefined") return 0;
  try {
    const existingSet = localStorage.getItem(key)
    if (!existingSet) return 0;

    const set = new Set(JSON.parse(existingSet))
    let removed = 0

    members.forEach((member) => {
      if (set.has(member)) {
        set.delete(member)
        removed++
      }
    })

    localStorage.setItem(key, JSON.stringify(Array.from(set)))
    return removed;
  } catch (error) {
    console.error(`Error removing from set ${key} in localStorage:`, error)
    return 0;
  }
}
,
  
  // Get all members of a set from localStorage
  smembers: async <T>(key: string): Promise<T[]> =>
{
  if (typeof window === "undefined") return [];
  try {
    const existingSet = localStorage.getItem(key)
    return existingSet ? JSON.parse(existingSet) as T[] : [];
  } catch (error) {
    console.error(`Error getting members of set ${key} from localStorage:`, error)
    return [];
  }
}
}

// Use Vercel KV if available, otherwise use localStorage fallback
let kv: typeof localStorageKV | typeof vercelKv

if (isKVAvailable) {
  // Only import @vercel/kv if the environment variables are available
  import("@vercel/kv")
    .then((module) => {
      kv = module.kv
      console.log("Using Vercel KV for storage")
    })
    .catch((error) => {
      kv = localStorageKV
      console.log("Falling back to localStorage for storage")
    })
} else {
  kv = localStorageKV
  console.log("Vercel KV environment variables not found, using localStorage for storage")
}

export { kv }

