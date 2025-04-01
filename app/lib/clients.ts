import { kv } from "./db"

type Client = {
  id: string
  clientName: string
  petName: string
  petBreed: string
  address: string
  sessionCount: number
}

// Key for storing the client list
const CLIENTS_KEY = "dogTrainer:clients"

// Get all clients from storage
export async function getClients(): Promise<Client[]> {
  try {
    // Get the client IDs list
    const clientIds = (await kv.smembers<string>(CLIENTS_KEY)) || []

    if (clientIds.length === 0) {
      return []
    }

    // Get each client by ID
    const clients: Client[] = []

    for (const id of clientIds) {
      const client = await kv.get<Client>(`dogTrainer:client:${id}`)
      if (client) {
        clients.push(client)
      }
    }

    return clients
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
}

// Get a single client by ID
export async function getClient(id: string): Promise<Client | undefined> {
  try {
    const client = await kv.get<Client>(`dogTrainer:client:${id}`)
    return client || undefined
  } catch (error) {
    console.error(`Error fetching client ${id}:`, error)
    return undefined
  }
}

// Add a new client
export async function addClient(data: Omit<Client, "id">): Promise<Client> {
  const id = Date.now().toString()
  const newClient = {
    ...data,
    id,
    sessionCount: Math.max(0, Number(data.sessionCount) || 0),
  }

  try {
    // Store the client data
    await kv.set(`dogTrainer:client:${id}`, newClient)

    // Add the client ID to the set of all clients
    await kv.sadd(CLIENTS_KEY, id)

    return newClient
  } catch (error) {
    console.error("Error adding client:", error)
    throw new Error("Failed to add client to storage")
  }
}

// Update an existing client
export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  try {
    const existingClient = await kv.get<Client>(`dogTrainer:client:${id}`)

    if (!existingClient) {
      throw new Error("Client not found")
    }

    const updatedClient = { ...existingClient, ...data }

    // Update the client data
    await kv.set(`dogTrainer:client:${id}`, updatedClient)

    return updatedClient
  } catch (error) {
    console.error(`Error updating client ${id}:`, error)
    throw new Error("Failed to update client in storage")
  }
}

// Delete a client
export async function deleteClient(id: string): Promise<void> {
  try {
    // Remove the client data
    await kv.del(`dogTrainer:client:${id}`)

    // Remove the client ID from the set of all clients
    await kv.srem(CLIENTS_KEY, id)
  } catch (error) {
    console.error(`Error deleting client ${id}:`, error)
    throw new Error("Failed to delete client from storage")
  }
}

// Update a client's session count
export async function updateClientSessionCount(id: string, increment: number): Promise<Client> {
  try {
    const client = await kv.get<Client>(`dogTrainer:client:${id}`)

    if (!client) {
      throw new Error("Client not found")
    }

    const updatedClient = {
      ...client,
      sessionCount: Math.max(0, client.sessionCount + increment),
    }

    // Update the client data
    await kv.set(`dogTrainer:client:${id}`, updatedClient)

    return updatedClient
  } catch (error) {
    console.error(`Error updating session count for client ${id}:`, error)
    throw new Error("Failed to update session count in storage")
  }
}

