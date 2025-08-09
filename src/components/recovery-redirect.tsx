'use client'

import { useEffect } from 'react'

/**
 * RecoveryRedirect
 * Client-only helper that forwards Supabase password recovery links
 * from `/login#access_token=...&type=recovery` to `/reset-password` while
 * preserving the hash so the token remains available to the frontend.
 */
export function RecoveryRedirect() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash || ''
    if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
      window.location.replace(`/reset-password${hash}`)
    }
  }, [])

  return null
}


