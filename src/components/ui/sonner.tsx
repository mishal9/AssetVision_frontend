"use client"

import { useTheme } from "next-themes"
import { useAppSelector } from "@/store"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme: nextTheme } = useTheme()
  // Use Redux theme as the source of truth
  const reduxTheme = useAppSelector((state) => state.app.theme)
  // Prefer Redux theme but fall back to next-themes if not available
  const theme = reduxTheme || nextTheme || "system"

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
