import Link from "next/link"
import { ArrowLeft, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"

export default function SkuImagesPage() {
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
          
          <h1 className="text-3xl font-bold tracking-tight mb-2">SKU Images</h1>
          <p className="text-muted-foreground">Upload a CSV with SKU and image URL mappings</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image className="mr-2 h-5 w-5" />
              SKU Image Mapping
            </CardTitle>
            <CardDescription>
              Upload a CSV file containing SKU codes and their corresponding image URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Image className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="font-medium mb-2">Upload SKU Images CSV</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  CSV should contain columns: SKU, Image_URL
                </p>
                <Button size="sm">Choose File</Button>
              </div>
              
              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Expected CSV Format:</h4>
                <code className="text-sm bg-background p-2 rounded border block">
                  SKU,Image_URL<br />
                  PROD001,https://example.com/image1.jpg<br />
                  PROD002,https://example.com/image2.jpg
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}