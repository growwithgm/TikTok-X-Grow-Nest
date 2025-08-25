import { NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

export async function POST(request: Request) {
  try {
    const { packingSlipData } = await request.json()

    const { text } = await generateText({
      model: xai("grok"),
      prompt: `
You are a PDF layout optimization expert. Analyze this packing slip data structure and suggest improvements for PDF generation.
Focus on layout, spacing, text wrapping, and overall professional appearance.

Current packing slip data:
${JSON.stringify(packingSlipData, null, 2)}

Provide specific suggestions to improve the PDF output. Format your response as a JSON array of strings for suggestions,
followed by an optimized version of the data structure if needed.
Example format:
{
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "optimizedData": { /* optimized data structure */ }
}
      `,
    })

    try {
      // Parse the response as JSON
      const parsedResponse = JSON.parse(text)
      return NextResponse.json({
        suggestions: parsedResponse.suggestions || [],
        optimizedData: parsedResponse.optimizedData || undefined,
      })
    } catch (parseError) {
      // If parsing fails, extract suggestions manually
      const suggestions = text
        .split("\n")
        .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("*"))
        .map((line) => line.trim().replace(/^[-*]\s+/, ""))

      return NextResponse.json({ suggestions })
    }
  } catch (error) {
    console.error("Error analyzing PDF structure with Grok:", error)
    return NextResponse.json({ error: "Failed to analyze PDF structure. Please try again." }, { status: 500 })
  }
}
