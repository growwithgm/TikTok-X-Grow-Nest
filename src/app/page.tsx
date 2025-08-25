"use client"

import { Upload, Settings, Image, FileText, Eye, Trash2 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { FeatureCard } from "@/components/feature-card"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const handleDeleteAllData = () => {
    // Here you would implement the actual data deletion logic
    console.log("Deleting all data...")
    // For now, just log to console
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-rose-400/20 to-pink-600/20 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-600/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-600/10 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <SiteHeader />
      
      <main className="relative">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              TikTok Shop Order Printer
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-indigo-600 dark:from-rose-400 dark:to-indigo-400"> X Grow Nest</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Generate professional packing slips for your TikTok Shop orders with just a few clicks
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12">
            <FeatureCard
              title="Upload Orders"
              description="Upload your TikTok Shop order CSV file to generate packing slips"
              icon={Upload}
              href="/upload"
              accentColor="rose"
            />
            <FeatureCard
              title="Map Columns"
              description="Configure how your CSV columns map to order data"
              icon={Settings}
              href="/map-columns"
              accentColor="indigo"
            />
            <FeatureCard
              title="SKU Images"
              description="Upload a CSV with SKU and image URL mappings"
              icon={Image}
              href="/sku-images"
              accentColor="emerald"
            />
            <FeatureCard
              title="Custom Templates"
              description="Create application settings and preferences"
              icon={FileText}
              href="/templates"
              accentColor="violet"
            />
            <FeatureCard
              title="View Results"
              description="View and print your generated packing slips"
              icon={Eye}
              href="/results"
              accentColor="amber"
            />
          </div>

          {/* Delete All Data Button */}
          <div className="flex justify-center">
            <DeleteConfirmationModal onConfirm={handleDeleteAllData}>
              <Button
                variant="destructive"
                size="lg"
                className="rounded-xl px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Delete All Data
              </Button>
            </DeleteConfirmationModal>
          </div>
        </div>
      </main>
    </div>
  )
}
