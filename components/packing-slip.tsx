"use client"

import type { PackingSlipData } from "@/lib/types"
import { AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface PackingSlipProps {
  data: PackingSlipData
}

export function PackingSlip({ data }: PackingSlipProps) {
  const [customLogo, setCustomLogo] = useState<string | null>(null)
  const [logoDimensions, setLogoDimensions] = useState({ width: 353, height: 65 })

  useEffect(() => {
    // Load custom logo from localStorage
    const storedLogo = localStorage.getItem("customLogo")
    if (storedLogo) {
      setCustomLogo(storedLogo)
    }

    // Load logo dimensions from localStorage
    const storedDimensions = localStorage.getItem("logoDimensions")
    if (storedDimensions) {
      try {
        const dimensions = JSON.parse(storedDimensions)
        if (dimensions.width && dimensions.height) {
          setLogoDimensions(dimensions)
        }
      } catch (error) {
        console.error("Failed to parse logo dimensions:", error)
      }
    }
  }, [])

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Calculate totals
  const totalItems = data.items.reduce((total, item) => total + item.quantity, 0)
  const totalWeight =
    data.totalWeight || data.items.reduce((total, item) => total + (item.weight || 0) * item.quantity, 0)
  const uniqueOrderIds = new Set(data.items.map((item) => item.orderId).filter(Boolean))
  const orderCount = uniqueOrderIds.size || 1 // Ensure at least 1 if no order IDs are present

  // Format address for display with improved formatting
  const formatAddress = (address: string) => {
    // Parse address into components
    const parts = address
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)

    if (parts.length === 0) return null

    // Remove duplicate house number (assuming first part might be duplicated)
    const uniqueParts = []
    const seen = new Set()

    for (const part of parts) {
      if (!seen.has(part.toLowerCase())) {
        seen.add(part.toLowerCase())
        uniqueParts.push(part)
      }
    }

    // Format address according to the specified format
    // Line 1: Address Line 1 and Address Line 2
    // Line 2: City, Postal Code, State

    let addressLine1 = ""
    let addressLine2 = ""

    if (uniqueParts.length <= 2) {
      addressLine1 = uniqueParts.join(", ")
    } else if (uniqueParts.length === 3) {
      addressLine1 = uniqueParts[0]
      addressLine2 = `${uniqueParts[1]}, ${uniqueParts[2]}`
    } else {
      // For addresses with more parts
      const midPoint = Math.ceil(uniqueParts.length / 2)
      addressLine1 = uniqueParts.slice(0, midPoint).join(", ")
      addressLine2 = uniqueParts.slice(midPoint).join(", ")
    }

    return (
      <>
        <p className="text-sm leading-tight">{addressLine1}</p>
        <p className="text-sm leading-tight">{addressLine2}</p>
      </>
    )
  }

  // Format SKU and Seller SKU for better display
  const formatSku = (sku: string) => {
    if (!sku || sku.length <= 10) return sku

    // For longer SKUs, split into multiple lines if they contain separators
    if (sku.includes("-") || sku.includes("/") || sku.includes("_")) {
      return sku.replace(/[-/_]/g, "$&\n")
    }

    // Otherwise, add a line break in the middle
    const midPoint = Math.ceil(sku.length / 2)
    return `${sku.substring(0, midPoint)}\n${sku.substring(midPoint)}`
  }

  // Safe image component that handles errors
  const SafeImage = ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => {
    const [error, setError] = useState(false)

    if (!src)
      return (
        <div className="h-full w-full bg-gray-100 rounded flex items-center justify-center">
          <span className="text-gray-400 text-xs">No image</span>
        </div>
      )

    return error ? (
      <div className="h-full w-full bg-gray-100 rounded flex items-center justify-center">
        <AlertCircle className="h-4 w-4 text-gray-400" />
      </div>
    ) : (
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className="h-full w-full object-contain"
        onError={() => setError(true)}
      />
    )
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden print:shadow-none print:border-none print:rounded-none print:w-[210mm] print:h-[297mm] print:mx-auto p-6 max-w-[210mm] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">PACKING SLIP</h1>
          <p className="text-base font-medium mt-2">ORDER #{data.orderNumber}</p>
          <p className="text-base mt-1">DATE: {currentDate}</p>
        </div>
        <div className="text-right">
          <p className="text-base font-medium mb-1">{data.customer.name}</p>
          <div className="leading-tight mb-1">{formatAddress(data.customer.address)}</div>
          <p className="text-sm mt-2">{data.customer.phone}</p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="flex justify-start space-x-8 mb-3">
        <div>
          <span className="text-sm font-medium">Order quantity: {orderCount}</span>
        </div>
        <div>
          <span className="text-sm font-medium">Product quantity: {data.items.length}</span>
        </div>
        <div>
          <span className="text-sm font-medium">Item quantity: {totalItems}</span>
        </div>
        <div>
          <span className="text-sm font-medium">Total weight: {totalWeight.toFixed(2)} kg</span>
        </div>
      </div>

      {/* Order Items */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-t border-b border-gray-300">
              <th className="py-2 px-2 text-left text-sm font-medium">No.</th>
              <th className="py-2 px-2 text-left text-sm font-medium">Product Image</th>
              <th className="py-2 px-2 text-left text-sm font-medium">Product name</th>
              <th className="py-2 px-2 text-left text-sm font-medium">SKU</th>
              <th className="py-2 px-2 text-left text-sm font-medium">Seller SKU</th>
              <th className="py-2 px-2 text-left text-sm font-medium">Qty</th>
              <th className="py-2 px-2 text-left text-sm font-medium">Weight (kg)</th>
              <th className="py-2 px-2 text-left text-sm font-medium">Order ID</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3 px-2 align-top text-sm">{index + 1}</td>
                <td className="py-3 px-2 align-top">
                  <div className="h-14 w-14 bg-gray-100 rounded overflow-hidden">
                    <SafeImage src={item.imageUrl || ""} alt={item.name} width={56} height={56} />
                  </div>
                </td>
                <td className="py-3 px-2 align-top max-w-[180px] text-sm">
                  <div className="break-words">{item.name}</div>
                </td>
                <td className="py-3 px-2 align-top max-w-[90px] text-sm">
                  <div className="whitespace-pre-line break-words">{formatSku(item.sku)}</div>
                </td>
                <td className="py-3 px-2 align-top max-w-[90px] text-sm">
                  <div className="whitespace-pre-line break-words">{formatSku(item.sellerSku)}</div>
                </td>
                <td className="py-3 px-2 align-top text-sm">{item.quantity}</td>
                <td className="py-3 px-2 align-top text-sm">{((item.weight || 0) * item.quantity).toFixed(2)}</td>
                <td className="py-3 px-2 align-top max-w-[110px] text-sm">
                  <div className="whitespace-pre-line break-words">
                    {item.orderId.length > 12
                      ? `${item.orderId.substring(0, 12)}\n${item.orderId.substring(12)}`
                      : item.orderId}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-3 border-t border-gray-300">
        <div className="flex items-center">
          {customLogo ? (
            <img
              src={customLogo || "/placeholder.svg"}
              alt="Company Logo"
              style={{ width: logoDimensions.width + "px", height: logoDimensions.height + "px", maxWidth: "100%" }}
              className="object-contain"
            />
          ) : (
            <SafeImage
              src="https://cdn.shopify.com/s/files/1/0556/0359/3529/files/tts_logo.png?v=1746866929"
              alt="TikTok Shop"
              width={120}
              height={40}
            />
          )}
        </div>
      </div>
    </div>
  )
}
