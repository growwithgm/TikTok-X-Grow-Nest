import { NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

export async function POST(request: Request) {
  try {
    const { currentParams } = await request.json()

    const { text } = await generateText({
      model: xai("grok"),
      prompt: `
You are a jsPDF expert. Analyze these PDF generation parameters and suggest optimizations for better output quality.
Focus on improving margins, font sizes, spacing, and overall layout.

Current parameters:
${JSON.stringify(currentParams, null, 2)}

Provide your response as a JSON object with the following structure:
{
  "optimizedParams": { /* optimized parameters */ },
  "improvements": [array of strings describing improvements]
}
      `,
    })

    try {
      // Parse the response as JSON
      const parsedResponse = JSON.parse(text)
      return NextResponse.json({
        optimizedParams: parsedResponse.optimizedParams || currentParams,
        improvements: parsedResponse.improvements || [],
      })
    } catch (parseError) {
      console.error("Failed to parse Grok response:", parseError)
      return NextResponse.json(
        {
          optimizedParams: currentParams,
          improvements: ["Failed to parse optimization results. Using original parameters."],
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error optimizing PDF parameters with Grok:", error)
    return NextResponse.json(
      {
        optimizedParams: currentParams,
        improvements: ["Failed to optimize PDF parameters. Using original parameters."],
      },
      { status: 500 },
    )
  }
}
