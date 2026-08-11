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
      className={`bg-surface-container-lowest rounded-3xl shadow-sm ${onClick ? 'cursor-pointer' : ''} ${className}`}
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
