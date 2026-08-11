import type { ReactNode } from 'react'

export function Modal({
  open,
  onClose,
  children,
  className = '',
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-surface-container-lowest rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-lg ${className}`}>
        {children}
      </div>
    </div>
  )
}
