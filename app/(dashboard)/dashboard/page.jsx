"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scan, History, Gift, TrendingUp, Calendar, MapPin, Award, Leaf, Users, ChevronRight } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalDisposals: 0,
    pointsEarned: 0,
    environmentImpact: 0,
  })

  useEffect(() => {
    // Animate stats on load
    const animateStats = () => {
      const targets = { totalDisposals: 12, pointsEarned: 250, environmentImpact: 8.5 }
      const duration = 1000
      const steps = 50
      const stepTime = duration / steps

      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        const progress = currentStep / steps

        setStats({
          totalDisposals: Math.floor(targets.totalDisposals * progress),
          pointsEarned: Math.floor(targets.pointsEarned * progress),
          environmentImpact: (targets.environmentImpact * progress).toFixed(1),
        })

        if (currentStep >= steps) {
          clearInterval(timer)
          setStats(targets)
        }
      }, stepTime)

      return () => clearInterval(timer)
    }

    animateStats()
  }, [])

  const recentActivity = [
    {
      id: 1,
      medicine: "Paracetamol",
      quantity: "10 Tablets",
      date: "Aug 24, 2025",
      points: 15,
      status: "Completed",
    },
    {
      id: 2,
      medicine: "Crocin",
      quantity: "2 Strips",
      date: "Aug 22, 2025",
      points: 25,
      status: "Completed",
    },
    {
      id: 3,
      medicine: "Amoxicillin",
      quantity: "1 Bottle",
      date: "Aug 20, 2025",
      points: 30,
      status: "Completed",
    },
  ]

  const achievements = [
    { name: "First Disposal", icon: "🎯", earned: true },
    { name: "Eco Warrior", icon: "🌱", earned: true },
    { name: "Community Helper", icon: "🤝", earned: false },
    { name: "Health Guardian", icon: "🛡️", earned: false },
  ]

  return (
    <div className="space-y-6">
      {/* Main CTA Card */}
      <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover-lift">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold mb-2">Ready for Your Next Disposal?</h2>
              <p className="text-primary-foreground/80 text-lg">
                Help create a cleaner environment and contribute to public health data
              </p>
            </div>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4 hover-lift animate-pulse-green" asChild>
              <a href="/disposal/scan">
                <Scan className="mr-2 w-6 h-6" />
                Start New Disposal
                <ChevronRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Disposals</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalDisposals}</p>
                <p className="text-primary text-sm flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +2 this week
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Scan className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Points Earned</p>
                <p className="text-3xl font-bold text-foreground">{stats.pointsEarned}</p>
                <p className="text-secondary text-sm flex items-center mt-1">
                  <Gift className="w-4 h-4 mr-1" />
                  50 points to next reward
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Environmental Impact</p>
                <p className="text-3xl font-bold text-foreground">{stats.environmentImpact}kg</p>
                <p className="text-primary text-sm flex items-center mt-1">
                  <Leaf className="w-4 h-4 mr-1" />
                  CO₂ saved
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2 text-primary" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Scan className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{activity.medicine}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.quantity} • {activity.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">
                    +{activity.points} pts
                  </Badge>
                  <p className="text-xs text-muted-foreground">{activity.status}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rewards & Achievements */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-secondary" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.earned
                      ? "border-primary bg-primary/5 hover:bg-primary/10"
                      : "border-border bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <p className="text-sm font-medium text-foreground">{achievement.name}</p>
                  {achievement.earned && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Earned
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Available Rewards</span>
                <Badge variant="outline">250 Points</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">₹50 Pharmacy Voucher</span>
                  <span className="text-primary">300 pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">₹100 Health Store Credit</span>
                  <span className="text-primary">500 pts</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
                View All Rewards
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col hover-lift bg-transparent">
              <MapPin className="w-6 h-6 mb-2" />
              Find Drop-off Points
            </Button>
            <Button variant="outline" className="h-20 flex-col hover-lift bg-transparent">
              <Users className="w-6 h-6 mb-2" />
              Invite Friends
            </Button>
            <Button variant="outline" className="h-20 flex-col hover-lift bg-transparent">
              <Calendar className="w-6 h-6 mb-2" />
              Schedule Pickup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
