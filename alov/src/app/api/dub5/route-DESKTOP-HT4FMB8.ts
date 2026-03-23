import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Forward the body exactly as received from DUB5AIService
    console.log("[Proxy] Forwarding request to DUB5 API:", JSON.stringify(body, null, 2));
    
    const response = await fetch("https://chatbot-beta-weld.vercel.app/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Proxy] DUB5 API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      // Try to parse the error as JSON to give a cleaner message
      let displayError = errorText || response.statusText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) displayError = errorJson.error;
        else if (errorJson.message) displayError = errorJson.message;
      } catch (e) {
        // Not JSON, use raw text
      }

      return NextResponse.json(
        { error: `DUB5 API Error (${response.status}): ${displayError}` },
        { status: response.status }
      );
    }

    // Return the stream directly
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("DUB5 Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
