import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"

export default function TemplatesPage() {
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
          
          <h1 className="text-3xl font-bold tracking-tight mb-2">Custom Templates</h1>
          <p className="text-muted-foreground">Create application settings and preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Packing Slip Templates
              </CardTitle>
              <CardDescription>
                Customize the layout and content of your packing slips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-lg border p-3 bg-muted/50">
                  <p className="font-medium text-sm">Default Template</p>
                  <p className="text-xs text-muted-foreground">Standard packing slip format</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Create New Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Configure general application preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-lg border p-3 bg-muted/50">
                  <p className="font-medium text-sm">Print Settings</p>
                  <p className="text-xs text-muted-foreground">Paper size, margins, and orientation</p>
                </div>
                <div className="rounded-lg border p-3 bg-muted/50">
                  <p className="font-medium text-sm">Data Preferences</p>
                  <p className="text-xs text-muted-foreground">Default column mappings and formats</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Edit Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}