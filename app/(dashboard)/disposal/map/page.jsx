"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, CheckCircle, Loader2, AlertTriangle, Copy, Phone, Navigation, ArrowLeft } from "lucide-react"

export default function DropoffPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pharmacy, setPharmacy] = useState(null);
    const [disposalCode, setDisposalCode] = useState(null);

    useEffect(() => {
        const code = sessionStorage.getItem('disposalCode');
        if (!code) {
            setError("Disposal pass not found. Please start a new scan.");
            setLoading(false);
            return;
        }
        setDisposalCode(code);

        // Get user's current location to find the nearest pharmacy
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Once we have location, call the API
                    findAndAssignPharmacy(code, position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    setError("Location access denied. Please enable location services in your browser to find a drop-off point.");
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
        }
    }, []);

    const findAndAssignPharmacy = async (code, lat, lng) => {
        const token = localStorage.getItem('pharma-cycle-token');
        try {
            const res = await fetch('/api/pharmacies/find-and-assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ disposalCode: code, lat, lng })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to find a pharmacy.");
            setPharmacy(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDone = () => {
        sessionStorage.removeItem('disposalCode');
        window.location.href = '/dashboard';
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Disposal Pass Ready</h1>
            </div>
            
            {loading && (
                <Card>
                    <CardContent className="p-10 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4 mx-auto" />
                        <p className="text-muted-foreground">Finding the nearest drop-off point for you...</p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-destructive bg-destructive/5">
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4"/>
                        <h3 className="text-lg font-semibold text-destructive">An Error Occurred</h3>
                        <p className="text-muted-foreground mt-2">{error}</p>
                        <Button variant="outline" onClick={() => window.location.href = '/dashboard/disposal/scan'} className="mt-4">
                            Start Over
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && pharmacy && (
                <div className="space-y-4 fade-in">
                    <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                        <CardHeader><CardTitle>Your Disposal Pass</CardTitle></CardHeader>
                        <CardContent className="text-center">
                            <p className="text-lg">Show this code to the pharmacist:</p>
                            <div className="my-4 p-4 bg-primary-foreground/20 rounded-lg inline-flex items-center gap-4">
                                <span className="text-4xl font-bold tracking-widest text-white">{disposalCode}</span>
                                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigator.clipboard.writeText(disposalCode)}>
                                    <Copy className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-primary" />
                                Your Assigned Drop-off Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <h3 className="text-lg font-semibold text-foreground">{pharmacy.name}</h3>
                            <p className="text-muted-foreground">{pharmacy.address}, {pharmacy.city}</p>
                            <div className="flex items-center gap-2 pt-2">
                                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                    <Phone className="w-4 h-4 mr-2" /> Call
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                    <Navigation className="w-4 h-4 mr-2" /> Directions
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Button onClick={handleDone} className="w-full" size="lg">
                        <CheckCircle className="w-5 h-5 mr-2"/> Done
                    </Button>
                </div>
            )}
        </div>
    )
}

