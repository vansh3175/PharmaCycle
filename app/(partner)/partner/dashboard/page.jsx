"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  Package,
  TrendingUp,
  Hash,
  User,
  Calendar,
  X,
  Award,
  Leaf,
  Users,
  Clock,
  MapPin,
  Star,
  Activity,
} from "lucide-react"

export default function PartnerDashboardPage() {
  const [currentState, setCurrentState] = useState("ready") // ready, confirm, success
  const [disposalCode, setDisposalCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [stats, setStats] = useState({
    todayCount: 0,
    monthCount: 0,
    totalCount: 0,
    co2Saved: 0,
    rating: 4.8,
    activeUsers: 0,
  })

  const [recentActivity] = useState([
    { id: 1, user: "Priya S.", time: "2 mins ago", items: 2, code: "A4T92C" },
    { id: 2, user: "Rahul M.", time: "15 mins ago", items: 1, code: "B7X3K9" },
    { id: 3, user: "Anita K.", time: "32 mins ago", items: 3, code: "C2M8P5" },
    { id: 4, user: "Vikram R.", time: "1 hour ago", items: 1, code: "D9Q4L7" },
  ])

  useEffect(() => {
    const animateStats = () => {
      const targetStats = {
        todayCount: 7,
        monthCount: 152,
        totalCount: 1847,
        co2Saved: 23.4,
        rating: 4.8,
        activeUsers: 89,
      }

      Object.keys(targetStats).forEach((key) => {
        let current = 0
        const target = targetStats[key]
        const increment = target / 50

        const timer = setInterval(() => {
          current += increment
          if (current >= target) {
            current = target
            clearInterval(timer)
          }
          setStats((prev) => ({ ...prev, [key]: Math.floor(current * 10) / 10 }))
        }, 30)
      })
    }

    animateStats()
  }, [])

  // Mock disposal data for confirmation
  const mockDisposal = {
    user: "Priya S.",
    code: "A4T92C",
    items: ["1 x Crocin Advance (Strip)", "1 x Cough Syrup (Bottle)"],
    location: "Sector 15, Noida",
    timestamp: "Today, 2:45 PM",
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    console.log("[v0] Verifying disposal code:", disposalCode)

    setTimeout(() => {
      if (disposalCode.toUpperCase() === "A4T92C" || disposalCode.length === 6) {
        console.log("[v0] Code verification successful")
        setCurrentState("confirm")
      } else {
        console.log("[v0] Code verification failed")
        alert("Invalid disposal code. Please try again.")
      }
      setIsLoading(false)
    }, 800)
  }

  const handleConfirmDisposal = () => {
    console.log("[v0] Disposal confirmed for code:", disposalCode)
    setCurrentState("success")

    setTimeout(() => {
      setCurrentState("ready")
      setDisposalCode("")
      console.log("[v0] Dashboard reset to ready state")
    }, 3000)
  }

  const handleCancel = () => {
    console.log("[v0] Disposal verification cancelled")
    setCurrentState("ready")
    setDisposalCode("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="dashboard-title text-5xl text-foreground mb-2 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                Partner Dashboard
              </h1>
              <p className="dashboard-subtitle text-xl text-muted-foreground">
                Verify and process medicine disposals efficiently
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="font-semibold text-lg">{stats.rating}</span>
                <span className="text-sm text-muted-foreground ml-1">Rating</span>
              </div>
              <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
                <Activity className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-semibold text-lg">{stats.activeUsers}</span>
                <span className="text-sm text-muted-foreground ml-1">Active Users</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="hover-lift bg-white/80 backdrop-blur-sm border-green-200 shadow-xl">
              <CardContent className="p-8">
                {/* Ready State */}
                {currentState === "ready" && (
                  <div className="text-center slide-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg animate-pulse">
                      <Hash className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="dashboard-title text-4xl text-foreground mb-6 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                      Verify a Disposal
                    </h2>

                    <form onSubmit={handleVerifyCode} className="max-w-md mx-auto space-y-8">
                      <div className="space-y-4">
                        <Label htmlFor="code" className="text-xl font-semibold text-gray-700">
                          Enter User's 6-Digit Disposal Code
                        </Label>
                        <Input
                          id="code"
                          value={disposalCode}
                          onChange={(e) => setDisposalCode(e.target.value.toUpperCase())}
                          placeholder="A4T92C"
                          className="text-center text-2xl font-mono tracking-wider h-16 border-2 border-green-200 focus:border-green-500 rounded-xl shadow-sm"
                          maxLength={6}
                          required
                        />
                        <div className="text-sm text-muted-foreground">{disposalCode.length}/6 characters</div>
                      </div>

                      <button
                        type="submit"
                        className="w-full text-xl py-5 px-8 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                        disabled={isLoading || disposalCode.length !== 6}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            Verifying...
                          </div>
                        ) : (
                          "Verify Disposal Code"
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Confirm State */}
                {currentState === "confirm" && (
                  <div className="slide-up">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Package className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="dashboard-title text-4xl text-foreground mb-2">Review & Confirm Disposal</h2>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 mb-8 space-y-6 border border-green-200">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-600">User:</span>
                          <div className="flex items-center">
                            <User className="w-5 h-5 mr-2 text-green-600" />
                            <span className="font-bold text-lg">{mockDisposal.user}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-600">Location:</span>
                          <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-green-600" />
                            <span className="font-bold">{mockDisposal.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-600">Code:</span>
                          <Badge
                            variant="secondary"
                            className="font-mono text-lg px-4 py-2 bg-green-100 text-green-800"
                          >
                            {mockDisposal.code}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-600">Time:</span>
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-green-600" />
                            <span className="font-bold">{mockDisposal.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-600 mb-4 block text-lg">Items to be Disposed:</span>
                        <div className="space-y-3">
                          {mockDisposal.items.map((item, index) => (
                            <div key={index} className="flex items-center bg-white rounded-lg p-3 shadow-sm">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                              <span className="font-medium">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={handleConfirmDisposal}
                        className="flex-1 text-xl py-5 px-8 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                      >
                        <CheckCircle className="mr-3 w-6 h-6" />
                        Confirm & Complete Disposal
                      </button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="lg"
                        className="px-8 hover-lift bg-white border-2 border-gray-300 hover:border-red-400 hover:text-red-600"
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Success State */}
                {currentState === "success" && (
                  <div className="text-center slide-up">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg animate-bounce">
                      <CheckCircle className="w-14 h-14 text-white" />
                    </div>

                    <h2 className="dashboard-title text-4xl text-green-600 mb-6">Success!</h2>
                    <p className="text-xl text-gray-600 mb-6">Disposal has been completed successfully.</p>
                    <div className="bg-green-50 rounded-lg p-4 mb-6">
                      <p className="text-green-700 font-semibold">+2.3 kg CO₂ saved • +50 points earned</p>
                    </div>
                    <div className="text-lg text-muted-foreground">Returning to verification screen...</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Enhanced Statistics Cards */}
            <div className="grid gap-4">
              <Card className="hover-lift bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="card-title flex items-center text-green-700">
                    <Calendar className="w-6 h-6 mr-3 text-green-600" />
                    Today's Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="stat-number text-5xl animate-counter font-bold text-green-600 mb-2">
                    {stats.todayCount}
                  </div>
                  <p className="dashboard-subtitle text-gray-600 mb-3">Verified disposals</p>
                  <div className="flex items-center text-sm text-green-600">
                    <Leaf className="w-4 h-4 mr-1" />
                    <span>{(stats.todayCount * 0.33).toFixed(1)} kg CO₂ saved</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="card-title flex items-center text-green-700">
                    <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
                    Monthly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="stat-number text-5xl font-bold text-green-600 animate-counter mb-2">
                    {stats.monthCount}
                  </div>
                  <p className="dashboard-subtitle text-gray-600 mb-3">Total this month</p>
                  <Progress value={75} className="mb-2" />
                  <p className="text-sm text-gray-500">75% of monthly target (200)</p>
                </CardContent>
              </Card>

              <Card className="hover-lift bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="card-title flex items-center text-green-700">
                    <Award className="w-6 h-6 mr-3 text-green-600" />
                    Total Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="stat-number text-4xl font-bold text-green-600 animate-counter mb-2">
                    {stats.totalCount}
                  </div>
                  <p className="dashboard-subtitle text-gray-600 mb-3">All-time disposals</p>
                  <div className="text-sm text-green-600 font-semibold">{stats.co2Saved} kg CO₂ prevented</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Feed */}
            <Card className="hover-lift bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="card-title flex items-center text-green-700">
                  <Users className="w-6 h-6 mr-3 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{activity.user}</p>
                        <p className="text-sm text-gray-600">
                          {activity.items} items • {activity.time}
                        </p>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs bg-white border-green-300 text-green-700">
                        {activity.code}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
