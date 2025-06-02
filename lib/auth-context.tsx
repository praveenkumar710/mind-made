"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithPhone: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string; developmentOtp?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("🔄 Checking existing session...")
    // Check for existing session
    const token = localStorage.getItem("token")
    if (token) {
      console.log("📝 Token found, verifying...")
      fetchUser(token)
    } else {
      console.log("📝 No token found")
      setLoading(false)
    }
  }, [])

  const fetchUser = async (token: string) => {
    try {
      console.log("🔄 Fetching user data...")
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const userData = await response.json()
        console.log("✅ User data fetched:", userData.email)
        setUser(userData)
      } else {
        console.log("❌ Token verification failed, removing token")
        localStorage.removeItem("token")
      }
    } catch (error) {
      console.error("❌ Error fetching user:", error)
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("🔄 Attempting login for:", email)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("✅ Login successful")
        localStorage.setItem("token", data.token)
        setUser(data.user)
        return { success: true }
      } else {
        console.log("❌ Login failed:", data.error)
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      console.error("❌ Login error:", error)
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const loginWithPhone = async (phone: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("🔄 Attempting phone login for:", phone)
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("✅ Phone login successful")
        localStorage.setItem("token", data.token)
        setUser(data.user)
        return { success: true }
      } else {
        console.log("❌ Phone login failed:", data.error)
        return { success: false, error: data.error || "Phone login failed" }
      }
    } catch (error) {
      console.error("❌ Phone login error:", error)
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("🔄 Attempting registration for:", email)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("✅ Registration successful")
        localStorage.setItem("token", data.token)
        setUser(data.user)
        return { success: true }
      } else {
        console.log("❌ Registration failed:", data.error)
        return { success: false, error: data.error || "Registration failed" }
      }
    } catch (error) {
      console.error("❌ Registration error:", error)
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const sendOTP = async (phone: string): Promise<{ success: boolean; error?: string; developmentOtp?: string }> => {
    try {
      console.log("🔄 Sending OTP to:", phone)
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("✅ OTP sent successfully")
        return {
          success: true,
          developmentOtp: data.developmentOtp, // Only in development
        }
      } else {
        console.log("❌ OTP send failed:", data.error)
        return { success: false, error: data.error || "Failed to send OTP" }
      }
    } catch (error) {
      console.error("❌ Send OTP error:", error)
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const logout = () => {
    console.log("🔄 Logging out...")
    localStorage.removeItem("token")
    setUser(null)
    console.log("✅ Logged out successfully")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithPhone,
        register,
        sendOTP,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
