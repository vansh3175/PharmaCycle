"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Loader2, AlertTriangle, Factory, CalendarIcon, TrendingUp, Activity, Globe, Siren, Package, ArrowUpRight, BarChartHorizontal, BrainCircuit } from "lucide-react";

// Helper to format date to YYYY-MM-DD for input fields
const toInputDate = (date) => date.toISOString().slice(0, 10);

// Helper to format the time series data for the chart
const formatTimeSeriesData = (data) => {
    if (!data || Object.keys(data).length === 0) return [];
    const dates = Object.keys(data).sort();
    const categories = new Set();
    dates.forEach((date) => Object.keys(data[date]).forEach((cat) => categories.add(cat)));

    return dates.map((date) => {
        const entry = { name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
        categories.forEach((cat) => {
            entry[cat] = data[date][cat] || 0;
        });
        return entry;
    });
};

// Helper to format manufacturer data for the chart
const formatManufacturerData = (data) => {
    if (!data || Object.keys(data).length === 0) return [];
    return Object.entries(data)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
};

// Helper to calculate summary stats from fetched data
const calculateSummaryStats = (timeSeriesData) => {
    if (!timeSeriesData || timeSeriesData.length === 0) {
        return { totalMedicines: 0, topCategory: 'N/A', busiestDay: 'N/A' };
    }
    let totalMedicines = 0;
    const categoryCounts = {};
    let busiestDay = { day: 'N/A', count: 0 };

    timeSeriesData.forEach(day => {
        let dailyTotal = 0;
        Object.keys(day).forEach(key => {
            if (key !== 'name') {
                totalMedicines += day[key];
                dailyTotal += day[key];
                categoryCounts[key] = (categoryCounts[key] || 0) + day[key];
            }
        });
        if (dailyTotal > busiestDay.count) {
            busiestDay = { day: day.name, count: dailyTotal };
        }
    });

    const topCategory = Object.keys(categoryCounts).length > 0
        ? Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A';

    return { totalMedicines, topCategory, busiestDay: busiestDay.day };
};


export default function AnalyticsDashboard() {
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        to: new Date(),
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analyticsData, setAnalyticsData] = useState({
        heatmap: [],
        timeSeries: [],
        manufacturers: [],
        alerts: [],
        summary: { totalMedicines: 0, topCategory: 'N/A', busiestDay: 'N/A' },
        aiSummary: { headline: "", insight: "", recommendation: "" }
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!dateRange.from || !dateRange.to) return;
            setLoading(true);
            setError(null);
            try {
                const from = dateRange.from.toISOString();
                const to = dateRange.to.toISOString();
                const endpoints = ["heatmap", "timeseries", "manufacturers", "alerts", "summary"];
                const responses = await Promise.all(
                    endpoints.map((endpoint) => fetch(`/api/analytics/${endpoint}?from=${from}&to=${to}`)),
                );
                for (const res of responses) {
                    if (!res.ok) throw new Error(`Failed to fetch data: A server error occurred.`);
                }
                const [heatmapRes, timeSeriesRes, manufacturersRes, alertsRes, summaryRes] = await Promise.all(responses.map((res) => res.json()));
                const formattedTimeSeries = formatTimeSeriesData(timeSeriesRes);
                setAnalyticsData({
                    heatmap: heatmapRes,
                    timeSeries: formattedTimeSeries,
                    manufacturers: formatManufacturerData(manufacturersRes),
                    alerts: alertsRes,
                    summary: calculateSummaryStats(formattedTimeSeries),
                    aiSummary: summaryRes.summary,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [dateRange]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-accent/20 blur-3xl -z-10" />
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/20 rounded-xl"><Activity className="w-8 h-8 text-accent" /></div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">Analytics Command Center</h1>
                            <p className="text-muted-foreground text-lg">Public Health Intelligence Engine</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 bg-muted/50 backdrop-blur-sm p-4 rounded-xl border border-border/30 shadow-lg">
                        <div className="p-2 bg-accent/20 rounded-lg"><CalendarIcon className="w-5 h-5 text-accent" /></div>
                        <div className="flex items-center gap-3">
                            <input type="date" className="bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-lg px-3 py-2 border border-border/30" value={toInputDate(dateRange.from)} onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })} />
                            <div className="w-3 h-px bg-gradient-to-r from-accent to-transparent" />
                            <input type="date" className="bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-lg px-3 py-2 border border-border/30" value={toInputDate(dateRange.to)} onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })} />
                        </div>
                    </div>
                </div>
            </div>

            {loading && <div className="flex justify-center items-center p-20"><Loader2 className="w-16 h-16 animate-spin text-accent" /></div>}
            {error && <div className="p-6 bg-destructive/10 text-destructive rounded-xl flex items-center"><AlertTriangle className="w-6 h-6 mr-3"/>{error}</div>}

            {!loading && !error && (
                <div className="space-y-6">
                    {/* --- ENHANCED: AI-Generated Executive Summary --- */}
                    <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="flex items-center text-xl font-bold">
                                <div className="p-2 bg-accent/20 rounded-lg mr-3"><BrainCircuit className="w-6 h-6 text-accent" /></div>
                                <span className="bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">AI-Generated Executive Summary</span>
                            </CardTitle>
                             <p className="text-xs text-muted-foreground font-mono">Analysis Period: {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analyticsData.aiSummary && analyticsData.aiSummary.headline ? (
                                <>
                                    <h3 className="text-2xl font-bold text-foreground">{analyticsData.aiSummary.headline}</h3>
                                    <p className="text-foreground/90 text-base">{analyticsData.aiSummary.insight}</p>
                                    <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                                        <p className="font-semibold text-accent">Recommendation:</p>
                                        <p className="text-accent/90">{analyticsData.aiSummary.recommendation}</p>
                                    </div>
                                </>
                             ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground">AI summary is being generated...</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* --- AI Early Warning System Card --- */}
                    {analyticsData.alerts.length > 0 && (
                        <Card className="bg-destructive/10 border-destructive/20 backdrop-blur-xl shadow-2xl animate-in fade-in-50">
                            <CardHeader>
                                <CardTitle className="flex items-center text-xl font-bold text-destructive">
                                    <div className="p-2 bg-destructive/20 rounded-lg mr-3"><Siren className="w-6 h-6" /></div>
                                    Early Warning System: Anomaly Detected
                                </CardTitle>
                                <p className="text-destructive/80">Our system has detected statistically significant spikes in disposal patterns, indicating potential public health anomalies.</p>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {analyticsData.alerts.map((alert, index) => (
                                    <div key={index} className="bg-card/80 p-4 rounded-xl border border-border/50 shadow-md">
                                        <h3 className="font-bold text-lg text-foreground mb-2">{alert.category}</h3>
                                        {alert.spikes.map((spike, sIndex) => (
                                            <div key={sIndex} className="mt-2 text-sm border-t border-border/50 pt-2">
                                                <p className="font-semibold text-foreground">Spike on: {new Date(spike.day).toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                <p><span className="text-destructive font-bold text-lg">{spike.count}</span> units disposed</p>
                                                <p className="text-muted-foreground">Historical Average: {spike.mean} units/day</p>
                                                <div className="mt-2 text-destructive/90 text-xs font-mono p-1 bg-destructive/10 rounded">
                                                    Z-SCORE: {spike.zScore} (Severity: {spike.zScore > 3 ? 'HIGH' : 'MEDIUM'})
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* --- Summary Statistics --- */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Medicines Recycled</CardTitle><Package className="w-4 h-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{analyticsData.summary.totalMedicines.toLocaleString()}</div></CardContent></Card>
                        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Top Disposal Category</CardTitle><BarChartHorizontal className="w-4 h-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{analyticsData.summary.topCategory}</div></CardContent></Card>
                        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Busiest Disposal Day</CardTitle><ArrowUpRight className="w-4 h-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{analyticsData.summary.busiestDay}</div></CardContent></Card>
                    </div>

                    {/* --- Detailed Chart Cards --- */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                         <Card className="xl:col-span-2 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
                            <CardHeader><CardTitle className="flex items-center text-xl font-bold"><div className="p-2 bg-accent/20 rounded-lg mr-3"><TrendingUp className="w-6 h-6 text-accent" /></div><span className="bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">Temporal Disposal Analytics</span></CardTitle></CardHeader>
                            <CardContent><ResponsiveContainer width="100%" height={350}><AreaChart data={analyticsData.timeSeries}>
                                <defs>{analyticsData.timeSeries[0] && Object.keys(analyticsData.timeSeries[0]).filter(k => k !== "name").map((cat, i) => (<linearGradient key={cat} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={`hsl(${240 + i * 40}, 70%, 60%)`} stopOpacity={0.3} /><stop offset="95%" stopColor={`hsl(${240 + i * 40}, 70%, 60%)`} stopOpacity={0.05} /></linearGradient>))}</defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                                <Legend />
                                {analyticsData.timeSeries[0] && Object.keys(analyticsData.timeSeries[0]).filter(k => k !== "name").map((cat, i) => (<Area key={cat} type="monotone" dataKey={cat} stroke={`hsl(${240 + i * 40}, 70%, 60%)`} fill={`url(#gradient-${i})`} strokeWidth={2} />))}
                            </AreaChart></ResponsiveContainer></CardContent>
                         </Card>
                         <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
                            <CardHeader><CardTitle className="flex items-center text-xl font-bold"><div className="p-2 bg-accent/20 rounded-lg mr-3"><Factory className="w-6 h-6 text-accent" /></div><span className="bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">Manufacturer Matrix</span></CardTitle></CardHeader>
                            <CardContent><ResponsiveContainer width="100%" height={350}><BarChart data={analyticsData.manufacturers} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                                <YAxis type="category" dataKey="name" width={80} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
                            </BarChart></ResponsiveContainer></CardContent>
                         </Card>
                         <Card className="xl:col-span-3 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
                            <CardHeader><CardTitle className="flex items-center text-xl font-bold"><div className="p-2 bg-accent/20 rounded-lg mr-3"><Globe className="w-6 h-6 text-accent" /></div><span className="bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">Geospatial Disposal Network</span></CardTitle></CardHeader>
                            <CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto">
                               {analyticsData.heatmap.length > 0 ? analyticsData.heatmap.map((point, i) => (
                                    <div key={i} className="bg-muted/50 p-3 rounded-lg border border-border/30 text-center">
                                        <p className="font-bold text-lg text-accent">{point.count} disposals</p>
                                        <p className="text-sm font-semibold text-foreground mt-1">{point.name}</p>
                                        <p className="text-xs text-muted-foreground">{point.city}</p>
                                    </div>
                               )) : <p className="col-span-full text-center py-10 text-muted-foreground">No geospatial data for this period.</p>}
                            </div></CardContent>
                         </Card>
                    </div>
                </div>
            )}
        </div>
    );
}

