import { NextResponse } from "next/server"
import { updateClientSessionCount } from "../../../../lib/clients"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { increment } = await request.json()

  if (increment !== 1 && increment !== -1) {
    return NextResponse.json({ error: "Invalid increment value" }, { status: 400 })
  }

  try {
    const updatedClient = await updateClientSessionCount(id, increment)
    return NextResponse.json(updatedClient)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update session count" }, { status: 400 })
  }
}

