"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scan, History, Gift, TrendingUp, Calendar, MapPin, Award, Leaf, Users, ChevronRight, Loader2, AlertTriangle, Clock } from "lucide-react"

// A simple utility to format dates
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
};

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [pendingDisposals, setPendingDisposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('pharma-cycle-token');

            if (!token) {
                // Redirect to login if no token is found
                window.location.href = '/login';
                return;
            }

            try {
                const res = await fetch('/api/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    if (res.status === 401) {
                         // Token is invalid or expired
                        localStorage.removeItem('pharma-cycle-token');
                        window.location.href = '/login';
                        return;
                    }
                    throw new Error('Failed to fetch dashboard data');
                }

                const data = await res.json();
                setUser(data.user);
                setStats(data.stats);
                setRecentActivity(data.recentActivity.filter(activity => activity.status === 'Completed'));
                setPendingDisposals(data.pendingDisposals || []);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- Achievements (can be made dynamic later) ---
    const achievements = [
        { name: "First Disposal", icon: "🎯", earned: stats?.totalDisposals > 0 },
        { name: "Eco Warrior", icon: "🌱", earned: stats?.totalDisposals >= 10 },
        { name: "Community Helper", icon: "🤝", earned: false }, // Placeholder
        { name: "Health Guardian", icon: "🛡️", earned: false }, // Placeholder
    ];
    
    // --- Loading State ---
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="ml-4 text-lg text-muted-foreground">Loading Your Dashboard...</p>
            </div>
        );
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-center">
                 <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                <h2 className="text-2xl font-bold text-destructive">Oops! Something went wrong.</h2>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-6">Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main CTA Card */}
            <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover-lift">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-6 md:mb-0">
                            <h2 className="text-3xl font-bold mb-2">Ready for Your Next Disposal, {user?.name}?</h2>
                            <p className="text-primary-foreground/80 text-lg">
                                Help create a cleaner environment and contribute to public health data
                            </p>
                        </div>
                        <Button size="lg" variant="secondary" className="text-lg px-8 py-4 hover-lift animate-pulse-green" asChild>
                            <a href="/disposal/scan">
                                <Scan className="mr-2 w-6 h-6" />
                                Start New Disposal
                                <ChevronRight className="ml-2 w-5 h-5" />
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="hover-lift">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Total Disposals</p>
                                <p className="text-3xl font-bold text-foreground">{stats?.totalDisposals || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <Scan className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover-lift">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Completed</p>
                                <p className="text-3xl font-bold text-foreground">{stats?.completedDisposals || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Award className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover-lift">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Points Earned</p>
                                <p className="text-3xl font-bold text-foreground">{stats?.pointsEarned || 0}</p>
                            </div>
                             <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                                <Gift className="w-6 h-6 text-secondary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover-lift">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">CO₂ Saved</p>
                                <p className="text-3xl font-bold text-foreground">{stats?.environmentImpact || 0}kg</p>
                            </div>
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <Leaf className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Disposals Section */}
            {pendingDisposals.length > 0 && (
                <Card className="border-orange-200 bg-orange-50 hover-lift">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl text-orange-800 flex items-center">
                                <Clock className="w-5 h-5 mr-2" />
                                Pending Disposals
                            </CardTitle>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                {pendingDisposals.length} pending
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingDisposals.map((disposal) => (
                            <div key={disposal._id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                                    <div>
                                        <p className="font-semibold text-orange-800">
                                            Code: {disposal.disposalCode}
                                        </p>
                                        <p className="text-sm text-orange-600">
                                            {disposal.items?.length || 0} items • {disposal.pharmacy?.name || 'Pharmacy not assigned'}
                                        </p>
                                        <p className="text-xs text-orange-500">
                                            Created {formatDate(disposal.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="border-orange-300 text-orange-700">
                                    Awaiting Verification
                                </Badge>
                            </div>
                        ))}
                        <div className="text-center pt-2">
                            <p className="text-sm text-orange-600">
                                💡 Present your disposal codes at the selected pharmacies for verification
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="hover-lift">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center">
                            <History className="w-5 h-5 mr-2 text-primary" />
                            Recent Completed Disposals
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                           <a href="/history">View All <ChevronRight className="ml-1 w-4 h-4" /></a>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentActivity.length > 0 ? recentActivity.map((activity) => (
                            <div key={activity._id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Scan className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {activity.items && activity.items.length > 0 ? activity.items[0].medicineName : 'Medicine Disposal'}
                                            {activity.items && activity.items.length > 1 && ` (+${activity.items.length - 1} more)`}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {activity.pharmacy?.name || 'Pending Verification'} • {formatDate(activity.createdAt)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Code: {activity.disposalCode}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant={activity.status === 'Completed' ? 'default' : 'secondary'} className="mb-1">
                                        {activity.status}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground">
                                        +{activity.points || (activity.items ? activity.items.length * 10 : 10)} pts
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground py-4">No recent activity found. Start a new disposal!</p>
                        )}
                    </CardContent>
                </Card>

                {/* Rewards & Achievements */}
                <Card className="hover-lift">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Award className="w-5 h-5 mr-2 text-secondary" />
                            Your Achievements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {achievements.map((achievement, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        achievement.earned
                                            ? "border-primary bg-primary/5 hover:bg-primary/10"
                                            : "border-border bg-muted/30 opacity-60"
                                    }`}
                                >
                                    <div className="text-2xl mb-2">{achievement.icon}</div>
                                    <p className="text-sm font-medium text-foreground">{achievement.name}</p>
                                    {achievement.earned && (
                                        <Badge variant="secondary" className="mt-2 text-xs">
                                            Earned
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4 mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-foreground">Available Rewards</span>
                                <Badge variant="outline">{user?.points} Points</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent" asChild>
                               <a href="/rewards">View All Rewards</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions have been removed for brevity but can be added back */}
        </div>
    )
}
