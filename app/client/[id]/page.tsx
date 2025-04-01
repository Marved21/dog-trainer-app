"use client"

import { useState, useEffect } from "react"
import DeleteClientButton from "../../components/DeleteClientButton"
import EditClientForm from "../../components/EditClientForm"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Client = {
  id: string
  clientName: string
  petName: string
  petBreed: string
  address: string
  sessionCount: number
}

export default function ClientPage({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<Client | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchClient = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/clients/${params.id}?t=${new Date().getTime()}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("Client not found")
          } else {
            setError("Failed to load client data")
          }
          return
        }

        const data = await response.json()
        setClient(data)
      } catch (error) {
        console.error("Error fetching client:", error)
        setError("An error occurred while loading client data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClient()

    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchClient, 30000)

    // Clean up the interval
    return () => clearInterval(intervalId)
  }, [params.id])

  const handleSaveEdit = async (updatedClient: Client) => {
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedClient),
      })

      if (!response.ok) {
        throw new Error("Failed to update client")
      }

      const data = await response.json()
      setClient(data)
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating client:", error)
      alert("Failed to update client. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500 animate-pulse">Loading...</div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[200px] space-y-4">
        <div className="text-red-500">{error || "Client not found"}</div>
        <Link href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Client Information</h3>
      </div>
      {isEditing ? (
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <EditClientForm client={client} onSave={handleSaveEdit} onCancel={() => setIsEditing(false)} />
        </div>
      ) : (
        <>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Client Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.clientName}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Pet Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.petName}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Pet Breed</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.petBreed}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.address}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Number of Sessions</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.sessionCount}</dd>
              </div>
            </dl>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Client
            </button>
            <DeleteClientButton clientId={client.id} />
          </div>
        </>
      )}
    </div>
  )
}

