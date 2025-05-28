"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const { login, loginWithPhone, register, sendOTP } = useAuth()
  const { toast } = useToast()

  const [emailForm, setEmailForm] = useState({
    email: "praveen@gmail.com",
    password: "pass@123",
    name: "",
  })

  const [phoneForm, setPhoneForm] = useState({
    phone: "",
    otp: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [isRegister, setIsRegister] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let success = false

      if (isRegister) {
        success = await register(emailForm.email, emailForm.password, emailForm.name)
      } else {
        success = await login(emailForm.email, emailForm.password)
      }

      if (success) {
        toast({
          title: "Success!",
          description: isRegister ? "Account created successfully!" : "Welcome back!",
        })
      } else {
        toast({
          title: "Authentication failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOTP = async () => {
    setIsLoading(true)

    try {
      const success = await sendOTP(phoneForm.phone)
      if (success) {
        setOtpSent(true)
        toast({
          title: "OTP sent",
          description: "Check your phone for the verification code.",
        })
      } else {
        toast({
          title: "Failed to send OTP",
          description: "Please check your phone number and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await loginWithPhone(phoneForm.phone, phoneForm.otp)
      if (success) {
        toast({
          title: "Success!",
          description: "Welcome to MindMate!",
        })
      } else {
        toast({
          title: "Verification failed",
          description: "Please check your OTP and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to MindMate</CardTitle>
          <p className="text-gray-600">Your personal AI assistant</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isRegister && (
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={emailForm.name}
                    onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                    required
                  />
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  required
                />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setIsRegister(!isRegister)}>
                  {isRegister ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone">
              <div className="space-y-4">
                {!otpSent ? (
                  <>
                    <Input
                      type="tel"
                      placeholder="Phone Number (+1234567890)"
                      value={phoneForm.phone}
                      onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                      required
                    />
                    <Button onClick={handleSendOTP} className="w-full" disabled={isLoading}>
                      {isLoading ? "Sending..." : "Send OTP"}
                    </Button>
                  </>
                ) : (
                  <form onSubmit={handlePhoneAuth} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      value={phoneForm.otp}
                      onChange={(e) => setPhoneForm({ ...phoneForm, otp: e.target.value })}
                      required
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full" onClick={() => setOtpSent(false)}>
                      Change Phone Number
                    </Button>
                  </form>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
