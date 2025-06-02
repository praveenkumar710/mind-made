"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const { login, loginWithPhone, register, sendOTP } = useAuth()
  const { toast } = useToast()

  const [emailForm, setEmailForm] = useState({
    email: "",
    password: "",
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
  const [error, setError] = useState("")
  const [developmentOtp, setDevelopmentOtp] = useState("")

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      let result

      if (isRegister) {
        if (!emailForm.name.trim()) {
          setError("Name is required")
          setIsLoading(false)
          return
        }
        result = await register(emailForm.email, emailForm.password, emailForm.name)
      } else {
        result = await login(emailForm.email, emailForm.password)
      }

      if (result.success) {
        toast({
          title: "Success!",
          description: isRegister ? "Account created successfully!" : "Welcome back!",
        })
      } else {
        setError(result.error || "Authentication failed")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!phoneForm.phone.trim()) {
      setError("Phone number is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await sendOTP(phoneForm.phone)
      if (result.success) {
        setOtpSent(true)
        if (result.developmentOtp) {
          setDevelopmentOtp(result.developmentOtp)
          toast({
            title: "Development Mode",
            description: `OTP: ${result.developmentOtp}`,
          })
        } else {
          toast({
            title: "OTP sent",
            description: "Check your phone for the verification code.",
          })
        }
      } else {
        setError(result.error || "Failed to send OTP")
      }
    } catch (error) {
      setError("Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await loginWithPhone(phoneForm.phone, phoneForm.otp)
      if (result.success) {
        toast({
          title: "Success!",
          description: "Welcome to MindMate!",
        })
      } else {
        setError(result.error || "Verification failed")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to MindMate</CardTitle>
          <p className="text-gray-600">Your personal AI assistant</p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {developmentOtp && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Development OTP: <strong>{developmentOtp}</strong>
              </AlertDescription>
            </Alert>
          )}

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
                    placeholder="Password (min 6 characters)"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                    required
                    minLength={6}
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
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setIsRegister(!isRegister)
                    setError("")
                  }}
                >
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
                      maxLength={6}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setOtpSent(false)
                        setError("")
                        setDevelopmentOtp("")
                      }}
                    >
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
