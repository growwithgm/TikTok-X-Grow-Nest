"use client"

import * as React from "react"
import { Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DeleteConfirmationModalProps {
  onConfirm?: () => void
  children: React.ReactNode
}

export function DeleteConfirmationModal({ 
  onConfirm, 
  children 
}: DeleteConfirmationModalProps) {
  const [open, setOpen] = React.useState(false)

  const handleConfirm = () => {
    onConfirm?.()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Are you sure you want to delete all data? This action cannot be undone and will permanently remove all locally stored order data, column mappings, SKU images, and custom templates.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            className="sm:ml-3"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete All Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}