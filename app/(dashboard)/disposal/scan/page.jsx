"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Camera, Upload, Scan, CheckCircle, AlertCircle, MapPin, ChevronRight, Loader2
} from "lucide-react"

export default function ScanPage() {
    const [scanStep, setScanStep] = useState("camera"); // camera, identified, confirmed
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [medicineData, setMedicineData] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const router = useRouter();

    // --- Camera Controls ---
    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                // Prioritize the back camera on mobile devices
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access camera. Please check your browser permissions and try again.");
            }
        } else {
            setError("Camera access is not supported by your browser.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        if (scanStep === 'camera') {
            startCamera();
        }
        return () => stopCamera(); // Cleanup on component unmount
    }, [scanStep]);

    // --- Core Logic Functions ---
    const captureAndAnalyze = async (source) => {
        setIsScanning(true);
        setError(null);
        let imageBase64;

        if (source === 'camera' && videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            imageBase64 = canvas.toDataURL('image/jpeg');
        } else if (source.startsWith('data:image')) {
             imageBase64 = source;
        } else {
             setError("Camera is not ready or invalid image source.");
             setIsScanning(false);
             return;
        }

        const token = localStorage.getItem('pharma-cycle-token');
        try {
            const res = await fetch('/api/scan/analyze', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ imageBase64 })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "AI analysis failed. Please try again with a clearer image.");

            setMedicineData({ ...data, confidence: 95 }); // Add confidence for display
            setScanStep("identified");
            stopCamera();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsScanning(false);
        }
    };
    
    const handleUploadFromGallery = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    captureAndAnalyze(readerEvent.target.result);
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };
        input.click();
    };

    const handleConfirm = async () => {
        setIsScanning(true); // Re-use for loading state
        const token = localStorage.getItem('pharma-cycle-token');
        try {
             const res = await fetch('/api/scan/create', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ medicineData, quantity })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to create disposal pass.");

            setScanStep("confirmed");
            // Store disposal details for the map page
            sessionStorage.setItem('disposalCode', data.disposalCode);
            setTimeout(() => {
                router.push("/dashboard/disposal/map"); // Use router for navigation
            }, 1500);

        } catch (err) {
             setError(err.message);
             setIsScanning(false);
        }
    };
    
    // --- Render Logic ---
    if (scanStep === "confirmed") {
        return (
            <div className="max-w-md mx-auto fade-in"><Card className="text-center"><CardContent className="p-8">
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Disposal Pass Created!</h2>
                <p className="text-muted-foreground mb-6">Redirecting to find drop-off points...</p>
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            </CardContent></Card></div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">AI Medicine Scanner</h1>
            
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-4 flex items-center slide-down">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> {error}
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {scanStep === "camera" && (
                    <div className="lg:col-span-2">
                        <Card><CardContent className="p-4">
                            <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                                <canvas ref={canvasRef} className="hidden" />
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                    <div className="w-full h-full border-2 border-white/50 rounded-lg"/>
                                </div>
                                {!videoRef.current?.srcObject && <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white"><Camera className="w-10 h-10 mb-2"/>Waiting for camera...</div>}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button onClick={() => captureAndAnalyze('camera')} disabled={isScanning} className="flex-1" size="lg">
                                    {isScanning ? <><Loader2 className="mr-2 w-5 h-5 animate-spin"/>Analyzing...</> : <><Scan className="mr-2 w-5 h-5"/>Scan Medicine</>}
                                </Button>
                                <Button variant="outline" onClick={handleUploadFromGallery} disabled={isScanning} className="flex-1" size="lg">
                                    <Upload className="mr-2 w-5 h-5"/> Upload from Gallery
                                </Button>
                            </div>
                        </CardContent></Card>
                    </div>
                )}

                {scanStep === "identified" && medicineData && (
                     <div className="lg:col-span-3 space-y-6">
                        <Card className="slide-up"><CardHeader>
                            <CardTitle className="flex items-center">
                                <CheckCircle className="w-6 h-6 mr-2 text-primary" /> Medicine Identified
                            </CardTitle>
                        </CardHeader><CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <div><Label>Name</Label><p className="font-semibold">{medicineData.name || 'N/A'}</p></div>
                                <div><Label>Brand</Label><p className="font-semibold">{medicineData.brand || 'N/A'}</p></div>
                                <div><Label>Type</Label><p className="font-semibold">{medicineData.type || 'N/A'}</p></div>
                                <div><Label>Category</Label><p className="font-semibold">{medicineData.category || 'N/A'}</p></div>
                            </div>
                            {medicineData.expiryDate && 
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive font-medium flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    Expires: {new Date(medicineData.expiryDate).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            }
                        </CardContent></Card>
                        
                        <Card className="slide-up"><CardHeader><CardTitle>Confirm Details</CardTitle></CardHeader><CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="quantity">Quantity to Dispose</Label>
                                <div className="flex items-center space-x-3 mt-2">
                                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                                    <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, +e.target.value))} className="w-20 text-center"/>
                                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>+</Button>
                                </div>
                            </div>
                            <Button onClick={handleConfirm} disabled={isScanning} className="w-full" size="lg">
                                 {isScanning ? <><Loader2 className="mr-2 w-5 h-5 animate-spin"/>Confirming...</> : <><MapPin className="mr-2 w-5 h-5"/>Confirm & Find Drop-off Point</>}
                            </Button>
                        </CardContent></Card>
                    </div>
                )}
            </div>
        </div>
    );
}

