import { NextResponse } from "next/server"
import { getClient, updateClient, deleteClient } from "../../../lib/clients"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const client = await getClient(id)

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 })
  }

  return NextResponse.json(client)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const data = await request.json()

  try {
    const updatedClient = await updateClient(id, data)
    return NextResponse.json(updatedClient)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update client" }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    await deleteClient(id)
    return NextResponse.json({ message: "Client deleted successfully" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete client" }, { status: 400 })
  }
}

