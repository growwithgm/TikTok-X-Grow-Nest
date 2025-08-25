import { jsPDF } from "jspdf"

// Define a more comprehensive PackingSlipData type based on the HTML preview
// and the new sections added to the PDF.
// You'll need to ensure your actual data objects conform to this.
export interface PackingSlipData {
  orderNumber: string
  orderName?: string // From HTML preview
  date?: string // From HTML preview, or use current date
  poNumber?: string // From HTML preview

  customer: {
    name: string
    address: string // This will be parsed for the top-right header
    phone: string
  }

  // For separate shipping/billing address blocks if you decide to add them later
  // shippingAddress?: { name: string; company?: string; address1: string; address2?: string; city: string; provinceCode: string; zip: string; country: string; phone?: string; };
  // billingAddress?: { name: string; company?: string; address1: string; address2?: string; city: string; provinceCode: string; zip: string; country: string; phone?: string; };

  items: Array<{
    name: string
    sku?: string
    sellerSku?: string
    quantity: number
    orderId?: string // This was 'Item ID' in HTML, 'orderId' in your JS
    imageUrl?: string
    properties?: Array<{ first: string; last: string }> // For item variants like size/color
  }>

  // For the order summary bar
  itemCount: number // Total individual items (sum of quantities)
  productCount: number // Number of unique line items
  orderQuantity?: number // Number of orders (usually 1 for a single slip)

  // For the Totals section
  subtotalPrice?: number
  totalDiscounts?: number
  shippingPrice?: number
  taxPrice?: number
  dutiesPrice?: number
  totalPrice?: number
  currencySymbol?: string // e.g., "$"

  // For Notes section
  note?: string
  pickupInStore?: boolean
  locationDetails?: {
    // For pickup location
    name: string
    address1: string
    address2?: string
    city: string
    zip: string
  }

  // For Footer
  shopDetails?: {
    name: string
    domain?: string
    phone?: string
    email?: string
    address1?: string // Shop's own address for header if needed
    city?: string
    provinceCode?: string
    zip?: string
  }
  orderStatusUrl?: string
  shopAccentColor?: string // For theme consistency
  shopLogoUrl?: string // If you pass it directly instead of localStorage
  shopLogoWidth?: number // in px, will be converted
}

// Function to load an image from URL and convert to base64
async function loadImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error(`Error loading image from ${url}:`, error)
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" // Fallback
  }
}

export async function generatePackingSlipPDF(packingSlipsData: PackingSlipData[]): Promise<void> {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // --- Global PDF Styling Variables ---
    const margin = 15 // Page margin in mm
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const contentWidth = pageWidth - 2 * margin
    const defaultAccentColor = "#007bff" // Fallback accent color (blue)

    // --- Logo Loading Logic (moved here to be loaded once) ---
    let headerLogoBase64: string | undefined
    let headerLogoDimensions = { width: 35, height: 12 } // Default logo dimensions in mm for header

    const customLogo = localStorage.getItem("customLogo")
    if (customLogo) {
      headerLogoBase64 = customLogo
      const storedDimensions = localStorage.getItem("logoDimensions")
      if (storedDimensions) {
        try {
          const dimensions = JSON.parse(storedDimensions)
          // Convert pixel to mm (approx. 3.78 px/mm), limit size
          headerLogoDimensions = {
            width: Math.min(dimensions.width / 3.78, 50), // Max 50mm width
            height: Math.min(dimensions.height / 3.78, 20), // Max 20mm height
          }
        } catch (e) {
          console.error("Failed to parse custom logo dimensions", e)
        }
      }
    } else if (packingSlipsData.length > 0 && packingSlipsData[0].shopLogoUrl) {
      // Use shopLogoUrl from data if provided and no custom logo
      try {
        headerLogoBase64 = await loadImageAsBase64(packingSlipsData[0].shopLogoUrl)
        if (packingSlipsData[0].shopLogoWidth) {
          // Assuming shopLogoWidth is in px, and height is auto based on that width
          const pxWidth = packingSlipsData[0].shopLogoWidth
          // This is a rough conversion and might need an actual image height or aspect ratio
          headerLogoDimensions.width = Math.min(pxWidth / 3.78, 50)
          // For height, we'd ideally get it from the image or data.
          // For now, let's try to keep it proportional if original height was for 180px width
          // This is a placeholder logic for height based on width.
          const defaultHTMLWidthPx = 180
          const defaultHTMLHeightMm =
            (defaultHTMLWidthPx * (headerLogoDimensions.height / headerLogoDimensions.width)) / 3.78 // approx
          const storedDimensions = localStorage.getItem("logoDimensions")
          const dimensions = storedDimensions
            ? JSON.parse(storedDimensions)
            : { width: defaultHTMLWidthPx, height: defaultHTMLHeightMm }
          headerLogoDimensions.height = Math.min(dimensions.height / 3.78, 20)
        }
      } catch (e) {
        console.error("Failed to load shopLogoUrl for header", e)
      }
    }

    if (!headerLogoBase64) {
      // Fallback to TikTok Shop logo if no custom/data logo
      const defaultLogoUrl = "https://cdn.shopify.com/s/files/1/0556/0359/3529/files/tts_logo.png?v=1746866929"
      try {
        headerLogoBase64 = await loadImageAsBase64(defaultLogoUrl)
      } catch (e) {
        console.error("Failed to load default TikTok Shop logo", e)
        headerLogoBase64 =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" // Ultimate fallback
      }
    }

    for (let i = 0; i < packingSlipsData.length; i++) {
      const slip = packingSlipsData[i]
      if (i > 0) {
        doc.addPage()
      }

      const accentColor = slip.shopAccentColor || defaultAccentColor
      let currentY = margin

      // --- PDF HEADER SECTION ---
      // Draw Shop Logo (Top-Left)
      if (headerLogoBase64) {
        try {
          doc.addImage(
            headerLogoBase64,
            "PNG",
            margin,
            currentY,
            headerLogoDimensions.width,
            headerLogoDimensions.height,
          )
        } catch (e) {
          console.error("Error adding header logo to PDF:", e)
        }
      }
      const logoBottomY = currentY + headerLogoDimensions.height

      // Header Text (Right of Logo or Below, and Top-Right for Customer)
      const headerTextStartY = headerLogoBase64 ? currentY + 2 : currentY // Adjust if logo is present
      const headerLeftTextX = headerLogoBase64 ? margin + headerLogoDimensions.width + 5 : margin

      doc.setFont("helvetica", "bold")
      doc.setFontSize(18)
      doc.setTextColor(accentColor)
      doc.text("PACKING SLIP", headerLeftTextX, headerTextStartY + 5)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(51, 51, 51) // #333
      doc.text(`Order Number: ${slip.orderNumber || "N/A"}`, headerLeftTextX, headerTextStartY + 12)
      const orderDate =
        slip.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      doc.text(`Date: ${orderDate}`, headerLeftTextX, headerTextStartY + 17)
      if (slip.poNumber) {
        doc.text(`PO Number: ${slip.poNumber}`, headerLeftTextX, headerTextStartY + 22)
      }

      // Customer Info (Top-Right)
      const customerName = slip.customer.name || "N/A"
      const customerAddress = slip.customer.address || "N/A"
      const customerPhone = slip.customer.phone || "N/A"

      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.text(customerName, pageWidth - margin, headerTextStartY + 5, { align: "right" })

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      const addressLines = doc.splitTextToSize(customerAddress, 60) // Max width for address block
      let addressY = headerTextStartY + 10
      addressLines.forEach((line) => {
        doc.text(line, pageWidth - margin, addressY, { align: "right" })
        addressY += 4
      })
      doc.text(customerPhone, pageWidth - margin, addressY + 2, { align: "right" })

      // Determine bottom of header to start next section
      currentY = Math.max(logoBottomY, addressY + 5, headerTextStartY + (slip.poNumber ? 27 : 22)) + 5 // Add some padding

      // Header Bottom Border
      doc.setDrawColor(accentColor)
      doc.setLineWidth(0.5)
      doc.line(margin, currentY, pageWidth - margin, currentY)
      currentY += 8 // Space after border

      // --- ORDER SUMMARY BAR ---
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setFillColor(248, 249, 250) // Light gray background #f8f9fa
      doc.setDrawColor(233, 236, 239) // Lighter border #e9ecef
      doc.setLineWidth(0.2)
      doc.rect(margin, currentY - 3, contentWidth, 10, "FD") // Draw a filled and bordered rectangle

      const summaryTextY = currentY + 2

      // Calculate totals
      const totalItems = slip.items.reduce((total, item) => total + item.quantity, 0)
      const uniqueOrderIds = new Set(slip.items.map((item) => item.orderId).filter(Boolean))
      const orderCount = uniqueOrderIds.size || 1 // Ensure at least 1 if no order IDs are present

      const summaryColWidth = contentWidth / 3
      doc.text(
        `Order quantity: ${slip.orderQuantity !== undefined ? slip.orderQuantity : orderCount}`,
        margin + 5,
        summaryTextY,
      )
      doc.text(
        `Product quantity: ${slip.productCount !== undefined ? slip.productCount : slip.items.length}`,
        margin + summaryColWidth + 5,
        summaryTextY,
        { align: "center" },
      )
      doc.text(
        `Item quantity: ${slip.itemCount !== undefined ? slip.itemCount : slip.items.reduce((sum, item) => sum + item.quantity, 0)}`,
        margin + summaryColWidth * 2 - 5,
        summaryTextY,
        { align: "right" },
      )
      currentY += 12

      // --- ITEMS TABLE ---
      const tableTopY = currentY
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setFillColor(233, 236, 239) // Header background #e9ecef
      doc.setDrawColor(222, 226, 230) // Border #dee2e6

      // Column Definitions (widths are approximate percentages of contentWidth)
      const colWidths = {
        no: contentWidth * 0.05,
        image: contentWidth * 0.12,
        name: contentWidth * 0.33,
        sku: contentWidth * 0.15,
        sellerSku: contentWidth * 0.15,
        qty: contentWidth * 0.08,
        itemId: contentWidth * 0.12,
      }

      let currentX = margin
      const tableHeaderY = tableTopY + 6

      // Draw table header background
      doc.rect(margin, tableTopY, contentWidth, 8, "F")

      function drawTableHeaderCell(text: string, width: number, align: "left" | "center" | "right" = "left") {
        const textX =
          align === "center" ? currentX + width / 2 : align === "right" ? currentX + width - 2 : currentX + 2
        doc.text(text, textX, tableHeaderY, { align: align === "left" ? undefined : align })
        doc.line(currentX, tableTopY, currentX, tableTopY + 8) // Vertical line
        currentX += width
      }
      doc.line(margin, tableTopY, pageWidth - margin, tableTopY) // Top border of header
      drawTableHeaderCell("No.", colWidths.no, "center")
      drawTableHeaderCell("Image", colWidths.image, "center")
      drawTableHeaderCell("Product Name", colWidths.name)
      drawTableHeaderCell("SKU", colWidths.sku)
      drawTableHeaderCell("Seller SKU", colWidths.sellerSku)
      drawTableHeaderCell("Qty", colWidths.qty, "center")
      drawTableHeaderCell("Item ID", colWidths.itemId)
      doc.line(currentX, tableTopY, currentX, tableTopY + 8) // Rightmost vertical line
      doc.line(margin, tableTopY + 8, pageWidth - margin, tableTopY + 8) // Bottom border of header

      currentY = tableTopY + 8 // Start Y for first item row

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8.5)

      // Load all product images
      const imagePromises = slip.items.map((item) =>
        item.imageUrl ? loadImageAsBase64(item.imageUrl) : Promise.resolve(undefined),
      )
      const loadedImages = await Promise.all(imagePromises)

      slip.items.forEach((item, idx) => {
        const itemImageBase64 = loadedImages[idx]
        const rowStartY = currentY
        const cellPaddingY = 3 // Padding from top of cell to text baseline
        let maxRowHeight = 18 // Minimum row height (for image)

        // Calculate text heights for wrapping
        const productNameLines = doc.splitTextToSize(item.name || "N/A", colWidths.name - 4)
        maxRowHeight = Math.max(maxRowHeight, productNameLines.length * 3.5 + 2 * cellPaddingY)

        const skuLines = doc.splitTextToSize(item.sku || "N/A", colWidths.sku - 4)
        maxRowHeight = Math.max(maxRowHeight, skuLines.length * 3.5 + 2 * cellPaddingY)

        const sellerSkuLines = doc.splitTextToSize(item.sellerSku || "N/A", colWidths.sellerSku - 4)
        maxRowHeight = Math.max(maxRowHeight, sellerSkuLines.length * 3.5 + 2 * cellPaddingY)

        const itemIdLines = doc.splitTextToSize(item.orderId || "N/A", colWidths.itemId - 4)
        maxRowHeight = Math.max(maxRowHeight, itemIdLines.length * 3.5 + 2 * cellPaddingY)

        // Page break check
        if (currentY + maxRowHeight > pageHeight - margin - 20) {
          // 20mm buffer for footer
          doc.addPage()
          currentY = margin
          // Redraw table header on new page
          doc.setFont("helvetica", "bold")
          doc.setFontSize(9)
          doc.setFillColor(233, 236, 239)
          doc.rect(margin, currentY, contentWidth, 8, "F")
          let tempX = margin
          doc.line(margin, currentY, pageWidth - margin, currentY)
          function redrawTableHeaderCell(text: string, width: number, align: "left" | "center" | "right" = "left") {
            const textX = align === "center" ? tempX + width / 2 : align === "right" ? tempX + width - 2 : tempX + 2
            doc.text(text, textX, currentY + 6, { align: align === "left" ? undefined : align })
            doc.line(tempX, currentY, tempX, currentY + 8)
            tempX += width
          }
          redrawTableHeaderCell("No.", colWidths.no, "center")
          redrawTableHeaderCell("Image", colWidths.image, "center")
          redrawTableHeaderCell("Product Name", colWidths.name)
          redrawTableHeaderCell("SKU", colWidths.sku)
          redrawTableHeaderCell("Seller SKU", colWidths.sellerSku)
          redrawTableHeaderCell("Qty", colWidths.qty, "center")
          redrawTableHeaderCell("Item ID", colWidths.itemId)
          doc.line(tempX, currentY, tempX, currentY + 8)
          doc.line(margin, currentY + 8, pageWidth - margin, currentY + 8)
          currentY += 8
          doc.setFont("helvetica", "normal")
          doc.setFontSize(8.5)
        }

        // Draw cell content
        currentX = margin
        const textBaselineY = currentY + cellPaddingY + 2 // Adjusted for better vertical centering idea

        // No.
        doc.text((idx + 1).toString(), currentX + colWidths.no / 2, textBaselineY, { align: "center" })
        doc.line(currentX, rowStartY, currentX, rowStartY + maxRowHeight)
        currentX += colWidths.no

        // Image
        if (itemImageBase64 && itemImageBase64.startsWith("data:image")) {
          try {
            doc.addImage(itemImageBase64, "JPEG", currentX + 2, currentY + (maxRowHeight - 15) / 2, 15, 15) // 15x15mm image, centered vertically
          } catch (e) {
            console.error("Error adding item image:", e)
          }
        }
        doc.line(currentX, rowStartY, currentX, rowStartY + maxRowHeight)
        currentX += colWidths.image

        // Product Name
        doc.text(productNameLines, currentX + 2, textBaselineY)
        // Add properties if any
        if (item.properties && item.properties.length > 0) {
          let propY = textBaselineY + productNameLines.length * 3.5
          doc.setFontSize(7.5)
          doc.setTextColor(108, 117, 125) // Muted color for properties
          item.properties.forEach((prop) => {
            const propText = `${prop.first}: ${prop.last}`
            const propLines = doc.splitTextToSize(propText, colWidths.name - 4)
            doc.text(propLines, currentX + 2, propY)
            propY += propLines.length * 3
          })
          doc.setFontSize(8.5) // Reset font size
          doc.setTextColor(51, 51, 51) // Reset color
        }
        doc.line(currentX, rowStartY, currentX, rowStartY + maxRowHeight)
        currentX += colWidths.name

        // SKU
        doc.text(skuLines, currentX + 2, textBaselineY)
        doc.line(currentX, rowStartY, currentX, rowStartY + maxRowHeight)
        currentX += colWidths.sku

        // Seller SKU
        doc.text(sellerSkuLines, currentX + 2, textBaselineY)
        doc.line(currentX, rowStartY, currentX, rowStartY + maxRowHeight)
        currentX += colWidths.sellerSku

        // Qty
        doc.text(item.quantity.toString(), currentX + colWidths.qty / 2, textBaselineY, { align: "center" })
        doc.line(currentX, rowStartY, currentX, rowStartY + maxRowHeight)
        currentX += colWidths.qty

        // Item ID
        doc.text(itemIdLines, currentX + 2, textBaselineY)
        doc.line(currentX, rowStartY, currentX, rowStartY + maxRowHeight) // Rightmost line of cell
        doc.line(pageWidth - margin, rowStartY, pageWidth - margin, rowStartY + maxRowHeight) // Right border of table for this row

        currentY += maxRowHeight
        doc.line(margin, currentY, pageWidth - margin, currentY) // Bottom border of row
      })
      currentY += 5 // Space after table

      // --- TOTALS SECTION ---
      const totalsTableY = currentY
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      const currency = slip.currencySymbol || "$"
      const totalsData = [
        { label: "Subtotal:", value: slip.subtotalPrice },
        { label: "Discounts:", value: slip.totalDiscounts ? -slip.totalDiscounts : undefined }, // Show as negative
        { label: "Shipping:", value: slip.shippingPrice },
        { label: "Tax:", value: slip.taxPrice },
        { label: "Duties:", value: slip.dutiesPrice },
        { label: "Total:", value: slip.totalPrice, isBold: true },
      ]

      const totalsValueX = pageWidth - margin // Right align values
      const totalsLabelX = totalsValueX - 30 // Position for labels

      totalsData.forEach((totalItem) => {
        if (totalItem.value !== undefined) {
          if (totalItem.isBold) doc.setFont("helvetica", "bold")
          doc.text(totalItem.label, totalsLabelX, currentY, { align: "right" })
          const displayValue = `${totalItem.value < 0 ? "-" : ""}${currency}${Math.abs(totalItem.value).toFixed(2)}`
          doc.text(displayValue, totalsValueX, currentY, { align: "right" })
          if (totalItem.isBold) doc.setFont("helvetica", "normal") // Reset
          currentY += 5
        }
      })
      currentY += 5 // Space after totals

      // --- NOTES SECTION ---
      if (slip.note || slip.pickupInStore) {
        doc.setDrawColor(204, 204, 204) // Dashed line color #ccc
        doc.setLineDashPattern([2, 1], 0)
        doc.line(margin, currentY, pageWidth - margin, currentY)
        doc.setLineDashPattern([], 0) // Reset dash pattern
        currentY += 5

        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(accentColor)

        if (slip.note) {
          doc.text("Notes:", margin, currentY)
          currentY += 5
          doc.setFont("helvetica", "normal")
          doc.setFontSize(9)
          doc.setTextColor(51, 51, 51)
          const noteLines = doc.splitTextToSize(slip.note, contentWidth)
          doc.text(noteLines, margin, currentY)
          currentY += noteLines.length * 4 + 5
        }

        if (slip.pickupInStore) {
          doc.setFont("helvetica", "bold")
          doc.setFontSize(10)
          doc.setTextColor(accentColor)
          doc.text("Pickup Information:", margin, currentY)
          currentY += 5
          doc.setFont("helvetica", "normal")
          doc.setFontSize(9)
          doc.setTextColor(51, 51, 51)
          doc.text("This is a pickup order.", margin, currentY)
          currentY += 4
          if (slip.locationDetails) {
            doc.text(`Location: ${slip.locationDetails.name || "N/A"}`, margin, currentY)
            currentY += 4
            doc.text(slip.locationDetails.address1 || "", margin, currentY)
            currentY += 4
            if (slip.locationDetails.address2) {
              doc.text(slip.locationDetails.address2, margin, currentY)
              currentY += 4
            }
            doc.text(`${slip.locationDetails.city || ""}, ${slip.locationDetails.zip || ""}`, margin, currentY)
            currentY += 4
          }
          currentY += 5
        }
      }

      // --- PDF FOOTER SECTION ---
      const footerContentY = pageHeight - margin - 10 // Position footer content higher
      doc.setDrawColor(accentColor)
      doc.setLineWidth(0.5)
      doc.line(margin, footerContentY - 2, pageWidth - margin, footerContentY - 2) // Line above footer

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(108, 117, 125) // Muted color #6c757d

      // TikTok Shop Branding Text (since main logo is in header)
      doc.text("TikTok Shop", margin, footerContentY + 2)

      const shopNameAndDomain = `${slip.shopDetails?.name || "Your Shop Name"}${slip.shopDetails?.domain ? ` - ${slip.shopDetails.domain}` : ""}`
      doc.text(shopNameAndDomain, pageWidth / 2, footerContentY + 2, { align: "center" })

      if (slip.orderStatusUrl) {
        doc.textWithLink("View order status online", totalsValueX, footerContentY + 2, {
          url: slip.orderStatusUrl,
          align: "right",
        })
      } else {
        doc.text("Thank you for your order!", totalsValueX, footerContentY + 2, { align: "right" })
      }
    }

    doc.save("tiktok-shop-packing-slips.pdf")
  } catch (error) {
    console.error("Error generating PDF:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    // Avoid using alert in library code if possible, prefer throwing or returning error
    throw new Error(`There was an error generating the PDF: ${errorMessage}. Please try again.`)
  }
}
