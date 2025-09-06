"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, Star, Phone, Navigation, CheckCircle, Timer, Copy, QrCode } from "lucide-react"

export default function PharmacyPage() {
  const [medicineList, setMedicineList] = useState([])
  const [selectedPharmacy, setSelectedPharmacy] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [disposalCode, setDisposalCode] = useState(null)
  const [step, setStep] = useState("location") // location, pharmacies, code-generated

  const nearbyPharmacies = [
    {
      id: 1,
      name: "HealthPlus Pharmacy",
      address: "123 Main Street, Sector 15",
      distance: "0.8 km",
      rating: 4.8,
      phone: "+91 98765 43210",
      openUntil: "10:00 PM",
      verified: true,
      coordinates: { lat: 28.5355, lng: 77.391 },
    },
    {
      id: 2,
      name: "MediCare Central",
      address: "456 Park Avenue, Block A",
      distance: "1.2 km",
      rating: 4.6,
      phone: "+91 98765 43211",
      openUntil: "9:00 PM",
      verified: true,
      coordinates: { lat: 28.5365, lng: 77.392 },
    },
    {
      id: 3,
      name: "Apollo Pharmacy",
      address: "789 Commercial Complex",
      distance: "1.5 km",
      rating: 4.9,
      phone: "+91 98765 43212",
      openUntil: "11:00 PM",
      verified: true,
      coordinates: { lat: 28.5375, lng: 77.393 },
    },
  ]

  useEffect(() => {
    // Load medicine list from localStorage
    const savedList = localStorage.getItem("disposalList")
    if (savedList) {
      setMedicineList(JSON.parse(savedList))
    }
    
    // Load user location from localStorage
    const savedLocation = localStorage.getItem("userLocation")
    if (savedLocation) {
      setUserLocation(JSON.parse(savedLocation))
      setStep("pharmacies")
    } else {
      // Redirect back to location page if no location
      window.location.href = "/disposal/location"
    }
  }, [])

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setStep("pharmacies")
        },
        (error) => {
          console.log("Location access denied:", error)
          // Still show pharmacies with default location
          setStep("pharmacies")
        },
      )
    } else {
      setStep("pharmacies")
    }
  }

  const selectPharmacy = (pharmacy) => {
    setSelectedPharmacy(pharmacy)
    generateDisposalCode(pharmacy)
  }

  const generateDisposalCode = async (pharmacy) => {
    // Generate unique disposal code like PH1337425
    const code = `PH${pharmacy.id}${Date.now().toString().slice(-6)}`
    const expiryTime = new Date()
    expiryTime.setHours(expiryTime.getHours() + 24) // 24 hour validity

    const newDisposal = {
      code: code,
      pharmacy: pharmacy,
      userLocation: userLocation,
      expiryTime: expiryTime,
      totalItems: medicineList.length,
      totalPoints: medicineList.reduce((sum, item) => sum + (item.points || 10), 0), // Default 10 points per item
      status: "Pending",
      createdAt: new Date().toISOString(),
      medicines: medicineList,
    };

    try {
      // Save to database via API
      const token = localStorage.getItem('pharma-cycle-token');
      const response = await fetch('/api/disposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pharmacy: pharmacy,
          medicines: medicineList,
          disposalCode: code,
          userLocation: userLocation,
          status: "Pending"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save disposal');
      }

      const savedDisposal = await response.json();
      
      setDisposalCode(newDisposal);

      // Store in localStorage for offline access
      const existingCodes = JSON.parse(localStorage.getItem("disposalCodes") || "[]")
      existingCodes.push(newDisposal)
      localStorage.setItem("disposalCodes", JSON.stringify(existingCodes))

      // Clear the disposal list since it's now saved
      localStorage.removeItem("disposalList")
      localStorage.removeItem("userLocation")

      setStep("code-generated")
    } catch (error) {
      console.error('Error saving disposal:', error);
      alert('Failed to save disposal. Please try again.');
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(disposalCode.code)
    // Could add toast notification here
  }

  if (step === "location") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Find Nearby Pharmacy</h1>
            <p className="text-muted-foreground">We need your location to find the closest drop-off points</p>
          </div>
        </div>

        <Card className="text-center hover-lift">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Requesting Location Access</h2>
            <p className="text-muted-foreground mb-6">
              We'll use your location to find the nearest verified pharmacies for safe medicine disposal.
            </p>
            <Button onClick={requestLocation} className="hover-lift">
              <MapPin className="w-4 h-4 mr-2" />
              Allow Location Access
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "code-generated" && disposalCode) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Disposal Code Generated</h1>
            <p className="text-muted-foreground">Present this code at the selected pharmacy</p>
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20 hover-lift">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-3xl font-bold text-primary mb-2">{disposalCode.code}</h2>
            <p className="text-muted-foreground mb-6">Your unique disposal code</p>

            <div className="bg-white rounded-lg p-4 mb-6 border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Pharmacy:</span>
                  <p className="font-semibold">{disposalCode.pharmacy.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Valid Until:</span>
                  <p className="font-semibold">{disposalCode.expiryTime.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Items:</span>
                  <p className="font-semibold">{disposalCode.totalItems} medicines</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reward:</span>
                  <p className="font-semibold text-primary">+{disposalCode.totalPoints} pts</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={copyCode} variant="outline" className="flex-1 bg-transparent">
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
              <Button onClick={() => (window.location.href = "/dashboard")} className="flex-1 hover-lift">
                <CheckCircle className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Selected Pharmacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{disposalCode.pharmacy.name}</h3>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">{disposalCode.pharmacy.rating}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">{disposalCode.pharmacy.address}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Open until {disposalCode.pharmacy.openUntil}
                </span>
                <span className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {disposalCode.pharmacy.phone}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Select Pharmacy</h1>
          <p className="text-muted-foreground">Choose a nearby verified pharmacy for medicine disposal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {nearbyPharmacies.map((pharmacy) => (
            <Card key={pharmacy.id} className="hover-lift cursor-pointer" onClick={() => selectPharmacy(pharmacy)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-foreground">{pharmacy.name}</h3>
                    {pharmacy.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{pharmacy.rating}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{pharmacy.address}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {pharmacy.distance}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Open until {pharmacy.openUntil}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{pharmacy.phone}</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4 hover-lift">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Select This Pharmacy
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Disposal Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Items:</span>
                  <span className="font-semibold">{medicineList.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Quantity:</span>
                  <span className="font-semibold">{medicineList.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reward Points:</span>
                  <span className="font-semibold text-primary">
                    +{medicineList.reduce((sum, item) => sum + item.points, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-blue-800">
                <Timer className="w-5 h-5 mr-2" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Select a nearby pharmacy</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Get your unique disposal code</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Visit pharmacy within 24 hours</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Present code and receive points</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
