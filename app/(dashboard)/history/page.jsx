"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { History, Search, Calendar, Package, MapPin, Award, TrendingUp, Leaf } from "lucide-react"
import Link from "next/link"

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const disposalHistory = [
    {
      id: 1,
      medicine: "Paracetamol 500mg",
      brand: "Crocin",
      quantity: "10 Tablets",
      date: "2025-08-24",
      status: "Completed",
      points: 15,
      location: "Apollo Pharmacy, MG Road",
      category: "Pain Relief",
      co2Saved: 0.5,
    },
    {
      id: 2,
      medicine: "Amoxicillin 250mg",
      brand: "Novamox",
      quantity: "1 Bottle",
      date: "2025-08-22",
      status: "Completed",
      points: 30,
      location: "MedPlus, Koramangala",
      category: "Antibiotic",
      co2Saved: 1.2,
    },
    {
      id: 3,
      medicine: "Cetirizine 10mg",
      brand: "Zyrtec",
      quantity: "2 Strips",
      date: "2025-08-20",
      status: "Completed",
      points: 25,
      location: "Guardian Pharmacy, Indiranagar",
      category: "Antihistamine",
      co2Saved: 0.8,
    },
    {
      id: 4,
      medicine: "Omeprazole 20mg",
      brand: "Omez",
      quantity: "1 Strip",
      date: "2025-08-18",
      status: "In Progress",
      points: 20,
      location: "Pending Drop-off",
      category: "Antacid",
      co2Saved: 0.6,
    },
    {
      id: 5,
      medicine: "Metformin 500mg",
      brand: "Glycomet",
      quantity: "3 Strips",
      date: "2025-08-15",
      status: "Completed",
      points: 45,
      location: "Wellness Pharmacy, Whitefield",
      category: "Diabetes",
      co2Saved: 1.5,
    },
  ]

  const filteredHistory = disposalHistory.filter((item) => {
    const matchesSearch =
      item.medicine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || item.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const totalStats = {
    totalDisposals: disposalHistory.length,
    totalPoints: disposalHistory.reduce((sum, item) => sum + item.points, 0),
    totalCO2Saved: disposalHistory.reduce((sum, item) => sum + item.co2Saved, 0),
    completedDisposals: disposalHistory.filter((item) => item.status === "Completed").length,
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 slide-up">
        <div>
          <h1 className="dashboard-title text-foreground flex items-center">
            <History className="w-6 h-6 mr-2 text-primary" />
            Disposal History
          </h1>
          <p className="dashboard-subtitle text-muted-foreground">Track your environmental impact and contributions</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 slide-up">
        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Disposals</p>
                <p className="stat-number text-foreground animate-counter">{totalStats.totalDisposals}</p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points Earned</p>
                <p className="stat-number text-foreground animate-counter">{totalStats.totalPoints}</p>
              </div>
              <Award className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                <p className="stat-number text-foreground animate-counter">{totalStats.totalCO2Saved}kg</p>
              </div>
              <Leaf className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="stat-number text-foreground animate-counter">
                  {Math.round((totalStats.completedDisposals / totalStats.totalDisposals) * 100)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines or brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("completed")}
              >
                Completed
              </Button>
              <Button
                variant={filterStatus === "in progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("in progress")}
              >
                In Progress
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map((item) => (
          <Card key={item.id} className="hover-lift">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{item.medicine}</h3>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.brand} • {item.quantity}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      <MapPin className="w-4 h-4 ml-4 mr-1" />
                      {item.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge variant={item.status === "Completed" ? "default" : "secondary"} className="mb-2">
                      {item.status}
                    </Badge>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-secondary">+{item.points}</p>
                        <p className="text-xs text-muted-foreground">Points</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-primary">{item.co2Saved}kg</p>
                        <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="card-title text-foreground mb-2">No disposals found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start your first medicine disposal to see your history here"}
            </p>
            <Button asChild className="hover-lift">
              <Link href="/dashboard/disposal/scan">Start New Disposal</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
