"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Factory, ArrowRight, LayoutDashboard, Database, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero / Header Section */}
      <section className="bg-white border-b">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
              Agricultural Management Portal
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Welcome to the official data management system for The Division of Food Security.
              Securely manage farmer registrations, agro-processor operations, and supply chain analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="container py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Farmers Card */}
          <Card className="hover:shadow-lg transition-shadow border-emerald-100 bg-white">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 text-left">Farmer Management</CardTitle>
              <CardDescription className="text-slate-500 text-left">
                Register new farmers, update crop data, and manage agricultural districts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100"
                onClick={() => window.location.href = "/farmers"}
              >
                Access Farmer Database
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Agro-Processors Card */}
          <Card className="hover:shadow-lg transition-shadow border-indigo-100 bg-white">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 border border-indigo-100">
                <Factory className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 text-left">Agro-Processor Management</CardTitle>
              <CardDescription className="text-slate-500 text-left">
                Manage processing facilities, production volumes, and commodity types.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
                onClick={() => window.location.href = "/agro-processors"}
              >
                Access Processor Database
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Overview */}
      <section className="container py-12 border-t mt-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8 text-center text-left">System Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100">
            <div className="p-2 bg-slate-50 rounded-lg">
              <Database className="h-6 w-6 text-slate-600" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800 mb-1">Centralized Data</h3>
              <p className="text-sm text-slate-500">Real-time sync between farmer supply and processor demand.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100">
            <div className="p-2 bg-slate-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-slate-600" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800 mb-1">Advanced Analytics</h3>
              <p className="text-sm text-slate-500">Visualize distribution patterns across all agricultural districts.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100">
            <div className="p-2 bg-slate-50 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-slate-600" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800 mb-1">Multi-Filter Views</h3>
              <p className="text-sm text-slate-500">Filter datasets by district, commodity, or custom criteria.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-12 bg-white">
        <div className="container text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} The Division of Food Security. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
