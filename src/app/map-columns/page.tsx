import Link from "next/link"
import { ArrowLeft, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"

export default function MapColumnsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight mb-2">Map Columns</h1>
          <p className="text-muted-foreground">Configure how your CSV columns map to order data</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Column Mapping Configuration
            </CardTitle>
            <CardDescription>
              Map your CSV columns to the required order data fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This feature allows you to configure how your CSV columns map to the required order data fields for generating packing slips.
              </p>
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm font-medium">Coming Soon</p>
                <p className="text-sm text-muted-foreground">Column mapping functionality will be available in the next update.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}