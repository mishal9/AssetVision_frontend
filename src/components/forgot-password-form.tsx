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

/**
 * Forgot Password form component
 * Handles password reset requests
 */
export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [email, setEmail] = React.useState<string>('')
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<boolean>(false)
  const router = useRouter()

  /**
   * Handle form submission for password reset request
   */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await authService.requestPasswordReset(email)
      setSuccess(true)
    } catch (err) {
      const message = (err as any)?.authErrorMessage || (err as any)?.message || 'Failed to send password reset email. Please try again.'
      console.error('Password reset request failed:', err)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive mb-4 rounded-md p-3 text-sm">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="bg-green-100 text-green-800 mb-4 rounded-md p-3 text-sm dark:bg-green-900/30 dark:text-green-400">
              Password reset email sent! Please check your inbox and follow the instructions.
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/login')}
                >
                  Return to Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
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
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <div className="text-center text-sm">
                  Remember your password?{" "}
                  <Link href="/login" className="underline underline-offset-4">
                    Back to login
                  </Link>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
