"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Minus, Trash2, Edit2 } from "lucide-react"

type Client = {
  id: string
  clientName: string
  petName: string
  petBreed: string
  address: string
  sessionCount: number
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([])
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchClients()

    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchClients, 30000)

    // Clean up the interval
    return () => clearInterval(intervalId)
  }, [])

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/clients?t=" + new Date().getTime())
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSessionCount = async (clientId: string, increment: number) => {
    setIsUpdating((prev) => ({ ...prev, [clientId]: true }))

    try {
      const response = await fetch(`/api/clients/${clientId}/sessions`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ increment }),
      })

      if (response.ok) {
        const updatedClient = await response.json()
        setClients((prevClients) =>
          prevClients.map((client) =>
            client.id === clientId ? { ...client, sessionCount: updatedClient.sessionCount } : client,
          ),
        )
      } else {
        console.error("Failed to update session count")
      }
    } catch (error) {
      console.error("Error updating session count:", error)
    } finally {
      setIsUpdating((prev) => ({ ...prev, [clientId]: false }))
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return
    }

    setIsDeleting((prev) => ({ ...prev, [clientId]: true }))

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setClients((prevClients) => prevClients.filter((client) => client.id !== clientId))
      } else {
        console.error("Failed to delete client")
        alert("Failed to delete client. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting client:", error)
      alert("An error occurred while deleting the client.")
    } finally {
      setIsDeleting((prev) => ({ ...prev, [clientId]: false }))
    }
  }

  if (isLoading && clients.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
        <div className="animate-pulse text-gray-500">Loading clients...</div>
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
        <p className="text-gray-500">No clients found. Add your first client above.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {clients.map((client) => (
          <li key={client.id} className="hover:bg-gray-50">
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <Link href={`/client/${client.id}`} className="block">
                    <p className="text-sm font-bold text-indigo-600 mb-1">Client: {client.clientName}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Pet Name:</span> {client.petName}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Pet Breed:</span> {client.petBreed}
                      </p>
                    </div>
                  </Link>
                </div>
                <div className="ml-4 flex flex-col items-center">
                  <p className="text-xs text-gray-500 mb-1">Sessions Completed</p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateSessionCount(client.id, -1)}
                      disabled={client.sessionCount <= 0 || isUpdating[client.id]}
                      className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                      aria-label="Decrease session count"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {isUpdating[client.id] ? "..." : client.sessionCount}
                    </span>
                    <button
                      onClick={() => updateSessionCount(client.id, 1)}
                      disabled={isUpdating[client.id]}
                      className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                      aria-label="Increase session count"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  <Link
                    href={`/client/${client.id}`}
                    className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                    aria-label="Edit client"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    disabled={isDeleting[client.id]}
                    className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                    aria-label="Delete client"
                  >
                    {isDeleting[client.id] ? <span className="animate-pulse">...</span> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

