"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Award, Edit, Save, Loader2, AlertTriangle } from "lucide-react"

// Simple Modal Component for feedback messages
const Modal = ({ title, message, onClose, show }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
            <div className="bg-card rounded-lg p-6 w-full max-w-sm m-4 text-center shadow-lg slide-up">
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{message}</p>
                <Button onClick={onClose} className="w-full">Close</Button>
            </div>
        </div>
    );
};

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    
    const [profileData, setProfileData] = useState(null);
    const [userStats, setUserStats] = useState(null);
    
    const [modal, setModal] = useState({ show: false, title: '', message: '' });

    const fetchProfileData = async () => {
        const token = localStorage.getItem('pharma-cycle-token');
        if (!token) { window.location.href = '/login'; return; }

        try {
            const res = await fetch('/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                 if (res.status === 401) {
                    localStorage.removeItem('pharma-cycle-token');
                    window.location.href = '/login';
                }
                throw new Error('Failed to fetch profile data');
            }
            const data = await res.json();
            setProfileData(data.profileData);
            setUserStats(data.userStats);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const token = localStorage.getItem('pharma-cycle-token');

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update profile.');

            setModal({ show: true, title: 'Success', message: data.message });
            setIsEditing(false);
            await fetchProfileData(); // Refresh data with latest updates

        } catch (err) {
            setModal({ show: true, title: 'Update Failed', message: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="ml-4 text-lg text-muted-foreground">Loading Your Profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-center">
                <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                <h2 className="text-2xl font-bold text-destructive">Could not load profile.</h2>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-6">Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <Modal {...modal} onClose={() => setModal({ ...modal, show: false })} />
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center">
                    <User className="w-6 h-6 mr-2 text-primary" />
                    My Profile
                </h1>
                <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Personal Information</CardTitle>
                             <Button variant="outline" size="sm" onClick={() => (isEditing ? handleSave() : setIsEditing(true))} disabled={saving}>
                                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 
                                 isEditing ? <><Save className="w-4 h-4 mr-2" />Save</> : 
                                 <><Edit className="w-4 h-4 mr-2" />Edit</>}
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground text-xl">{profileData.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Member since {new Date(profileData.joinDate).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                                    </p>
                                    <Badge variant="secondary" className="mt-1">{userStats.rank}</Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={profileData.name} onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))} disabled={!isEditing} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData(p => ({ ...p, email: e.target.value }))} disabled={!isEditing} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                                    <Input id="phone" value={profileData.phone} onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))} disabled={!isEditing} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="location">Location (Optional)</Label>
                                    <Input id="location" value={profileData.location} onChange={(e) => setProfileData(p => ({ ...p, location: e.target.value }))} disabled={!isEditing} className="mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar with Stats */}
                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader><CardTitle className="flex items-center text-primary"><Award className="w-5 h-5 mr-2" /> Your Impact</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-center">
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
                                <p className="text-2xl font-bold text-primary">{Math.max(0, Math.floor((new Date() - new Date(profileData.joinDate)) / (1000 * 60 * 60 * 24)))}</p>
                                <p className="text-xs text-muted-foreground">Days Active</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

