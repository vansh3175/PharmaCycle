"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { History, Search, Calendar, Package, MapPin, Award, TrendingUp, Leaf, Loader2, AlertTriangle } from "lucide-react"

export default function HistoryPage() {
    const [disposalHistory, setDisposalHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        const fetchHistoryData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('pharma-cycle-token');

            if (!token) {
                window.location.href = '/login';
                return;
            }

            try {
                const res = await fetch('/api/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem('pharma-cycle-token');
                        window.location.href = '/login';
                        return;
                    }
                    throw new Error('Failed to fetch disposal history');
                }

                const data = await res.json();
                setDisposalHistory(data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoryData();
    }, []);

    const filteredHistory = disposalHistory.filter((item) => {
        const itemMedicineName = item.items[0]?.medicineName || '';
        const matchesSearch = itemMedicineName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || item.status.toLowerCase() === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const totalStats = {
        totalDisposals: disposalHistory.length,
        totalPoints: disposalHistory.filter(d => d.status === 'Completed').length * 50, // Assuming 50 points per completed disposal
        totalCO2Saved: (disposalHistory.length * 0.7).toFixed(1),
        completedDisposals: disposalHistory.filter((item) => item.status === "Completed").length,
    };
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-150px)]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="ml-4 text-lg text-muted-foreground">Loading Disposal History...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)] text-center">
                 <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                <h2 className="text-2xl font-bold text-destructive">Failed to Load History</h2>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-6">Try Again</Button>
            </div>
        );
    }


    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center">
                        <History className="w-6 h-6 mr-2 text-primary" />
                        Disposal History
                    </h1>
                    <p className="text-muted-foreground">Track your environmental impact and contributions.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Disposals</p>
                            <p className="text-2xl font-bold text-foreground">{totalStats.totalDisposals}</p>
                        </div>
                        <Package className="w-8 h-8 text-primary" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                         <div>
                            <p className="text-sm text-muted-foreground">Points Earned</p>
                            <p className="text-2xl font-bold text-foreground">{totalStats.totalPoints}</p>
                        </div>
                        <Award className="w-8 h-8 text-secondary" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                         <div>
                            <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                            <p className="text-2xl font-bold text-foreground">{totalStats.totalCO2Saved}kg</p>
                        </div>
                        <Leaf className="w-8 h-8 text-primary" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                         <div>
                            <p className="text-sm text-muted-foreground">Success Rate</p>
                            <p className="text-2xl font-bold text-foreground">
                                {totalStats.totalDisposals > 0 ? Math.round((totalStats.completedDisposals / totalStats.totalDisposals) * 100) : 0}%
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-primary" />
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by medicine name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filterStatus === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterStatus("all")}
                            > All </Button>
                            <Button
                                variant={filterStatus === "completed" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterStatus("completed")}
                            > Completed </Button>
                            <Button
                                variant={filterStatus === "pending" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterStatus("pending")}
                            > Pending </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* History List */}
            <div className="space-y-4">
                {filteredHistory.map((item) => (
                    <Card key={item._id}>
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Package className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground">{item.items[0]?.medicineName || 'N/A'}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {item.items[0]?.qty || 1} {item.items[0]?.unit || 'unit'}
                                        </p>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                                year: "numeric", month: "short", day: "numeric",
                                            })}
                                            <MapPin className="w-4 h-4 ml-4 mr-1" />
                                            {item.pharmacy ? `${item.pharmacy.name}, ${item.pharmacy.city}`: 'Pending Drop-off'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <Badge variant={item.status === "Completed" ? "default" : "secondary"} className="mb-2">
                                            {item.status}
                                        </Badge>
                                        <div className="flex items-center gap-4 text-sm">
                                            {item.status === 'Completed' &&
                                                <div className="text-center">
                                                    <p className="font-semibold text-secondary">+50</p>
                                                    <p className="text-xs text-muted-foreground">Points</p>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredHistory.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No disposals found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm || filterStatus !== "all"
                                ? "Try adjusting your search or filter criteria."
                                : "Start your first medicine disposal to see your history here."}
                        </p>
                         <Button asChild>
                            <a href="/disposal/scan">Start New Disposal</a>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
