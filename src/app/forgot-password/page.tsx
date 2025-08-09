import { BarChart3 } from "lucide-react"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export const metadata = {
  title: "Forgot Password | AlphaOptimize",
  description: "Reset your AlphaOptimize account password.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <BarChart3 className="size-4" />
          </div>
          AlphaOptimize
        </a>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
