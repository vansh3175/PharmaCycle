"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Package,
  Hash,
  User,
  X,
  MapPin,
  Star,
  Activity,
  AlertCircle,
  Loader2,
  Clock,
  Award
} from "lucide-react"

export default function PartnerDashboardPage() {
  const [currentState, setCurrentState] = useState("ready") // ready, confirm, success, error
  const [disposalCode, setDisposalCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentDisposal, setCurrentDisposal] = useState(null)
  const [error, setError] = useState(null)
  const [recentDisposals, setRecentDisposals] = useState([])

  const [stats, setStats] = useState({
    todayCount: 0,
    monthCount: 0,
    totalCount: 0,
    co2Saved: 0,
    rating: 4.8,
    activeUsers: 0,
  })

  useEffect(() => {
    // Fetch partner dashboard data
    const fetchPartnerData = async () => {
      try {
        const response = await fetch('/api/partner/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setRecentDisposals(data.recentDisposals.map(disposal => ({
            id: disposal._id,
            disposalCode: disposal.disposalCode,
            userName: disposal.user?.name || 'Unknown User',
            items: disposal.items || [],
            status: disposal.status,
            completedAt: disposal.completedAt || disposal.createdAt,
            userLocation: disposal.userLocation || {}
          })));
        } else {
          // Fallback to mock data if API fails
          const mockRecentDisposals = [
            {
              id: 1,
              disposalCode: "ABC123",
              userName: "Priya S.",
              items: [{ medicineName: "Paracetamol", qty: 2 }, { medicineName: "Cough Syrup", qty: 1 }],
              status: "Completed",
              completedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
              userLocation: { city: "Delhi" }
            }
          ];
          setRecentDisposals(mockRecentDisposals);
        }
      } catch (error) {
        console.error('Failed to fetch partner data:', error);
        // Use fallback data
        setRecentDisposals([]);
      }
    };

    fetchPartnerData();
  }, [])

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/partner/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disposalCode: disposalCode.toUpperCase() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify code')
      }

      setCurrentDisposal(data.disposal)
      setCurrentState("confirm")
    } catch (err) {
      setError(err.message)
      setCurrentState("ready")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDisposal = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/partner/verify', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          disposalCode: currentDisposal.disposalCode,
          pharmacyCode: 'PHARMACY_001'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete disposal')
      }

      setCurrentState("success")
      
      // Add to recent disposals list
      const completedDisposal = {
        id: Date.now(),
        disposalCode: currentDisposal.disposalCode,
        userName: currentDisposal.user?.name || 'Unknown User',
        items: currentDisposal.items || [],
        status: "Completed",
        completedAt: new Date().toISOString(),
        userLocation: currentDisposal.userLocation || {}
      };
      
      setRecentDisposals(prev => [completedDisposal, ...prev.slice(0, 4)]); // Keep latest 5
      
      setTimeout(() => {
        setCurrentState("ready")
        setDisposalCode("")
        setCurrentDisposal(null)
        setError(null)
      }, 3000)
    } catch (err) {
      setError(err.message)
      setCurrentState("ready")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setCurrentState("ready")
    setDisposalCode("")
    setCurrentDisposal(null)
    setError(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                Partner Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
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

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-destructive mr-2" />
                <p className="text-destructive font-medium">{error}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancel}
                  className="ml-auto"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-xl">
              <CardContent className="p-8">
                {/* Ready State */}
                {currentState === "ready" && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                      <Hash className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                      Verify a Disposal
                    </h2>

                    <form onSubmit={handleVerifyCode} className="max-w-md mx-auto space-y-8">
                      <div className="space-y-4">
                        <Label htmlFor="code" className="text-xl font-semibold text-gray-700">
                          Enter User's Disposal Code
                        </Label>
                        <Input
                          id="code"
                          value={disposalCode}
                          onChange={(e) => setDisposalCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                          placeholder="PH1337425"
                          className="text-center text-xl font-mono tracking-wider h-16 border-2 border-green-200 focus:border-green-500 rounded-xl shadow-sm"
                          maxLength={10}
                          minLength={6}
                          required
                        />
                        <div className="text-sm text-muted-foreground">{disposalCode.length} characters</div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full text-xl py-6 px-8 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600"
                        disabled={isLoading || disposalCode.length < 6}
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify Disposal Code"
                        )}
                      </Button>
                    </form>
                  </div>
                )}

                {/* Confirm State */}
                {currentState === "confirm" && currentDisposal && (
                  <div>
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Package className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold mb-2">Review & Confirm Disposal</h2>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 mb-8 space-y-6 border border-green-200">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-600">User:</span>
                          <div className="flex items-center">
                            <User className="w-5 h-5 mr-2 text-green-600" />
                            <span className="font-bold text-lg">{currentDisposal.user?.name || 'Unknown User'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-600">Location:</span>
                          <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-green-600" />
                            <span className="font-bold">{currentDisposal.userLocation?.city || 'Not specified'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-600">Code:</span>
                          <Badge
                            variant="secondary"
                            className="font-mono text-lg px-4 py-2 bg-green-100 text-green-800"
                          >
                            {currentDisposal.disposalCode}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-600">Created:</span>
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-green-600" />
                            <span className="font-bold">{formatDate(currentDisposal.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-600 mb-4 block text-lg">Items to be Disposed:</span>
                        <div className="space-y-3">
                          {currentDisposal.items?.map((item, index) => (
                            <div key={index} className="flex items-center bg-white rounded-lg p-3 shadow-sm">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                              <span className="font-medium">
                                {item.qty} x {item.medicineName} ({item.category})
                              </span>
                            </div>
                          )) || []}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-green-200">
                        <span className="font-semibold text-gray-600">Total Items:</span>
                        <span className="text-2xl font-bold text-green-600">{currentDisposal.items?.length || 0}</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={handleConfirmDisposal}
                        className="flex-1 text-xl py-6 px-8 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600"
                        disabled={isLoading}
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-3 w-6 h-6" />
                            Confirm & Complete Disposal
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="lg"
                        className="px-8 border-2 border-gray-300 hover:border-red-400 hover:text-red-600"
                        disabled={isLoading}
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Success State */}
                {currentState === "success" && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-green-600 mb-4">Disposal Completed!</h2>
                    <p className="text-lg text-gray-600 mb-6">
                      The disposal has been successfully verified and completed. The user will be notified and rewarded with points.
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <Award className="w-5 h-5" />
                      <span className="font-medium">Points awarded to user</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <Activity className="w-5 h-5 mr-2" />
                  Today's Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disposals Verified:</span>
                  <span className="font-bold text-2xl text-green-600">{stats.todayCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CO2 Saved:</span>
                  <span className="font-bold text-lg text-green-600">{stats.co2Saved} kg</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-700">Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Verified:</span>
                  <span className="font-bold text-xl text-green-600">{stats.monthCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">All Time:</span>
                  <span className="font-bold text-lg text-green-600">{stats.totalCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-700">Recent Completed Disposals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentDisposals.length > 0 ? recentDisposals.map((disposal) => (
                  <div key={disposal.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-green-800">{disposal.userName}</p>
                        <p className="text-sm text-green-600">Code: {disposal.disposalCode}</p>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Completed
                      </Badge>
                    </div>
                    <div className="text-xs text-green-600">
                      <p>{disposal.items.length} items • {disposal.userLocation?.city || 'Unknown location'}</p>
                      <p>{formatDate(disposal.completedAt)}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-4">No recent disposals</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
