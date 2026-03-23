import { NextRequest, NextResponse } from "next/server"

// DEPRECATED: This route is no longer used. The frontend now communicates directly with the DUB5 AI service.
// This file is kept as a placeholder to prevent 404s if any old clients are still trying to access it,
// but it will return an error to indicate migration is required.

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Deprecated: Please use DUB5 AI Service directly (chatbot-beta-weld.vercel.app)" },
    { status: 410 } // 410 Gone
  )
}
