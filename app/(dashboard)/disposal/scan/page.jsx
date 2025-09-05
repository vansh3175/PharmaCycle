"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Camera, Upload, Scan, CheckCircle, AlertCircle, MapPin, Loader2, Type
} from "lucide-react"

export default function ScanPage() {
    const [scanStep, setScanStep] = useState("camera"); // camera, identified, confirmed
    const [entryMode, setEntryMode] = useState("scan"); // 'scan' or 'manual'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [medicineData, setMedicineData] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const router = useRouter();

    // --- State for Manual Form ---
    const [manualForm, setManualForm] = useState({
        name: "",
        brand: "",
        type: "tablet",
        quantity: 1
    });

    // --- Camera Controls ---
    const startCamera = async () => {
        if (entryMode === 'scan' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                setError("Could not access camera. Please check browser permissions.");
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [entryMode]);

    // --- Core API Logic ---
    const captureAndAnalyze = async (source) => {
        setIsSubmitting(true);
        setError(null);
        let imageBase64;

        if (source === 'camera' && videoRef.current?.readyState === 4) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            imageBase64 = canvas.toDataURL('image/jpeg');
        } else if (source.startsWith('data:image')) {
            imageBase64 = source;
        } else {
            setError("Camera is not ready or image source is invalid.");
            setIsSubmitting(false);
            return;
        }

        const token = localStorage.getItem('pharma-cycle-token');
        try {
            const res = await fetch('/api/scan/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ imageBase64 })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "AI analysis failed.");

            setMedicineData({ ...data, confidence: 95 });
            setScanStep("identified");
            stopCamera();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const createDisposalPass = async (medData, qty) => {
        setIsSubmitting(true);
        setError(null);
        const token = localStorage.getItem('pharma-cycle-token');
        try {
            const res = await fetch('/api/scan/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ medicineData: medData, quantity: qty })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to create disposal pass.");

            setScanStep("confirmed");
            sessionStorage.setItem('disposalCode', data.disposalCode);
            setTimeout(() => {
                router.push("/disposal/map");
            }, 1500);
        } catch (err) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    const handleUploadFromGallery = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = e => {
            if (e.target.files?.[0]) {
                const reader = new FileReader();
                reader.onload = readerEvent => captureAndAnalyze(readerEvent.target.result);
                reader.readAsDataURL(e.target.files[0]);
            }
        };
        input.click();
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
            <h1 className="text-2xl font-bold">Create Disposal Pass</h1>
            {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center"><AlertCircle className="w-5 h-5 mr-2"/>{error}</div>}

            {entryMode === 'scan' ? (
                // --- AI SCANNER UI ---
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
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button onClick={() => captureAndAnalyze('camera')} disabled={isSubmitting} className="flex-1" size="lg">
                                        {isSubmitting ? <><Loader2 className="mr-2 w-5 h-5 animate-spin"/>Analyzing...</> : <><Scan className="mr-2 w-5 h-5"/>Scan Medicine</>}
                                    </Button>
                                    <Button variant="outline" onClick={handleUploadFromGallery} disabled={isSubmitting} className="flex-1" size="lg">
                                        <Upload className="mr-2 w-5 h-5"/> Upload Photo
                                    </Button>
                                </div>
                                 <Button variant="link" className="w-full mt-4" onClick={() => setEntryMode('manual')}>
                                    Or, Enter Medicine Details Manually
                                </Button>
                            </CardContent></Card>
                        </div>
                    )}
                    {scanStep === "identified" && medicineData && (
                         <div className="lg:col-span-3 space-y-6">
                            <Card><CardHeader><CardTitle>Medicine Identified</CardTitle></CardHeader><CardContent className="space-y-4">
                                <p>Name: {medicineData.name}</p>
                                <p>Brand: {medicineData.brand}</p>
                                <Input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, +e.target.value))} />
                                <Button onClick={() => createDisposalPass(medicineData, quantity)} disabled={isSubmitting}>
                                    {isSubmitting ? 'Confirming...' : 'Confirm & Find Drop-off Point'}
                                </Button>
                            </CardContent></Card>
                         </div>
                    )}
                </div>
            ) : (
                // --- MANUAL ENTRY UI ---
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader><CardTitle>Enter Medicine Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div><Label htmlFor="med-name" className="py-4">Medicine Name</Label><Input id="med-name" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} /></div>
                             <div><Label htmlFor="med-brand" className="py-4" >Brand (Optional)</Label><Input id="med-brand" value={manualForm.brand} onChange={e => setManualForm({...manualForm, brand: e.target.value})} /></div>
                             <div>
                                <Label htmlFor="quantity" className="py-4" >Quantity</Label>
                                <Input id="quantity" type="number" value={manualForm.quantity} onChange={(e) => setManualForm({...manualForm, quantity: Math.max(1, +e.target.value)})} />
                            </div>
                            <Button onClick={() => createDisposalPass(manualForm, manualForm.quantity)} disabled={isSubmitting || !manualForm.name}>
                                {isSubmitting ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Confirming...</> : <><MapPin className="mr-2 w-4 h-4" />Confirm & Find Drop-off Point</>}
                            </Button>
                             <Button variant="link" className="w-full mt-2" onClick={() => { setEntryMode('scan'); setError(null); }}>
                                Switch to AI Scanner
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

