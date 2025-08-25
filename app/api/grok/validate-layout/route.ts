import { NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

export async function POST(request: Request) {
  try {
    const { htmlContent } = await request.json()

    const { text } = await generateText({
      model: xai("grok"),
      prompt: `
You are a PDF layout validation expert. Analyze this HTML content that will be converted to PDF and identify any layout issues.
Focus on problems that might affect PDF rendering like improper nesting, overflow issues, or styling conflicts.

HTML content:
${htmlContent}

Provide your analysis as a JSON object with the following structure:
{
  "isValid": boolean,
  "issues": [array of strings describing issues],
  "fixedHtml": "corrected HTML if there are issues"
}

If no issues are found, set isValid to true and provide an empty issues array.
      `,
    })

    try {
      // Parse the response as JSON
      const parsedResponse = JSON.parse(text)
      return NextResponse.json({
        isValid: parsedResponse.isValid || false,
        issues: parsedResponse.issues || [],
        fixedHtml: parsedResponse.fixedHtml || undefined,
      })
    } catch (parseError) {
      console.error("Failed to parse Grok response:", parseError)
      return NextResponse.json(
        {
          isValid: false,
          issues: ["Failed to parse validation results. Please try again."],
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error validating PDF layout with Grok:", error)
    return NextResponse.json(
      {
        isValid: false,
        issues: ["Failed to validate PDF layout. Please try again."],
      },
      { status: 500 },
    )
  }
}
