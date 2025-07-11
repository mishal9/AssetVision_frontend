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
        setError('Invalid email or password. Please try again.')
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
   * Handle social login (Apple)
   */
  async function handleAppleLogin() {
    setIsLoading(true)
    setError(null)
    
    try {
      // This would be implemented with a real OAuth provider
      console.log('Apple login clicked - would integrate with Apple OAuth')
      // Mock success for demo purposes
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (err) {
      console.error('Apple login failed:', err)
      setError('Apple login failed. Please try again.')
      setIsLoading(false)
    }
  }

  /**
   * Handle social login (Google)
   */
  async function handleGoogleLogin() {
    setIsLoading(true)
    setError(null)
    
    try {
      // This would be implemented with a real OAuth provider
      console.log('Google login clicked - would integrate with Google OAuth')
      // Mock success for demo purposes
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (err) {
      console.error('Google login failed:', err)
      setError('Google login failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to Asset Vision</CardTitle>
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
              <div className="flex flex-col gap-4">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={handleAppleLogin}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  {isLoading ? 'Loading...' : 'Login with Apple'}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {isLoading ? 'Loading...' : 'Login with Google'}
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
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
