"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeleteClientButton({ clientId }: { clientId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this client?")) {
      setIsDeleting(true)

      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          router.push("/")
          router.refresh()
        } else {
          throw new Error("Failed to delete client")
        }
      } catch (error) {
        console.error("Error deleting client:", error)
        alert("Failed to delete client. Please try again.")
        setIsDeleting(false)
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete Client"}
    </button>
  )
}

