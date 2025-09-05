"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { User, Mail, Phone, MapPin, Bell, Shield, Leaf, Award, Edit, Save, Camera } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 98765 43210",
    location: "Bangalore, Karnataka",
    joinDate: "2025-01-15",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    rewardAlerts: true,
  })

  const userStats = {
    totalDisposals: 12,
    pointsEarned: 250,
    co2Saved: 8.5,
    rank: "Eco Warrior",
    joinedDays: Math.floor((new Date() - new Date("2025-01-15")) / (1000 * 60 * 60 * 24)),
  }

  const handleSave = () => {
    console.log("Profile updated:", profileData)
    setIsEditing(false)
    alert("Profile updated successfully!")
  }

  const handleNotificationChange = (key, value) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
    console.log(`Notification setting ${key} changed to:`, value)
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 slide-up">
        <div>
          <h1 className="dashboard-title text-foreground flex items-center">
            <User className="w-6 h-6 mr-2 text-primary" />
            My Profile
          </h1>
          <p className="dashboard-subtitle text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Personal Information
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-transparent"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{profileData.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Member since{" "}
                    {new Date(profileData.joinDate).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {userStats.rank}
                  </Badge>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-primary" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications" className="font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Get instant alerts on your device</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-reports" className="font-medium">
                    Weekly Reports
                  </Label>
                  <p className="text-sm text-muted-foreground">Summary of your environmental impact</p>
                </div>
                <Switch
                  id="weekly-reports"
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reward-alerts" className="font-medium">
                    Reward Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">Notifications about new rewards and achievements</p>
                </div>
                <Switch
                  id="reward-alerts"
                  checked={notifications.rewardAlerts}
                  onCheckedChange={(checked) => handleNotificationChange("rewardAlerts", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Stats */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Award className="w-5 h-5 mr-2" />
                Your Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{userStats.totalDisposals}</p>
                  <p className="text-xs text-muted-foreground">Disposals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">{userStats.pointsEarned}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{userStats.co2Saved}kg</p>
                  <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{userStats.joinedDays}</p>
                  <p className="text-xs text-muted-foreground">Days Active</p>
                </div>
              </div>
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <Leaf className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-primary">Environmental Champion</p>
                <p className="text-xs text-muted-foreground">Keep up the great work!</p>
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                Change Email
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Shield className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Phone className="w-4 h-4 mr-2" />
                Verify Phone Number
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent hover-lift" asChild>
                <Link href="/dashboard/disposal/scan">
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Medicine
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent hover-lift" asChild>
                <Link href="/dashboard/history">
                  <MapPin className="w-4 h-4 mr-2" />
                  View History
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent hover-lift" asChild>
                <Link href="/dashboard/rewards">
                  <Award className="w-4 h-4 mr-2" />
                  Check Rewards
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
