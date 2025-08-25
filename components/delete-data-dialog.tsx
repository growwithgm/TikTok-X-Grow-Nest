"use client"

import type React from "react"

import { useState } from "react"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DeleteDataDialogProps {
  trigger?: React.ReactNode
}

export function DeleteDataDialog({ trigger }: DeleteDataDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteOptions, setDeleteOptions] = useState({
    orderData: true,
    skuImages: false,
    templates: false,
    settings: false,
  })
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      // Simulate deletion process with a small delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      const deletedItems: string[] = []

      // Delete order data
      if (deleteOptions.orderData) {
        localStorage.removeItem("csvContent")
        localStorage.removeItem("csvHeaders")
        localStorage.removeItem("columnMapping")
        localStorage.removeItem("packingSlips")
        deletedItems.push("Order data")
      }

      // Delete SKU images
      if (deleteOptions.skuImages) {
        localStorage.removeItem("skuImages")
        deletedItems.push("SKU image mappings")
      }

      // Delete templates
      if (deleteOptions.templates) {
        localStorage.removeItem("customTemplates")
        localStorage.removeItem("defaultTemplate")
        deletedItems.push("Custom templates")
      }

      // Delete settings
      if (deleteOptions.settings) {
        localStorage.removeItem("pdfSettings")
        localStorage.removeItem("appSettings")
        deletedItems.push("Application settings")
      }

      // Show success message
      toast({
        title: "Data deleted successfully",
        description: `Deleted: ${deletedItems.join(", ")}`,
        variant: "default",
      })

      // Close dialog
      setOpen(false)
    } catch (err) {
      setError(`Failed to delete data: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Application Data
          </DialogTitle>
          <DialogDescription>
            This will permanently delete selected data from the application. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-order-data"
                checked={deleteOptions.orderData}
                onCheckedChange={(checked) => setDeleteOptions((prev) => ({ ...prev, orderData: checked === true }))}
              />
              <label
                htmlFor="delete-order-data"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Order data (CSV content, column mappings, generated packing slips)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-sku-images"
                checked={deleteOptions.skuImages}
                onCheckedChange={(checked) => setDeleteOptions((prev) => ({ ...prev, skuImages: checked === true }))}
              />
              <label
                htmlFor="delete-sku-images"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                SKU image mappings
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-templates"
                checked={deleteOptions.templates}
                onCheckedChange={(checked) => setDeleteOptions((prev) => ({ ...prev, templates: checked === true }))}
              />
              <label
                htmlFor="delete-templates"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Custom templates
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-settings"
                checked={deleteOptions.settings}
                onCheckedChange={(checked) => setDeleteOptions((prev) => ({ ...prev, settings: checked === true }))}
              />
              <label
                htmlFor="delete-settings"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Application settings
              </label>
            </div>
          </div>

          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action will permanently delete the selected data from your browser's storage. You will need to
              re-upload and reconfigure any deleted data.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={
              isDeleting ||
              (!deleteOptions.orderData &&
                !deleteOptions.skuImages &&
                !deleteOptions.templates &&
                !deleteOptions.settings)
            }
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Selected Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
