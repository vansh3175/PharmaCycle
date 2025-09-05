"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Recycle, Scan, MapPin, Gift, TrendingUp, Users, Leaf, Activity, ChevronRight, Play } from "lucide-react"

export default function HomePage() {
  const [impactCount, setImpactCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    // Animate impact counter
    const timer = setInterval(() => {
      setImpactCount((prev) => {
        if (prev < 15420) return prev + 50
        return 15420
      })
    }, 50)

    return () => clearInterval(timer)
  }, [])

  const steps = [
    {
      icon: <Scan className="w-8 h-8" />,
      title: "Scan Your Medicine",
      description: "Use our AI-powered scanner to identify expired medicines instantly",
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Drop It Off Nearby",
      description: "Find the nearest partner pharmacy and drop off your medicines safely",
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Get Rewarded Instantly",
      description: "Earn points and coupons for every successful disposal",
    },
  ]

  const missions = [
    {
      icon: <Leaf className="w-12 h-12 text-primary" />,
      title: "A Cleaner Environment",
      description:
        "Transform medical waste into valuable resources through our circular economy approach. Medicines become fuel for cement plants, packaging gets recycled.",
      features: ["Zero landfill waste", "Certified recycling", "Carbon footprint reduction"],
    },
    {
      icon: <Activity className="w-12 h-12 text-secondary" />,
      title: "Smarter Public Health",
      description:
        "Anonymous disposal data creates early warning systems for health trends. Predict outbreaks before they happen.",
      features: ["Real-time health insights", "Community protection", "Data-driven prevention"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Recycle className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Pharma-Cycle</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#mission" className="text-muted-foreground hover:text-foreground transition-colors">
                Our Mission
              </a>
              <a href="#partners" className="text-muted-foreground hover:text-foreground transition-colors">
                Partners
              </a>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" className="hover-lift text-muted-foreground hover:text-foreground" asChild>
                <a href="/partner/login">Partner Portal</a>
              </Button>
              <Button variant="outline" className="hover-lift bg-transparent" asChild>
                <a href="/login">Log In</a>
              </Button>
              <Button className="hover-lift animate-pulse-green" asChild>
                <a href="/register">Sign Up</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              🇮🇳 Transforming India's Medical Waste Management
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 leading-tight">
              Turn Expired Medicines into a <span className="text-primary">Healthier Tomorrow</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Join India's first dual-mission platform that transforms medical waste into environmental solutions while
              creating a powerful public health intelligence system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="text-lg px-8 py-4 hover-lift animate-pulse-green" asChild>
                <a href="/register">
                  Start Your First Disposal
                  <ChevronRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 hover-lift bg-transparent">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Impact Counter */}
            <div className="bg-card rounded-2xl p-8 max-w-md mx-auto border border-border hover-lift">
              <div className="text-4xl font-bold text-primary mb-2">{impactCount.toLocaleString()}+</div>
              <div className="text-muted-foreground">Medicines Safely Recycled</div>
              <div className="flex items-center justify-center mt-4 space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  2,340 Users
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Growing Daily
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to make a difference for your community and environment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="hover-lift bg-card border-border">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-primary">{step.icon}</div>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-4">
                    {index + 1}. {step.title}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Mission Section */}
      <section id="mission" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Dual Mission</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're not just managing waste – we're building the future of public health intelligence
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {missions.map((mission, index) => (
              <Card key={index} className="hover-lift bg-card border-border">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {mission.icon}
                    <h3 className="text-2xl font-bold text-foreground ml-4">{mission.title}</h3>
                  </div>

                  <p className="text-muted-foreground mb-6 leading-relaxed">{mission.description}</p>

                  <div className="space-y-3">
                    {mission.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of Indians who are already contributing to a cleaner environment and smarter public health
            system.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4 hover-lift" asChild>
            <a href="/register">
              Get Started Today
              <ChevronRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/30 border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Recycle className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Pharma-Cycle</span>
              </div>
              <p className="text-muted-foreground">
                Transforming medical waste into environmental solutions and public health intelligence.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>How It Works</div>
                <div>Partners</div>
                <div>Rewards</div>
                <div>Health Data</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Connect</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>Twitter</div>
                <div>LinkedIn</div>
                <div>Instagram</div>
                <div>Newsletter</div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Pharma-Cycle. All rights reserved. Made with ❤️ for a healthier India.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
