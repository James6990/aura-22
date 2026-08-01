'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bluetooth, Check, Loader2, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

type Status = 'idle' | 'connecting' | 'connected' | 'unsupported' | 'error'

const LABELS: Record<Status, string> = {
  idle: 'Connect Watch',
  connecting: 'Connecting…',
  connected: 'Synced',
  unsupported: 'Not Supported',
  error: 'Connect Watch',
}

export function AuraHeader({
  status,
  onConnect,
  userName,
  saving,
}: {
  status: Status
  onConnect: () => void
  userName: string
  saving: boolean
}) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const connected = status === 'connected'
  const connecting = status === 'connecting'

  const handleSignOut = async () => {
    setSigningOut(true)
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="text-lg font-black tracking-tight text-primary">
            AURA 22
          </span>
          <span className="truncate text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {saving ? 'Saving…' : userName ? `Hi, ${userName}` : 'Adaptive Journal'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onConnect}
            disabled={connecting || status === 'unsupported'}
            className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {connecting ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : connected ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Bluetooth className="size-3.5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{LABELS[status]}</span>
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out"
            className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="size-3.5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
