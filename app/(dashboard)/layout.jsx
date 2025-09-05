"use client"

import { useState, useEffect, Children, cloneElement } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, History, Gift, User, Recycle, Menu, X, Bell, Settings, Loader2, AlertTriangle } from "lucide-react"

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [pathname, setPathname] = useState("")

    // --- State for user data, loading, and errors ---
    const [user, setUser] = useState(null)
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // --- Data fetching logic moved to the layout ---
    useEffect(() => {
        // Set pathname on mount for navigation highlighting
        setPathname(window.location.pathname);

        const fetchDashboardData = async () => {
            setLoading(true)
            setError(null)
            const token = localStorage.getItem('pharma-cycle-token')

            if (!token) {
                window.location.href = '/login'
                return
            }

            try {
                const res = await fetch('/api/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem('pharma-cycle-token')
                        window.location.href = '/login'
                        return
                    }
                    throw new Error('Failed to fetch dashboard data');
                }
                const data = await res.json();
                setUser(data.user);
                setStats(data.stats);
                setRecentActivity(data.recentActivity);
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: Home, current: pathname === "/dashboard" },
        { name: "History", href: "/history", icon: History, current: pathname === "/history" },
        { name: "Rewards", href: "/rewards", icon: Gift, current: pathname === "/rewards" },
        { name: "Profile", href: "/profile", icon: User, current: pathname === "/profile" },
    ]
    
    // --- Render function for main content ---
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            )
        }

        if (error) {
            return (
                 <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] text-center">
                    <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                    <h2 className="text-2xl font-bold text-destructive">Oops! Something went wrong.</h2>
                    <p className="text-muted-foreground mt-2">{error}</p>
                    <Button onClick={() => window.location.reload()} className="mt-6">Try Again</Button>
                </div>
            )
        }
        
        // Pass fetched data as props to the child page
        return Children.map(children, child => 
            cloneElement(child, { user, stats, recentActivity })
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
                <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Recycle className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="text-lg font-bold text-foreground">Pharma-Cycle</span>
                        </a>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    <nav className="p-4 space-y-2">
                        {navigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                                    item.current
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </a>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:bg-card lg:border-r lg:border-border lg:block">
                <div className="flex items-center space-x-2 p-6 border-b border-border">
                    <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Recycle className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold text-foreground">Pharma-Cycle</span>
                    </a>
                </div>
                <nav className="p-4 space-y-2">
                     {navigation.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                             className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                                item.current
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </a>
                    ))}
                </nav>
            </div>

            {/* Main content */}
            <div className="lg:ml-64">
                <header className="bg-card border-b border-border sticky top-0 z-40">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                                <Menu className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-lg font-semibold text-foreground">
                                    Welcome back, {loading ? '...' : user?.name}!
                                </h1>
                                <p className="text-sm text-muted-foreground">Ready to make a difference today?</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                           {stats && <Badge variant="secondary" className="hidden sm:flex">
                                {stats.pointsEarned} Points
                            </Badge>}
                            <Button variant="ghost" size="icon">
                                <Bell className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Settings className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6">{renderContent()}</main>
            </div>
        </div>
    )
}

