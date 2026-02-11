"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Fan, 
  Wrench, 
  Clock, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle,
  Star,
  Zap,
  Users,
  LayoutDashboard,
  X
} from "lucide-react"

// Admin Panel Component
function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard")
  // Fetch users from Convex
  const convexUsers = useQuery(api.users.list) || []
  
  // Use Convex users if available, otherwise use mock data
  const users = convexUsers.length > 0 ? convexUsers : [
    {
      _id: "mock-1" as any,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      status: "Active",
      joined: "2024-01-15",
    },
    {
      _id: "mock-2" as any,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "User",
      status: "Active",
      joined: "2024-01-18",
    },
    {
      _id: "mock-3" as any,
      name: "Bob Wilson",
      email: "bob.wilson@example.com",
      role: "User",
      status: "Pending",
      joined: "2024-01-20",
    },
    {
      _id: "mock-4" as any,
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      role: "User",
      status: "Active",
      joined: "2024-01-22",
    },
    {
      _id: "mock-5" as any,
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      role: "User",
      status: "Inactive",
      joined: "2024-01-25",
    },
    {
      _id: "mock-6" as any,
      name: "Diana Prince",
      email: "diana.prince@example.com",
      role: "Moderator",
      status: "Active",
      joined: "2024-01-28",
    },
    {
      _id: "mock-7" as any,
      name: "Eve Anderson",
      email: "eve.anderson@example.com",
      role: "User",
      status: "Active",
      joined: "2024-02-01",
    },
    {
      _id: "mock-8" as any,
      name: "Frank Miller",
      email: "frank.miller@example.com",
      role: "User",
      status: "Suspended",
      joined: "2024-02-02",
    },
  ]

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Back to Home
          </Button>
        </div>
      </nav>

      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your application</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard" onClick={() => setActiveTab("dashboard")}>Dashboard</TabsTrigger>
            <TabsTrigger value="users" onClick={() => setActiveTab("users")}>Users</TabsTrigger>
          </TabsList>

          {activeTab === "dashboard" && (
            <div className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">+12% from last hour</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231</div>
                  <p className="text-xs text-muted-foreground">+4.3% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.2%</div>
                  <p className="text-xs text-muted-foreground">+0.8% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest user actions and system events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">New user registration</p>
                        <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                      </div>
                      <Badge variant="secondary">2m ago</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Password reset requested</p>
                        <p className="text-xs text-muted-foreground">jane.smith@example.com</p>
                      </div>
                      <Badge variant="secondary">5m ago</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Email verified</p>
                        <p className="text-xs text-muted-foreground">bob.wilson@example.com</p>
                      </div>
                      <Badge variant="secondary">12m ago</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Profile updated</p>
                        <p className="text-xs text-muted-foreground">alice.johnson@example.com</p>
                      </div>
                      <Badge variant="secondary">25m ago</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Failed login attempt</p>
                        <p className="text-xs text-muted-foreground">unknown@hacker.com</p>
                      </div>
                      <Badge variant="secondary">1h ago</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Current health of your application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Database</span>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Server</span>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auth Service</span>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email Service</span>
                      <Badge className="bg-yellow-500">Degraded</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Storage</span>
                      <Badge className="bg-green-500">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage all registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium text-sm">User</th>
                          <th className="text-left p-4 font-medium text-sm">Email</th>
                          <th className="text-left p-4 font-medium text-sm">Role</th>
                          <th className="text-left p-4 font-medium text-sm">Status</th>
                          <th className="text-left p-4 font-medium text-sm">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user._id}
                            className="border-b hover:bg-muted/50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <span className="text-sm font-medium">{user.name}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-muted-foreground">{user.email}</span>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="capitalize">{user.role}</Badge>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  user.status === "Active"
                                    ? "default"
                                    : user.status === "Pending"
                                    ? "secondary"
                                    : user.status === "Suspended"
                                    ? "destructive"
                                    : "outline"
                                }
                                className="capitalize"
                              >
                                {user.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-muted-foreground">{user.joined}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  )
}

// Home Page Component
function HomePage() {
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  return (
    <main className="min-h-screen">
      {/* Auth Dialog */}
      {showAuthDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 relative">
            <button
              onClick={() => setShowAuthDialog(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
              <CardDescription>
                Sign in or sign up to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button className="flex-1" onClick={() => setShowAuthDialog(false)}>
                  Sign In
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => setShowAuthDialog(false)}>
                  Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Fan className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FanFix Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">Services</a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">About</a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</a>
            <Button onClick={() => setShowAuthDialog(true)}>Sign In / Sign Up</Button>
            <Button variant="outline" onClick={() => window.location.href = "/?page=admin"}>Admin Panel</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="secondary" className="text-sm">
            <Star className="w-3 h-3 mr-1" />
            Trusted by 500+ customers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Expert Fan Repair Services You Can Trust
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Professional ceiling fan repair, maintenance, and installation. Fast, reliable, and affordable solutions for your home and business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-base">
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </Button>
            <Button size="lg" variant="outline" className="text-base">
              View Services
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Same Day Service</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">100% Satisfaction</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Expert Technicians</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="container py-20 bg-muted/30">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive fan repair and maintenance solutions for all types of fans
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Ceiling Fan Repair</CardTitle>
              <CardDescription>
                Expert diagnosis and repair of all ceiling fan issues including motor problems, wobbling, and electrical faults.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Motor repair & replacement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Blade balancing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Speed control fixes
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Installation Services</CardTitle>
              <CardDescription>
                Professional installation of new ceiling fans, exhaust fans, and industrial fans for homes and businesses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Residential installation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Commercial installation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Smart fan setup
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Fan className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Preventive Maintenance</CardTitle>
              <CardDescription>
                Regular maintenance programs to keep your fans running efficiently and extend their lifespan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Annual inspection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Cleaning & lubrication
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Performance optimization
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Emergency Repairs</CardTitle>
              <CardDescription>
                24/7 emergency repair services for urgent fan issues that can't wait until regular business hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Rapid response
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Weekend availability
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  No extra charge
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Premium Upgrades</CardTitle>
              <CardDescription>
                Upgrade your existing fans with modern features like remote controls, LED lights, and smart home integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Remote control kits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  LED light kits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Smart home integration
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Industrial Solutions</CardTitle>
              <CardDescription>
                Specialized repair and maintenance services for industrial fans, exhaust systems, and ventilation equipment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Industrial fan repair
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Exhaust systems
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  HVAC fan maintenance
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose FanFix Pro?</h2>
            <p className="text-muted-foreground text-lg">
              With over 15 years of experience, we've built a reputation for excellence in fan repair and maintenance services. Our certified technicians are dedicated to providing top-quality workmanship and customer satisfaction.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Certified Technicians</h3>
                  <p className="text-sm text-muted-foreground">All our technicians are fully certified and trained to handle all types of fan repairs.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Fast Response Time</h3>
                  <p className="text-sm text-muted-foreground">We offer same-day service and emergency repairs to get your fans running quickly.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Satisfaction Guaranteed</h3>
                  <p className="text-sm text-muted-foreground">We stand behind our work with a 100% satisfaction guarantee on all repairs.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">15+</CardTitle>
                <CardDescription>Years Experience</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">500+</CardTitle>
                <CardDescription>Happy Customers</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">98%</CardTitle>
                <CardDescription>Satisfaction Rate</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">24/7</CardTitle>
                <CardDescription>Emergency Support</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Get In Touch</h2>
          <p className="text-muted-foreground text-lg">
            Ready to get your fans running smoothly? Contact us today for a free quote or to schedule a service appointment.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Call Us</CardTitle>
                <CardDescription className="text-base font-medium text-foreground">
                  (555) 123-4567
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Email Us</CardTitle>
                <CardDescription className="text-base font-medium text-foreground">
                  info@fanfixpro.com
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Visit Us</CardTitle>
                <CardDescription className="text-base font-medium text-foreground">
                  123 Fan Street, City
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-base">
              <Phone className="w-4 h-4 mr-2" />
              Request a Quote
            </Button>
            <Button size="lg" variant="outline" className="text-base">
              Schedule Service
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2024 FanFix Pro. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

export default function Home() {
  const searchParams = useSearchParams()
  const page = searchParams.get("page")

  if (page === "admin") {
    return <AdminPanel />
  }

  return <HomePage />
}
