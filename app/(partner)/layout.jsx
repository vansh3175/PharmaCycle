"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Recycle, LogOut } from "lucide-react"

export default function PartnerLayout({ children }) {
  const [pharmacyName] = useState("Gupta Pharmacy") // Mock pharmacy name

  const handleLogout = () => {
    console.log("[v0] Partner logout clicked")
    // Redirect to partner login
    window.location.href = "/partner/login"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Partner Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Recycle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-2xl font-bold text-foreground">Pharma-Cycle</span>
                <span className="text-sm text-muted-foreground ml-2">Partner Portal</span>
              </div>
            </div>

            {/* Pharmacy Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-foreground">{pharmacyName}</div>
                <div className="text-xs text-muted-foreground">Partner Pharmacy</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hover-lift bg-transparent">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
