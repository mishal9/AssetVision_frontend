import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | AlphaOptimize',
  description: 'Login to your AlphaOptimize account to access your portfolio dashboard.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}


