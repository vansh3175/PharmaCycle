"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Camera,
  Upload,
  Scan,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  MapPin,
  ChevronRight,
  Zap,
  Leaf,
  Shield,
  Users,
} from "lucide-react"

export default function ScanPage() {
  const [scanStep, setScanStep] = useState("camera") // camera, identified, confirmed
  const [isScanning, setIsScanning] = useState(false)
  const [medicineData, setMedicineData] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    // Simulate camera access
    if (scanStep === "camera") {
      startCamera()
    }

    return () => {
      stopCamera()
    }
  }, [scanStep])

  const startCamera = async () => {
    try {
      // In a real app, you would access the camera here
      // For demo purposes, we'll simulate it
      console.log("Camera access requested")
    } catch (error) {
      console.error("Camera access denied:", error)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
    }
  }

  const handleScan = () => {
    setIsScanning(true)

    // Simulate AI processing
    setTimeout(() => {
      setMedicineData({
        name: "Paracetamol 500mg",
        brand: "Crocin",
        type: "Tablet",
        expiryDate: "2024-12-31",
        confidence: 95,
        category: "Pain Relief",
      })
      setIsScanning(false)
      setScanStep("identified")
    }, 2000)
  }

  const handleUploadFromGallery = () => {
    // Simulate file upload
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      if (e.target.files[0]) {
        handleScan()
      }
    }
    input.click()
  }

  const handleConfirm = () => {
    setScanStep("confirmed")
    // In a real app, this would save the disposal data
    setTimeout(() => {
      window.location.href = "/dashboard/disposal/map"
    }, 1500)
  }

  if (scanStep === "confirmed") {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center hover-lift">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-green">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Medicine Identified!</h2>
            <p className="text-muted-foreground mb-6">Redirecting you to find nearby drop-off points...</p>
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Medicine Scanner</h1>
          <p className="text-muted-foreground">Advanced AI technology for safe medicine disposal</p>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Every Scan Makes a Difference</h3>
                <p className="text-sm text-muted-foreground">Join 10,000+ users protecting our environment</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">2.5M</p>
              <p className="text-xs text-muted-foreground">Medicines Recycled</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scanStep === "camera" && (
          <>
            <div className="lg:col-span-2 space-y-6">
              {/* Camera View */}
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="relative">
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Camera overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
                        </div>
                      </div>

                      {/* Placeholder when no camera */}
                      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-sm opacity-75">Camera View Placeholder</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-center text-muted-foreground mb-6">
                      Position the medicine packaging inside the frame for best results
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={handleScan} disabled={isScanning} className="flex-1 hover-lift" size="lg">
                        {isScanning ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Scan className="mr-2 w-5 h-5" />
                            Scan Medicine
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleUploadFromGallery}
                        className="flex-1 hover-lift bg-transparent"
                        size="lg"
                      >
                        <Upload className="mr-2 w-5 h-5" />
                        Upload Photo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Scanning Tips */}
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Zap className="w-5 h-5 mr-2 text-primary" />
                    Scanning Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Ensure good lighting for better recognition</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Keep the medicine label clearly visible</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Hold steady for 2-3 seconds during scanning</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Include expiry date in the frame</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Information */}
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg text-orange-800">
                    <Shield className="w-5 h-5 mr-2" />
                    Safety First
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-orange-700">
                    Never dispose of medicines in regular trash or flush them down the toilet.
                  </p>
                  <div className="bg-orange-100 rounded-lg p-3">
                    <p className="text-xs text-orange-800 font-medium">
                      Our AI ensures proper categorization for safe disposal methods.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Community Impact */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Community Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">10K+</p>
                      <p className="text-xs text-muted-foreground">Active Users</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">2.5M</p>
                      <p className="text-xs text-muted-foreground">Medicines Recycled</p>
                    </div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-xs text-primary font-medium text-center">
                      Together, we're building a healthier future! 🌱
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {scanStep === "identified" && medicineData && (
          <div className="lg:col-span-3 space-y-6">
            {/* Identification Result */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-primary" />
                  Medicine Identified
                  <Badge variant="secondary" className="ml-auto">
                    {medicineData.confidence}% Confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Medicine Name</Label>
                    <p className="text-lg font-semibold text-foreground">{medicineData.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Brand</Label>
                    <p className="text-lg font-semibold text-foreground">{medicineData.brand}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <p className="text-foreground">{medicineData.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                    <p className="text-foreground">{medicineData.category}</p>
                  </div>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-destructive mr-2" />
                    <span className="font-medium text-destructive">Expired</span>
                  </div>
                  <p className="text-sm text-destructive/80 mt-1">Expiry Date: {medicineData.expiryDate}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quantity Input */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Confirm Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium">
                    Quantity to Dispose
                  </Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      -
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                      min="1"
                    />
                    <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
                      +
                    </Button>
                    <span className="text-muted-foreground">{medicineData.type}(s)</span>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Estimated Points</span>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      +{quantity * 15} pts
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Based on medicine type and quantity</p>
                </div>

                <Button onClick={handleConfirm} className="w-full hover-lift" size="lg">
                  <MapPin className="mr-2 w-5 h-5" />
                  Confirm & Find Drop-off Points
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
