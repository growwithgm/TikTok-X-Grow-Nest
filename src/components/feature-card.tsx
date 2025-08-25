import * as React from "react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  accentColor: "rose" | "indigo" | "emerald" | "violet" | "amber"
  className?: string
}

const accentColorMap = {
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    icon: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800/30",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    icon: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800/30",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/30",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/20",
    icon: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800/30",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    icon: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/30",
  },
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  accentColor,
  className,
}: FeatureCardProps) {
  const colors = accentColorMap[accentColor]

  return (
    <Link href={href} className="group block">
      <Card
        className={cn(
          "glass-card h-full transition-all duration-300",
          "hover:scale-105 hover:shadow-xl hover:-translate-y-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "cursor-pointer",
          className
        )}
      >
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-start space-x-4 mb-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
                colors.bg,
                colors.border,
                "group-hover:scale-110 transition-transform duration-300"
              )}
            >
              <Icon className={cn("h-6 w-6", colors.icon)} aria-hidden="true" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold tracking-tight mb-2 group-hover:text-foreground/90 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          <div className="mt-4 flex items-center text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Get started
            <svg
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}