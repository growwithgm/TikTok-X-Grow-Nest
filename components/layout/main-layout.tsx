"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Settings, ImageIcon, Home, Menu, X, Moon, Sun, HelpCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  // Navigation items
  const navItems = [
    { href: "/", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/map-columns", label: "Map Columns", icon: <FileText className="h-5 w-5" /> },
    { href: "/sku-images", label: "SKU Images", icon: <ImageIcon className="h-5 w-5" /> },
    { href: "/templates", label: "Templates", icon: <FileText className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  // Ensure theme component doesn't render until mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get current page title
  const getPageTitle = () => {
    const currentPath = pathname || "/"

    if (currentPath === "/") return "Dashboard"
    if (currentPath === "/map-columns") return "Map Columns"
    if (currentPath === "/sku-images") return "SKU Images"
    if (currentPath === "/templates") return "Templates"
    if (currentPath === "/settings") return "Settings"
    if (currentPath === "/results") return "Results"

    // Remove leading slash and capitalize
    return currentPath
      .substring(1)
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <Link href="/" className="flex items-center">
                <img src="/images/tiktok-shop-logo.png" alt="TikTok Shop Logo" className="h-8 mr-2" />
                <span className="font-semibold text-lg hidden sm:inline-block">TikTok Shop Order Printer</span>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <HelpCircle className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Help</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Documentation</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuItem>About</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline-block">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Hidden on mobile unless toggled */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out pt-16",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <nav className="px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                )}
              >
                <span className="mr-3 text-primary">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            "md:ml-64", // Margin for sidebar on desktop
          )}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
