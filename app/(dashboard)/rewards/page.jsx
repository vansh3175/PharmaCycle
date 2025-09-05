"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, Star, Trophy, Zap, ShoppingCart, Heart, Loader2, AlertTriangle } from "lucide-react"

// Simple Modal Component for confirmation/messages
const Modal = ({ title, message, onClose, show }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
            <div className="bg-card rounded-lg p-6 w-full max-w-sm m-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{message}</p>
                <Button onClick={onClose} className="w-full">Close</Button>
            </div>
        </div>
    );
};

export default function RewardsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageData, setPageData] = useState({
        userPoints: 0,
        availableRewards: [],
        myRewards: [],
        userCouponIds: []
    });
    const [redeemingId, setRedeemingId] = useState(null);
    const [modal, setModal] = useState({ show: false, title: '', message: '' });

    const fetchRewardsData = async () => {
        const token = localStorage.getItem('pharma-cycle-token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        try {
            const res = await fetch('/api/rewards/data', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('pharma-cycle-token');
                    window.location.href = '/login';
                }
                throw new Error('Failed to fetch rewards data');
            }
            const data = await res.json();
            setPageData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewardsData();
    }, []);

    const handleRedeem = async (reward) => {
        setRedeemingId(reward._id);
        const token = localStorage.getItem('pharma-cycle-token');

        try {
            const res = await fetch('/api/rewards/redeem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ couponId: reward._id })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to redeem reward.');
            
            setModal({ show: true, title: 'Success!', message: data.message });
            await fetchRewardsData(); // Re-fetch data to update points and rewards list

        } catch (err) {
            setModal({ show: true, title: 'Error', message: err.message });
        } finally {
            setRedeemingId(null);
        }
    };
    
    // --- Loading State ---
    if (loading) {
        return <div className="flex justify-center items-center h-[calc(100vh-150px)]"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
    }

    // --- Error State ---
    if (error) {
        return <div className="text-center py-10"><AlertTriangle className="mx-auto w-12 h-12 text-destructive" /><p className="mt-4 text-destructive">{error}</p></div>;
    }

    const { userPoints, availableRewards, myRewards, userCouponIds } = pageData;
    const nextMilestone = availableRewards.find(r => r.pointsRequired > userPoints) || { title: 'More Rewards', pointsRequired: userPoints + 100 };

    return (
        <div className="space-y-6 fade-in">
            <Modal {...modal} onClose={() => setModal({ ...modal, show: false })} />
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center">
                        <Gift className="w-6 h-6 mr-2 text-secondary" />
                        Rewards & Points
                    </h1>
                    <p className="text-muted-foreground">Redeem your points for amazing rewards.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Available Points</p>
                    <p className="text-3xl font-bold text-secondary">{userPoints}</p>
                </div>
            </div>

            {/* Points Progress */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-foreground">Next Milestone</h3>
                            <p className="text-sm text-muted-foreground">
                                {nextMilestone.pointsRequired - userPoints > 0 
                                    ? `${nextMilestone.pointsRequired - userPoints} points to ${nextMilestone.title}`
                                    : "You can redeem new rewards!"}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-secondary">{userPoints}/{nextMilestone.pointsRequired}</p>
                        </div>
                    </div>
                    <Progress value={(userPoints / nextMilestone.pointsRequired) * 100} className="h-3" />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Available Rewards */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center"><ShoppingCart className="w-5 h-5 mr-2 text-secondary" /> Available Rewards</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableRewards.map((reward) => (
                                <Card key={reward._id} className={userCouponIds.includes(reward._id) ? "opacity-50" : "hover-lift"}>
                                    <CardContent className="p-4 flex flex-col h-full">
                                        <h4 className="font-semibold text-foreground mb-1">{reward.title}</h4>
                                        <p className="text-sm text-muted-foreground mb-3 flex-grow">{reward.description}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-secondary mr-1" />
                                                <span className="font-semibold text-secondary">{reward.pointsRequired} pts</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                disabled={userPoints < reward.pointsRequired || redeemingId === reward._id || userCouponIds.includes(reward._id)}
                                                onClick={() => handleRedeem(reward)}
                                            >
                                                {redeemingId === reward._id ? <Loader2 className="w-4 h-4 animate-spin"/> : userCouponIds.includes(reward._id) ? 'Redeemed' : 'Redeem'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center"><Heart className="w-5 h-5 mr-2 text-red-500" /> My Rewards</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {myRewards.length > 0 ? myRewards.map((redemption) => (
                                <div key={redemption._id} className="p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                        <h5 className="font-medium text-foreground text-sm">{redemption.title}</h5>
                                        <Badge variant="secondary" className="text-xs">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Expires: {new Date(redemption.expiryDate).toLocaleDateString("en-IN")}</span>
                                        <span>-{redemption.pointsRequired} pts</span>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-muted-foreground text-center py-4">You haven't redeemed any rewards yet.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
