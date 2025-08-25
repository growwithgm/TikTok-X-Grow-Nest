export interface PackingSlipItem {
  name: string
  sku: string
  sellerSku: string
  quantity: number
  weight?: number
  orderId: string
  imageUrl?: string
}

export interface PackingSlipCustomer {
  name: string
  address: string
  phone: string
  username?: string
}

export interface PackingSlipData {
  orderNumber: string
  customer: PackingSlipCustomer
  items: PackingSlipItem[]
  totalWeight?: number
}

export interface CSVProcessResult {
  success: boolean
  data: PackingSlipData[]
  error?: string
}

export interface SkuImage {
  sku: string
  imageUrl: string
}

export interface ColumnMapping {
  [fieldId: string]: string
}

export interface Template {
  name: string
  html: string
  css: string
  variables: string[]
  createdAt: string
  updatedAt: string
}

export interface PdfParams {
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  fonts: {
    header: {
      size: number
      style: string
    }
    subheader?: {
      size: number
      style: string
    }
    normal: {
      size: number
      style: string
    }
    table?: {
      header: {
        size: number
        style: string
      }
      content: {
        size: number
        style: string
      }
    }
  }
  spacing?: {
    lineHeight: number
    paragraphGap: number
    tableRowGap: number
  }
  colors?: {
    lines: {
      header: number[]
      content: number[]
    }
  }
}

export interface GrokAnalysisResult {
  suggestions: string[]
  optimizedParams?: PdfParams
  layoutIssues?: string[]
  improvements?: string[]
}

export interface GrokValidationResult {
  isValid: boolean
  issues: string[]
  suggestions: string[]
}

export interface GrokOptimizationResult {
  optimizedParams: PdfParams
  reasoning: string
  improvements: string[]
}
