"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Navigation, Clock, Phone, Star, Search, Filter, ArrowLeft, CheckCircle } from "lucide-react"

export default function MapPage() {
  const [userLocation, setUserLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  const dropOffLocations = [
    {
      id: 1,
      name: "Apollo Pharmacy",
      address: "MG Road, Bangalore",
      distance: "0.8 km",
      rating: 4.5,
      phone: "+91 80 2558 9999",
      hours: "8:00 AM - 10:00 PM",
      verified: true,
      coordinates: { lat: 12.9716, lng: 77.5946 },
    },
    {
      id: 2,
      name: "MedPlus Health Services",
      address: "Koramangala, Bangalore",
      distance: "1.2 km",
      rating: 4.3,
      phone: "+91 80 4040 8888",
      hours: "9:00 AM - 9:00 PM",
      verified: true,
      coordinates: { lat: 12.9352, lng: 77.6245 },
    },
    {
      id: 3,
      name: "Guardian Pharmacy",
      address: "Indiranagar, Bangalore",
      distance: "2.1 km",
      rating: 4.7,
      phone: "+91 80 2520 7777",
      hours: "7:00 AM - 11:00 PM",
      verified: true,
      coordinates: { lat: 12.9719, lng: 77.6412 },
    },
    {
      id: 4,
      name: "Wellness Pharmacy",
      address: "Whitefield, Bangalore",
      distance: "5.8 km",
      rating: 4.2,
      phone: "+91 80 2845 6666",
      hours: "8:30 AM - 9:30 PM",
      verified: true,
      coordinates: { lat: 12.9698, lng: 77.75 },
    },
  ]

  useEffect(() => {
    // Request user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          console.log("User location:", position.coords)
        },
        (error) => {
          console.error("Location access denied:", error)
        },
      )
    }
  }, [])

  const handleConfirmDropOff = (location) => {
    console.log("Confirmed drop-off at:", location)
    alert(`Great! Your disposal is confirmed at ${location.name}. You'll receive a confirmation email shortly.`)
    // In a real app, this would create the disposal record
    window.location.href = "/dashboard"
  }

  const filteredLocations = dropOffLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Find Drop-off Points</h1>
          <p className="text-muted-foreground">Locate nearby partner pharmacies for safe disposal</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by pharmacy name or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Placeholder */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" />
              Interactive Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Map placeholder with location pins */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-4 h-4 bg-secondary rounded-full animate-pulse"></div>
              </div>
              <div className="text-center z-10">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive Map View</p>
                <p className="text-sm text-muted-foreground">Showing {filteredLocations.length} nearby locations</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Navigation className="w-4 h-4 mr-2" />
                Use My Location
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Location List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Nearby Drop-off Points ({filteredLocations.length})</h3>

          {filteredLocations.map((location) => (
            <Card key={location.id} className="hover-lift">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{location.name}</h4>
                      {location.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{location.address}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {location.distance}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {location.rating}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {location.hours}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Navigation className="w-4 h-4 mr-2" />
                    Directions
                  </Button>
                  <Button size="sm" className="flex-1 hover-lift" onClick={() => handleConfirmDropOff(location)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Drop-off
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredLocations.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No locations found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or check back later for new partner locations.
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">Drop-off Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Visit the Location</p>
                <p className="text-muted-foreground">Go to your selected drop-off point during business hours</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Hand Over Medicines</p>
                <p className="text-muted-foreground">Give your expired medicines to the pharmacy staff</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Earn Points</p>
                <p className="text-muted-foreground">Points will be credited to your account within 24 hours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
