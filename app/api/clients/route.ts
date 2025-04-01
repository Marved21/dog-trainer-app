import { NextResponse } from "next/server"
import { addClient, getClients } from "../../lib/clients"

export async function GET() {
  const clients = await getClients()
  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  const data = await request.json()
  const newClient = await addClient(data)
  return NextResponse.json(newClient, { status: 201 })
}

