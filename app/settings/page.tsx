"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogoManager } from "@/components/logo-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
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
          <h1 className="text-xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600 mb-6">Customize your TikTok Shop Order Printer settings and preferences.</p>

          <Tabs defaultValue="logo">
            <TabsList className="mb-6">
              <TabsTrigger value="logo">Logo</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="logo">
              <LogoManager />
            </TabsContent>

            <TabsContent value="appearance">
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Appearance Settings</h2>
                <p className="text-sm text-gray-600">
                  Customize the appearance of your packing slips. More options coming soon.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
