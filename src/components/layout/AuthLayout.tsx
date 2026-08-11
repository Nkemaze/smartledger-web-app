import type { ReactNode } from 'react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-md bg-surface font-body text-body-md text-on-surface">
      <div className="flex flex-col w-full max-w-container-max mx-auto">{children}</div>
    </main>
  )
}

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-[100px]" />
    </div>
  )
}
