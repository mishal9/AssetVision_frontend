import { BarChart3 } from "lucide-react"
import { RegisterForm } from "@/components/register-form"

export const metadata = {
  title: "Register | Asset Vision",
  description: "Create an Asset Vision account to manage your investment portfolio.",
}

export default function RegisterPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <BarChart3 className="size-4" />
          </div>
          Asset Vision
        </a>
        <RegisterForm />
      </div>
    </div>
  )
}
