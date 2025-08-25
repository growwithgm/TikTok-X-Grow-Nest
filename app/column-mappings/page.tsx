"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ColumnMappingsPage() {
  const { toast } = useToast()
  const [mappings, setMappings] = useState<Record<string, string[]>>({})
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null)
  const [newMappingName, setNewMappingName] = useState("")

  // Define required fields
  const requiredFields = [
    { id: "orderId", label: "Order ID" },
    { id: "productName", label: "Product Name" },
    { id: "sku", label: "SKU" },
    { id: "sellerSku", label: "Seller SKU" },
    { id: "quantity", label: "Quantity" },
    { id: "buyerUsername", label: "Buyer Username" },
    { id: "recipientName", label: "Recipient Name" },
    { id: "phoneNumber", label: "Phone Number" },
    { id: "addressLine1", label: "Address Line 1" },
    { id: "addressLine2", label: "Address Line 2" },
    { id: "city", label: "City" },
    { id: "state", label: "State" },
    { id: "postalCode", label: "Postal Code" },
  ]

  useEffect(() => {
    // Load mappings from localStorage
    const storedMappings = localStorage.getItem("columnMappings")
    if (storedMappings) {
      setMappings(JSON.parse(storedMappings))
    }
  }, [])

  const handleDeleteMapping = (name: string) => {
    const updatedMappings = { ...mappings }
    delete updatedMappings[name]

    localStorage.setItem("columnMappings", JSON.stringify(updatedMappings))
    setMappings(updatedMappings)

    if (selectedMapping === name) {
      setSelectedMapping(null)
    }

    toast({
      title: "Mapping deleted",
      description: `Column mapping "${name}" has been deleted`,
    })
  }

  const handleCreateMapping = () => {
    if (!newMappingName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter a name for the new mapping",
      })
      return
    }

    if (mappings[newMappingName]) {
      toast({
        variant: "destructive",
        title: "Name already exists",
        description: `A mapping named "${newMappingName}" already exists`,
      })
      return
    }

    // Create empty mapping
    const newMapping = Array(requiredFields.length).fill("")
    const updatedMappings = {
      ...mappings,
      [newMappingName]: newMapping,
    }

    localStorage.setItem("columnMappings", JSON.stringify(updatedMappings))
    setMappings(updatedMappings)
    setSelectedMapping(newMappingName)
    setNewMappingName("")

    toast({
      title: "Mapping created",
      description: `Column mapping "${newMappingName}" has been created`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-xl font-bold mb-2">Manage Column Mappings</h1>
          <p className="text-gray-600 mb-6">
            Create and manage column mappings for different CSV formats. These mappings will help you process CSV files
            with different column structures.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Create New Mapping</h2>

              <div className="flex gap-2">
                <Input
                  value={newMappingName}
                  onChange={(e) => setNewMappingName(e.target.value)}
                  placeholder="Enter mapping name"
                />
                <Button onClick={handleCreateMapping}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  {Object.keys(mappings).length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mapping Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.keys(mappings).map((name) => (
                          <tr
                            key={name}
                            className={selectedMapping === name ? "bg-blue-50" : ""}
                            onClick={() => setSelectedMapping(name)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteMapping(name)
                                }}
                                className="text-red-600 hover:text-red-900"
                                disabled={name === "default"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-gray-500">No column mappings saved yet</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">Mapping Details</h2>

              {selectedMapping ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700">{selectedMapping} Mapping</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {requiredFields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{field.label}:</span>
                          <span className="text-sm text-gray-500">
                            {mappings[selectedMapping][index] || "Not mapped"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-6 text-center text-gray-500">Select a mapping to view details</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
