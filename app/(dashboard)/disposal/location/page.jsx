"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin, Navigation, Loader2, AlertCircle } from "lucide-react"

export default function LocationPage() {
  const [medicineList, setMedicineList] = useState([])
  const [locationMethod, setLocationMethod] = useState("auto") // auto or manual
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [location, setLocation] = useState(null)
  const [manualLocation, setManualLocation] = useState({
    pincode: "",
    city: "",
    state: "",
    country: "India"
  })
  const [error, setError] = useState(null)
  const router = useRouter()

  const countries = [
    "India", "United States", "Canada", "United Kingdom", "Australia", 
    "Germany", "France", "Japan", "Singapore", "UAE"
  ]

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ]

  useEffect(() => {
    // Load medicine list from localStorage
    const savedList = localStorage.getItem("disposalList")
    if (savedList) {
      setMedicineList(JSON.parse(savedList))
    } else {
      // If no medicine list, redirect back to scan
      router.push("/disposal/scan")
    }
  }, [])

  const getCurrentLocation = async () => {
    setIsGettingLocation(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Use reverse geocoding to get address details
          // For demo purposes, we'll use a mock response
          // In production, you'd use Google Maps Geocoding API or similar
          const mockLocationData = {
            lat: latitude,
            lng: longitude,
            pincode: "110001",
            city: "New Delhi",
            state: "Delhi",
            country: "India",
            fullAddress: "New Delhi, Delhi, India"
          }

          setLocation(mockLocationData)
          setLocationMethod("auto")
        } catch (err) {
          setError("Failed to get location details. Please try manual entry.")
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        setError("Location access denied. Please enable location or enter manually.")
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const handleManualSubmit = () => {
    if (!manualLocation.pincode || !manualLocation.city || !manualLocation.state || !manualLocation.country) {
      setError("Please fill in all location fields.")
      return
    }

    const locationData = {
      pincode: manualLocation.pincode,
      city: manualLocation.city,
      state: manualLocation.state,
      country: manualLocation.country,
      fullAddress: `${manualLocation.city}, ${manualLocation.state}, ${manualLocation.country} - ${manualLocation.pincode}`
    }

    setLocation(locationData)
    proceedToPharmacy(locationData)
  }

  const proceedToPharmacy = (locationData) => {
    // Save location data for pharmacy selection
    localStorage.setItem("userLocation", JSON.stringify(locationData))
    router.push("/disposal/pharmacy")
  }

  const handleLocationConfirm = () => {
    if (location) {
      proceedToPharmacy(location)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/disposal/scan")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Scan
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Set Your Location</h1>
          <p className="text-muted-foreground">We need your location to find nearby pharmacies</p>
        </div>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-destructive mr-2" />
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary of medicines */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Disposal Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Items:</span>
              <p className="font-semibold">{medicineList.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Quantity:</span>
              <p className="font-semibold">{medicineList.reduce((sum, item) => sum + (item.quantity || 1), 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Method Selection */}
      {!location && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button 
              variant={locationMethod === "auto" ? "default" : "outline"}
              className="flex-1" 
              onClick={() => setLocationMethod("auto")}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Auto Detect
            </Button>
            <Button 
              variant={locationMethod === "manual" ? "default" : "outline"}
              className="flex-1" 
              onClick={() => setLocationMethod("manual")}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Manual Entry
            </Button>
          </div>

          {locationMethod === "auto" && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Navigation className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Current Location</h3>
                <p className="text-muted-foreground mb-6">
                  We'll automatically detect your location to find the nearest pharmacies
                </p>
                <Button 
                  onClick={getCurrentLocation} 
                  disabled={isGettingLocation}
                  size="lg"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Allow Location Access
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {locationMethod === "manual" && (
            <Card>
              <CardHeader>
                <CardTitle>Enter Your Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      type="text"
                      placeholder="e.g., 110001"
                      value={manualLocation.pincode}
                      onChange={(e) => setManualLocation({...manualLocation, pincode: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="e.g., New Delhi"
                      value={manualLocation.city}
                      onChange={(e) => setManualLocation({...manualLocation, city: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select 
                      value={manualLocation.state}
                      onValueChange={(value) => setManualLocation({...manualLocation, state: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select 
                      value={manualLocation.country}
                      onValueChange={(value) => setManualLocation({...manualLocation, country: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleManualSubmit} className="w-full" size="lg">
                  Confirm Location
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Location Confirmation */}
      {location && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-primary mr-2" />
              <h3 className="text-lg font-semibold">Location Confirmed</h3>
            </div>
            <div className="space-y-2 mb-6">
              <p className="font-medium">{location.fullAddress}</p>
              {location.pincode && (
                <p className="text-sm text-muted-foreground">
                  Pincode: {location.pincode}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setLocation(null)} className="flex-1">
                Change Location
              </Button>
              <Button onClick={handleLocationConfirm} className="flex-1">
                Find Pharmacies
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
