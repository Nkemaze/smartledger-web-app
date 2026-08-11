import { Icon } from './Icon'

type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'outline'

const tones: Record<BadgeTone, string> = {
  success: 'bg-primary/10 text-primary',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-error-container text-on-error-container',
  info: 'bg-secondary-container text-on-secondary-container',
  neutral: 'bg-surface-container-highest text-on-surface-variant',
  outline: 'bg-surface-container text-on-surface-variant',
}

const dotColors: Record<BadgeTone, string> = {
  success: 'bg-primary',
  warning: 'bg-amber-500 animate-pulse',
  error: 'bg-error',
  info: 'bg-secondary',
  neutral: 'bg-outline-variant',
  outline: 'bg-outline',
}

export function Badge({
  tone = 'success',
  children,
  dot = false,
  pulse = false,
  className = '',
  icon,
}: {
  tone?: BadgeTone
  children: React.ReactNode
  dot?: boolean
  pulse?: boolean
  className?: string
  icon?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase ${tones[tone]} ${className}`}
    >
      {icon && <Icon name={icon} className="text-[14px]" filled />}
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[tone]} ${pulse ? 'animate-pulse' : ''}`} />}
      {children}
    </span>
  )
}
