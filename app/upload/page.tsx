"use client"

import { useState, useEffect } from "react"
import { Upload as UploadComponent } from "@/components/upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Check for pending CSV file from the home page
  useEffect(() => {
    const pendingCsvContent = localStorage.getItem("pendingCsvContent")
    const pendingCsvFile = localStorage.getItem("pendingCsvFile")

    if (pendingCsvContent && pendingCsvFile) {
      try {
        const fileInfo = JSON.parse(pendingCsvFile)
        console.log("Found pending CSV file:", fileInfo.name)

        // Store the CSV content for the map-columns page
        localStorage.setItem("csvContent", pendingCsvContent)

        // Extract headers
        const headers = pendingCsvContent
          .split("\n")[0]
          .split(",")
          .map((h) => h.trim())
        localStorage.setItem("csvHeaders", JSON.stringify(headers))

        // Clear the pending file from localStorage to avoid processing it again
        localStorage.removeItem("pendingCsvContent")
        localStorage.removeItem("pendingCsvFile")

        // Show success toast
        toast({
          title: "CSV file loaded",
          description: `Successfully loaded ${fileInfo.name}`,
        })

        // Redirect to map-columns page
        setIsRedirecting(true)
        setTimeout(() => {
          router.push("/map-columns")
        }, 1000)
      } catch (error) {
        console.error("Error processing pending CSV file:", error)
        toast({
          variant: "destructive",
          title: "Error loading CSV",
          description: "Failed to process the CSV file. Please try uploading again.",
        })
      }
    }
  }, [router, toast])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload TikTok Shop Orders</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5 text-primary" />
            Upload CSV
          </CardTitle>
          <CardDescription>Upload your TikTok Shop orders CSV file</CardDescription>
        </CardHeader>
        <CardContent>
          {isRedirecting ? (
            <div className="text-center py-8">
              <p className="text-lg">CSV file loaded successfully!</p>
              <p className="text-gray-500">Redirecting to column mapping...</p>
            </div>
          ) : (
            <UploadComponent />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
