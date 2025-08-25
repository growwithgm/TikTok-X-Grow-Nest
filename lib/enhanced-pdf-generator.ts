import { jsPDF } from "jspdf"
import type { PackingSlipData } from "./types"
import { optimizePdfParams } from "./grok-service"

// Default PDF generation parameters
const defaultPdfParams = {
  margins: {
    top: 15,
    right: 15,
    bottom: 15,
    left: 15,
  },
  fonts: {
    header: {
      size: 18,
      style: "bold",
    },
    subheader: {
      size: 11,
      style: "bold",
    },
    normal: {
      size: 10,
      style: "normal",
    },
    table: {
      header: {
        size: 9,
        style: "bold",
      },
      content: {
        size: 9,
        style: "normal",
      },
    },
  },
  spacing: {
    lineHeight: 4,
    paragraphGap: 2,
    tableRowGap: 2,
  },
  colors: {
    lines: {
      header: [200, 200, 200],
      content: [220, 220, 220],
    },
  },
}

// Function to load an image from URL and convert to base64
async function loadImageAsBase64(url: string): Promise<string> {
  try {
    // For external URLs, we need to use fetch instead of Image
    const response = await fetch(url)
    const blob = await response.blob()

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error("Error loading image:", error)
    // Return a simple 1x1 transparent PNG as fallback
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
  }
}

export async function generateEnhancedPDF(packingSlips: PackingSlipData[], useAI = false): Promise<void> {
  try {
    // Get PDF parameters - either default or AI-optimized
    let pdfParams = defaultPdfParams

    if (useAI) {
      try {
        const optimizationResult = await optimizePdfParams(defaultPdfParams)
        if (optimizationResult.optimizedParams) {
          pdfParams = optimizationResult.optimizedParams
          console.log("Using AI-optimized PDF parameters:", pdfParams)
        }
      } catch (error) {
        console.error("Failed to optimize PDF parameters with AI, using defaults:", error)
      }
    }

    // Check for custom logo in localStorage
    let logoBase64
    let logoDimensions = { width: 25, height: 10 } // Default dimensions in mm

    const customLogo = localStorage.getItem("customLogo")
    if (customLogo) {
      logoBase64 = customLogo

      // Get custom logo dimensions
      const storedDimensions = localStorage.getItem("logoDimensions")
      if (storedDimensions) {
        try {
          const dimensions = JSON.parse(storedDimensions)
          // Convert pixel dimensions to mm (approximate conversion)
          logoDimensions = {
            width: Math.min(dimensions.width / 4, 50), // Limit max width to 50mm
            height: Math.min(dimensions.height / 4, 20), // Limit max height to 20mm
          }
        } catch (error) {
          console.error("Failed to parse logo dimensions:", error)
        }
      }
    } else {
      // Load the default TikTok Shop logo
      const logoUrl = "https://cdn.shopify.com/s/files/1/0556/0359/3529/files/tts_logo.png?v=1746866929"
      try {
        logoBase64 = await loadImageAsBase64(logoUrl)
      } catch (error) {
        console.error("Failed to load logo, using fallback:", error)
        // Use a fallback transparent  {
        console.error("Failed to load logo, using fallback:", error)
        // Use a fallback transparent image if logo loading fails
        logoBase64 =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      }
    }

    // Create a new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Process each packing slip
    packingSlips.forEach((slip, index) => {
      if (index > 0) {
        doc.addPage()
      }

      // Extract parameters from our configuration
      const margin = pdfParams.margins.left
      const pageWidth = doc.internal.pageSize.getWidth()

      // --- HEADER SECTION ---
      const headerStartY = pdfParams.margins.top + 5

      // Header section - Left side
      doc.setFont("helvetica", pdfParams.fonts.header.style)
      doc.setFontSize(pdfParams.fonts.header.size)
      doc.text("PACKING SLIP", margin, headerStartY)

      doc.setFontSize(pdfParams.fonts.subheader.size)
      doc.text(`ORDER #${slip.orderNumber}`, margin, headerStartY + 10)

      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      doc.text(`DATE: ${currentDate}`, margin, headerStartY + 17)

      // Header section - Right side (Customer information)
      doc.setFont("helvetica", pdfParams.fonts.subheader.style)
      doc.setFontSize(pdfParams.fonts.subheader.size)
      const customerName = slip.customer.name
      doc.text(customerName, pageWidth - margin, headerStartY, { align: "right" })

      doc.setFont("helvetica", pdfParams.fonts.normal.style)
      doc.setFontSize(pdfParams.fonts.normal.size)

      // Parse address into components and remove duplicates
      const addressParts = slip.customer.address
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)

      const uniqueParts = []
      const seen = new Set()

      for (const part of addressParts) {
        if (!seen.has(part.toLowerCase())) {
          seen.add(part.toLowerCase())
          uniqueParts.push(part)
        }
      }

      // Format address according to the specified format
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

      // Add address lines with proper spacing
      doc.text(addressLine1, pageWidth - margin, headerStartY + 10, { align: "right" })
      doc.text(addressLine2, pageWidth - margin, headerStartY + 16, { align: "right" })

      // Add phone number with proper spacing to avoid overlap
      doc.text(slip.customer.phone, pageWidth - margin, headerStartY + 24, {
        align: "right",
      })

      // --- ORDER SUMMARY SECTION ---
      const summaryY = headerStartY + 30
      doc.setFont("helvetica", pdfParams.fonts.normal.style)
      doc.setFontSize(pdfParams.fonts.normal.size)

      // Calculate totals
      const totalItems = slip.items.reduce((total, item) => total + item.quantity, 0)
      const totalProducts = slip.items.length
      const uniqueOrderIds = new Set(slip.items.map((item) => item.orderId).filter(Boolean))
      const orderCount = uniqueOrderIds.size || 1 // Ensure at least 1 if no order IDs are present

      // Adjusted horizontal positions for summary items
      doc.text(
        `Order quantity: ${slip.orderQuantity !== undefined ? slip.orderQuantity : orderCount}`,
        margin,
        summaryY,
      )
      doc.text(`Product quantity: ${slip.items.length}`, margin + 55, summaryY)
      doc.text(`Item quantity: ${totalItems}`, margin + 115, summaryY)

      // --- TABLE SECTION ---
      const tableTop = summaryY + 10
      doc.setDrawColor(...pdfParams.colors.lines.header)
      doc.line(margin, tableTop, pageWidth - margin, tableTop)

      const headerY = tableTop + 6
      doc.setFont("helvetica", pdfParams.fonts.table.header.style)
      doc.setFontSize(pdfParams.fonts.table.header.size)

      const textPadding = 2

      // Define column widths to match image
      const colWidths = {
        no: 8,
        image: 20,
        name: 57,
        sku: 25,
        sellerSku: 25,
        qty: 10,
        orderId: 35,
      }

      const colPos = {
        no: margin,
        image: margin + colWidths.no,
        name: margin + colWidths.no + colWidths.image,
        sku: margin + colWidths.no + colWidths.image + colWidths.name,
        sellerSku: margin + colWidths.no + colWidths.image + colWidths.name + colWidths.sku,
        qty: margin + colWidths.no + colWidths.image + colWidths.name + colWidths.sku + colWidths.sellerSku,
        orderId:
          margin +
          colWidths.no +
          colWidths.image +
          colWidths.name +
          colWidths.sku +
          colWidths.sellerSku +
          colWidths.qty,
      }

      doc.text("No.", colPos.no + textPadding, headerY)
      doc.text("Product Image", colPos.image + textPadding, headerY)
      doc.text("Product name", colPos.name + textPadding, headerY)
      doc.text("SKU", colPos.sku + textPadding, headerY)
      doc.text("Seller SKU", colPos.sellerSku + textPadding, headerY)
      doc.text("Qty", colPos.qty + colWidths.qty / 2, headerY, { align: "center" })
      doc.text("Order ID", colPos.orderId + textPadding, headerY)

      doc.line(margin, headerY + 3, pageWidth - margin, headerY + 3)

      // Table content
      doc.setFont("helvetica", pdfParams.fonts.table.content.style)
      doc.setFontSize(pdfParams.fonts.table.content.size)
      let y = headerY + 9

      // Helper function to format SKUs
      const formatSku = (sku: string) => {
        if (!sku || sku.length <= 10) return [sku || ""]
        if (sku.includes("-") || sku.includes("/") || sku.includes("_")) {
          const parts = sku.split(/[-/_]/)
          return parts.length > 1 ? parts : [sku.substring(0, 10), sku.substring(10)]
        }
        const midPoint = Math.ceil(sku.length / 2)
        return [sku.substring(0, midPoint), sku.substring(midPoint)]
      }

      // Load and cache product images
      const productImagePromises = slip.items
        .filter((item) => item.imageUrl && item.imageUrl.startsWith("http"))
        .map(async (item) => {
          try {
            if (item.imageUrl) {
              const base64 = await loadImageAsBase64(item.imageUrl)
              return { itemName: item.name, base64 }
            }
          } catch (error) {
            console.error(`Failed to load image for ${item.name}:`, error)
          }
          return null
        })

      // Process items and add to PDF
      Promise.all(productImagePromises)
        .then((productImages) => {
          // Create a map of product name to base64 image
          const imageMap = new Map<string, string>()
          productImages.forEach((item) => {
            if (item) {
              imageMap.set(item.itemName, item.base64)
            }
          })

          slip.items.forEach((item, idx) => {
            const pageBreakThreshold = doc.internal.pageSize.getHeight() - margin - 20
            if (y > pageBreakThreshold) {
              doc.addPage()
              y = margin + 10

              // Re-add table header to new page
              doc.setDrawColor(...pdfParams.colors.lines.header)
              doc.line(margin, y - 2, pageWidth - margin, y - 2)
              doc.setFont("helvetica", pdfParams.fonts.table.header.style)
              doc.setFontSize(pdfParams.fonts.table.header.size)
              const newPageHeaderY = y + 4
              doc.text("No.", colPos.no + textPadding, newPageHeaderY)
              doc.text("Product Image", colPos.image + textPadding, newPageHeaderY)
              doc.text("Product name", colPos.name + textPadding, newPageHeaderY)
              doc.text("SKU", colPos.sku + textPadding, newPageHeaderY)
              doc.text("Seller SKU", colPos.sellerSku + textPadding, newPageHeaderY)
              doc.text("Qty", colPos.qty + colWidths.qty / 2, newPageHeaderY, { align: "center" })
              doc.text("Order ID", colPos.orderId + textPadding, newPageHeaderY)
              doc.line(margin, newPageHeaderY + 3, pageWidth - margin, newPageHeaderY + 3)

              doc.setFont("helvetica", pdfParams.fonts.table.content.style)
              doc.setFontSize(pdfParams.fonts.table.content.size)
              y = newPageHeaderY + 9
            }

            const currentTextY = y + 1

            // Item number
            doc.text((idx + 1).toString(), colPos.no + textPadding, currentTextY)

            // Add product image if available
            if (item.imageUrl) {
              try {
                // For base64 images, use directly
                if (item.imageUrl.startsWith("data:")) {
                  doc.addImage(item.imageUrl, "JPEG", colPos.image + 2, currentTextY - 5, colWidths.image - 4, 10)
                }
                // For cached HTTP images, use from map
                else if (imageMap.has(item.name)) {
                  doc.addImage(
                    imageMap.get(item.name) || "",
                    "JPEG",
                    colPos.image + 2,
                    currentTextY - 5,
                    colWidths.image - 4,
                    10,
                  )
                }
              } catch (error) {
                console.error(`Failed to add image for ${item.name}:`, error)
              }
            }

            // Product name with word wrapping
            const productNameLines = doc.splitTextToSize(item.name || "", colWidths.name - 2 * textPadding)
            doc.text(productNameLines, colPos.name + textPadding, currentTextY)
            const productNameHeight = productNameLines.length * pdfParams.spacing.lineHeight

            // Format SKU
            const formattedSku = formatSku(item.sku || "")
            let skuHeight = 0
            formattedSku.forEach((line, i) => {
              if (line) {
                doc.text(line, colPos.sku + textPadding, currentTextY + i * pdfParams.spacing.lineHeight)
                skuHeight = (i + 1) * pdfParams.spacing.lineHeight
              }
            })

            // Format Seller SKU
            const formattedSellerSku = formatSku(item.sellerSku || "")
            let sellerSkuHeight = 0
            formattedSellerSku.forEach((line, i) => {
              if (line) {
                doc.text(line, colPos.sellerSku + textPadding, currentTextY + i * pdfParams.spacing.lineHeight)
                sellerSkuHeight = (i + 1) * pdfParams.spacing.lineHeight
              }
            })

            // Quantity - Centered
            doc.text(item.quantity.toString(), colPos.qty + colWidths.qty / 2, currentTextY, { align: "center" })

            // Format Order ID
            let orderIdLines
            const orderIdText = item.orderId || ""
            if (orderIdText.length > 15 && colWidths.orderId < 40) {
              orderIdLines = [
                orderIdText.substring(0, Math.floor(orderIdText.length / 2)),
                orderIdText.substring(Math.floor(orderIdText.length / 2)),
              ]
            } else {
              orderIdLines = [orderIdText]
            }

            let orderIdHeight = 0
            orderIdLines.forEach((line, i) => {
              if (line) {
                doc.text(line, colPos.orderId + textPadding, currentTextY + i * pdfParams.spacing.lineHeight)
                orderIdHeight = (i + 1) * pdfParams.spacing.lineHeight
              }
            })

            // Calculate the maximum height needed for this row
            const rowHeight = Math.max(12, productNameHeight, skuHeight, sellerSkuHeight, orderIdHeight)

            y += rowHeight + pdfParams.spacing.tableRowGap

            // Add a line after each item
            doc.setDrawColor(...pdfParams.colors.lines.content)
            doc.line(margin, y, pageWidth - margin, y)
            y += pdfParams.spacing.paragraphGap
          })

          // --- FOOTER SECTION ---
          const footerY = doc.internal.pageSize.getHeight() - margin - 15
          doc.setDrawColor(...pdfParams.colors.lines.header)
          doc.line(margin, footerY, pageWidth - margin, footerY)

          try {
            // Add the logo (custom or default)
            doc.addImage(logoBase64, "PNG", margin, footerY + 3, logoDimensions.width, logoDimensions.height)
          } catch (error) {
            console.error("Error adding logo to PDF:", error)
            // If logo fails, add text as fallback
            doc.setFont("helvetica", "bold")
            doc.setFontSize(11)
            doc.text("TikTok Shop", margin, footerY + 8)
          }

          // Save the PDF
          doc.save("tiktok-shop-packing-slips.pdf")
        })
        .catch((error) => {
          console.error("Error processing product images:", error)
          // Save the PDF even if image processing fails
          doc.save("tiktok-shop-packing-slips.pdf")
        })
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    alert(`There was an error generating the PDF: ${errorMessage}. Please try again.`)
  }
}
