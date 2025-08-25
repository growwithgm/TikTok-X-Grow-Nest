"use client"

import type React from "react"

import { useState, useRef } from "react"
import { UploadIcon, FileText, AlertCircle, Loader2, HelpCircle, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const router = useRouter()
  const [csvSample, setCsvSample] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    processFile(selectedFile)
  }

  const processFile = (selectedFile?: File) => {
    setError(null)
    setCsvHeaders([])
    setCsvSample(null)

    if (!selectedFile) return

    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file")
      setFile(null)
      return
    }

    setFile(selectedFile)

    // Preview CSV headers
    if (selectedFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        if (text) {
          try {
            // Check if the file is empty
            if (!text.trim()) {
              setError("The CSV file is empty")
              return
            }

            // Check if the file has valid CSV format
            const lines = text.split("\n")
            if (lines.length === 0) {
              setError("The CSV file is empty")
              return
            }

            // Get the first line (headers)
            const firstLine = lines[0].trim()
            if (!firstLine) {
              setError("The CSV file has no headers")
              return
            }

            // Check if the file has commas (basic CSV validation)
            if (!firstLine.includes(",")) {
              setError("The file doesn't appear to be a valid CSV. Make sure it uses commas as separators.")
              return
            }

            // Extract headers
            const headers = firstLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
            setCsvHeaders(headers)

            // Store a sample of the CSV for debugging
            const sampleLines = lines.slice(0, Math.min(5, lines.length)).join("\n")
            setCsvSample(sampleLines)

            console.log("CSV Headers:", headers)
            console.log("CSV Sample:", sampleLines)

            // Show success toast
            toast({
              title: "CSV file loaded",
              description: `Successfully loaded ${selectedFile.name}`,
              variant: "default",
            })
          } catch (error) {
            console.error("Error parsing CSV:", error)
            setError(`Error parsing CSV: ${error instanceof Error ? error.message : "Unknown error"}`)
          }
        }
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    processFile(droppedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(10)

    try {
      // Read the file and store it temporarily
      const reader = new FileReader()

      reader.onload = (e) => {
        const csvContent = e.target?.result as string
        if (csvContent) {
          try {
            // Basic validation
            if (!csvContent.trim()) {
              throw new Error("The CSV file is empty")
            }

            const lines = csvContent.split("\n")
            if (lines.length <= 1) {
              throw new Error("The CSV file contains only headers or is empty")
            }

            // Store the CSV content and headers in localStorage
            localStorage.setItem("csvContent", csvContent)
            localStorage.setItem("csvHeaders", JSON.stringify(csvHeaders))

            // Simulate progress
            setProgress(100)

            // Redirect to the column mapping page
            toast({
              title: "CSV file uploaded",
              description: "Please map the columns to continue",
            })

            // Wait a moment to show 100% progress before redirecting
            setTimeout(() => {
              router.push("/map-columns")
            }, 500)
          } catch (error) {
            setError(`Error processing CSV: ${error instanceof Error ? error.message : "Unknown error"}`)
            setProgress(0)
            setIsProcessing(false)
          }
        }
      }

      reader.onerror = () => {
        setError("Error reading the file. Please try again.")
        setProgress(0)
        setIsProcessing(false)
      }

      reader.readAsText(file)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "See error details below",
      })
      setIsProcessing(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setCsvHeaders([])
    setCsvSample(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="whitespace-pre-line">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="mt-2">{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:bg-gray-50",
          "cursor-pointer",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          id="file-upload"
          ref={fileInputRef}
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center">
          {file ? (
            <div className="relative">
              <div className="flex items-center justify-center bg-green-50 rounded-full p-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation()
                  clearFile()
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-full p-3 mb-4">
              <UploadIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <p className="text-lg font-medium text-gray-700 mb-1">
            {file ? file.name : "Drag & drop your CSV file here"}
          </p>
          <p className="text-sm text-gray-500">
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse files (TikTok Shop CSV format)"}
          </p>
        </div>
      </div>

      {file && csvHeaders.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Detected CSV Headers:</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-gray-500 cursor-help">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    CSV Format Help
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="text-xs">
                    Your CSV should have headers for Order ID, Product Name, SKU, Seller SKU, Quantity, Buyer Username,
                    Recipient Name, Phone Number, and Address fields. Make sure the file uses commas as separators.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
            {csvHeaders.map((header, index) => (
              <div key={index} className="mb-1">
                <span className="font-medium">Column {index + 1}:</span> {header}
              </div>
            ))}
          </div>
        </div>
      )}

      {csvSample && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">CSV Sample:</h3>
          <pre className="text-xs text-gray-600 max-h-32 overflow-y-auto whitespace-pre-wrap">{csvSample}</pre>
        </div>
      )}

      {file && !isProcessing && (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">{file.name}</span>
          </div>
          <Button variant="default" onClick={handleUpload} disabled={csvHeaders.length === 0}>
            Continue to Column Mapping
          </Button>
        </div>
      )}

      {isProcessing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Processing file...</span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-center">
            <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
          </div>
        </div>
      )}
    </div>
  )
}
