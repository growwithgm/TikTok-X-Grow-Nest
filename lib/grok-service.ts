import type { PackingSlipData } from "./types"

// Function to analyze PDF structure and suggest improvements
export async function analyzePdfStructure(packingSlipData: PackingSlipData): Promise<{
  suggestions: string[]
  optimizedData?: PackingSlipData
}> {
  try {
    const response = await fetch("/api/grok/analyze-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ packingSlipData }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()
    return {
      suggestions: result.suggestions || [],
      optimizedData: result.optimizedData,
    }
  } catch (error) {
    console.error("Error analyzing PDF structure with Grok:", error)
    return { suggestions: ["Failed to analyze PDF structure. Please try again."] }
  }
}

// Function to validate and fix PDF layout issues
export async function validatePdfLayout(htmlContent: string): Promise<{
  isValid: boolean
  issues: string[]
  fixedHtml?: string
}> {
  try {
    const response = await fetch("/api/grok/validate-layout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ htmlContent }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()
    return {
      isValid: result.isValid || false,
      issues: result.issues || [],
      fixedHtml: result.fixedHtml,
    }
  } catch (error) {
    console.error("Error validating PDF layout with Grok:", error)
    return {
      isValid: false,
      issues: ["Failed to validate PDF layout. Please try again."],
    }
  }
}

// Function to optimize PDF generation parameters
export async function optimizePdfParams(currentParams: any): Promise<{
  optimizedParams: any
  improvements: string[]
}> {
  try {
    const response = await fetch("/api/grok/optimize-params", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentParams }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()
    return {
      optimizedParams: result.optimizedParams || currentParams,
      improvements: result.improvements || [],
    }
  } catch (error) {
    console.error("Error optimizing PDF parameters with Grok:", error)
    return {
      optimizedParams: currentParams,
      improvements: ["Failed to optimize PDF parameters. Using original parameters."],
    }
  }
}
