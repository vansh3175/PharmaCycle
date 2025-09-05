"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, Star, Trophy, Zap, ShoppingCart, Heart } from "lucide-react"
import Link from "next/link"

export default function RewardsPage() {
  const [userPoints] = useState(250)

  const availableRewards = [
    {
      id: 1,
      title: "₹50 Pharmacy Voucher",
      description: "Redeem at any partner pharmacy",
      points: 300,
      category: "Healthcare",
      icon: "💊",
      available: true,
      popular: true,
    },
    {
      id: 2,
      title: "₹100 Health Store Credit",
      description: "Use at wellness and health stores",
      points: 500,
      category: "Wellness",
      icon: "🏥",
      available: true,
      popular: false,
    },
    {
      id: 3,
      title: "Free Health Checkup",
      description: "Basic health screening at partner clinics",
      points: 800,
      category: "Healthcare",
      icon: "🩺",
      available: true,
      popular: true,
    },
    {
      id: 4,
      title: "Eco-Friendly Kit",
      description: "Sustainable living starter pack",
      points: 400,
      category: "Environment",
      icon: "🌱",
      available: true,
      popular: false,
    },
    {
      id: 5,
      title: "₹200 Grocery Voucher",
      description: "Redeem at major grocery chains",
      points: 1000,
      category: "Lifestyle",
      icon: "🛒",
      available: false,
      popular: true,
    },
    {
      id: 6,
      title: "Plant a Tree Certificate",
      description: "We'll plant a tree in your name",
      points: 150,
      category: "Environment",
      icon: "🌳",
      available: true,
      popular: false,
    },
  ]

  const achievements = [
    {
      title: "First Disposal",
      description: "Complete your first medicine disposal",
      points: 50,
      earned: true,
      icon: "🎯",
    },
    {
      title: "Eco Warrior",
      description: "Dispose 10 medicines responsibly",
      points: 100,
      earned: true,
      icon: "🌱",
    },
    {
      title: "Community Helper",
      description: "Refer 5 friends to join Pharma-Cycle",
      points: 200,
      earned: false,
      icon: "🤝",
    },
    {
      title: "Health Guardian",
      description: "Dispose 50 medicines safely",
      points: 500,
      earned: false,
      icon: "🛡️",
    },
  ]

  const recentRedemptions = [
    {
      id: 1,
      reward: "₹50 Pharmacy Voucher",
      date: "2025-08-20",
      status: "Used",
      points: 300,
    },
    {
      id: 2,
      reward: "Plant a Tree Certificate",
      date: "2025-08-15",
      status: "Active",
      points: 150,
    },
  ]

  const handleRedeem = (reward) => {
    if (userPoints >= reward.points) {
      console.log(`Redeeming ${reward.title} for ${reward.points} points`)
      alert(`Successfully redeemed ${reward.title}! Check your email for details.`)
    } else {
      alert(`You need ${reward.points - userPoints} more points to redeem this reward.`)
    }
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 slide-up">
        <div>
          <h1 className="dashboard-title text-foreground flex items-center">
            <Gift className="w-6 h-6 mr-2 text-secondary" />
            Rewards & Points
          </h1>
          <p className="dashboard-subtitle text-muted-foreground">Redeem your points for amazing rewards</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Available Points</p>
            <p className="stat-number text-secondary animate-counter">{userPoints}</p>
          </div>
        </div>
      </div>

      {/* Points Progress */}
      <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Next Milestone</h3>
              <p className="text-sm text-muted-foreground">50 points to ₹100 Health Store Credit</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-secondary">{userPoints}/500</p>
            </div>
          </div>
          <Progress value={(userPoints / 500) * 100} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Rewards */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-secondary" />
                Available Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableRewards.map((reward) => (
                  <Card key={reward.id} className={`hover-lift ${!reward.available ? "opacity-60" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-2xl">{reward.icon}</div>
                        <div className="flex gap-1">
                          {reward.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {reward.category}
                          </Badge>
                        </div>
                      </div>

                      <h4 className="font-semibold text-foreground mb-1">{reward.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-secondary mr-1" />
                          <span className="font-semibold text-secondary">{reward.points} pts</span>
                        </div>
                        <Button
                          size="sm"
                          disabled={!reward.available || userPoints < reward.points}
                          onClick={() => handleRedeem(reward)}
                          className="hover-lift"
                        >
                          {userPoints >= reward.points ? "Redeem" : "Need More"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-primary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all ${
                    achievement.earned ? "border-primary bg-primary/5" : "border-border bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{achievement.icon}</span>
                    {achievement.earned && (
                      <Badge variant="secondary" className="text-xs">
                        +{achievement.points} pts
                      </Badge>
                    )}
                  </div>
                  <h5 className="font-medium text-foreground text-sm">{achievement.title}</h5>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* How to Earn Points */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Zap className="w-5 h-5 mr-2" />
                Earn More Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dispose 1 medicine</span>
                  <Badge variant="outline" className="text-xs">
                    +15-30 pts
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Refer a friend</span>
                  <Badge variant="outline" className="text-xs">
                    +50 pts
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Complete profile</span>
                  <Badge variant="outline" className="text-xs">
                    +25 pts
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Weekly disposal</span>
                  <Badge variant="outline" className="text-xs">
                    +10 pts
                  </Badge>
                </div>
              </div>
              <Button size="sm" className="w-full mt-3 hover-lift" asChild>
                <Link href="/dashboard/disposal/scan">Start Earning</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Redemptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Recent Redemptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRedemptions.map((redemption) => (
                <div key={redemption.id} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-foreground text-sm">{redemption.reward}</h5>
                    <Badge variant={redemption.status === "Used" ? "outline" : "secondary"} className="text-xs">
                      {redemption.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(redemption.date).toLocaleDateString("en-IN")}</span>
                    <span>-{redemption.points} pts</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
