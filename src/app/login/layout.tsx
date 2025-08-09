import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | Asset Vision',
  description: 'Login to your Asset Vision account to access your portfolio dashboard.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}


