import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      className={`bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.05)] transition-shadow ${
        onClick ? 'cursor-pointer hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)]' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  right,
  className = '',
}: {
  title: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center justify-between gap-4 px-xl py-5 border-b border-outline-variant/5 ${className}`}>
      <div className="space-y-0.5">
        <h3 className="font-headline text-headline-md text-on-surface">{title}</h3>
        {subtitle && <p className="font-label text-label-md text-on-surface-variant">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}
