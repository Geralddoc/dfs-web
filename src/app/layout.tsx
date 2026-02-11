import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Header } from "@/components/header"

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "The Division of Food Security",
  description: "Expert ceiling fan repair, maintenance, and installation services. Fast, reliable, and affordable fan solutions for your home and business.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
