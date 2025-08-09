'use client';

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/auth"
import { useAppDispatch } from "@/store"
import { fetchLinkedAccounts } from "@/store/userSlice"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [email, setEmail] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')
  const [error, setError] = React.useState<string | null>(null)
  const dispatch = useAppDispatch()
  const router = useRouter()

  /**
   * Handle form submission for email/password login
   */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate input fields first
      if (!email.trim()) {
        setError('Email is required')
        setIsLoading(false)
        return
      }

      if (!password) {
        setError('Password is required')
        setIsLoading(false)
        return
      }

      // Call the authentication service to login
      await authService.login(email, password)
      
      // Fetch linked accounts after successful login
      dispatch(fetchLinkedAccounts())
      
      // Redirect to dashboard on successful login
      router.push('/')
    } catch (error: unknown) {
      // Use the enhanced error messages from the auth service if available
      if ((error as any).authErrorMessage) {
        setError((error as any).authErrorMessage)
      } else if ((error as any).message && (error as any).message.includes('401')) {
        setError('Invalid email or password. If you just registered, please check your email and click the confirmation link first.')
      } else if ((error as any).message && (error as any).message.includes('network')) {
        setError('Unable to connect to the server. Please check your internet connection.')
      } else {
        setError('An error occurred during login. Please try again later.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * (Social logins removed)
   */
  

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to AlphaOptimize</CardTitle>
          <CardDescription>
            Login to access your portfolio dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive mb-4 rounded-md p-3 text-sm flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
              <div className="text-center text-sm space-y-2">
                <div className="text-muted-foreground text-xs bg-amber-50 border border-amber-200 rounded-md p-2">
                  📧 New users: Please confirm your email before signing in. Check your inbox for the confirmation link.
                </div>
                <div>
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
                <div className="text-muted-foreground">
                  Or{" "}
                  <Link href="/demo" className="text-blue-600 hover:text-blue-800 underline underline-offset-4 font-medium">
                    try our interactive demo
                  </Link>
                  {" "}(no signup required)
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <Link href="/terms">Terms of Service</Link>{" "}
        and <Link href="/privacy">Privacy Policy</Link>.
      </div>
    </div>
  )
}
