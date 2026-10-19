import { Icon } from './Icon'

interface StatCardProps {
  label: string
  value: string | React.ReactNode
  icon: string
  iconColor?: string
  iconBg?: string
  trend?: { text: string; color?: string; icon?: string; tone?: 'up' | 'down' | 'neutral' }
  footnote?: React.ReactNode
  progress?: number
  progressColor?: string
  className?: string
  children?: React.ReactNode
}

const toneStyles: Record<'up' | 'down' | 'neutral', string> = {
  up: 'bg-primary/10 text-primary',
  down: 'bg-error-container/60 text-error',
  neutral: 'bg-surface-container text-on-surface-variant',
}

export function StatCard({
  label,
  value,
  icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  trend,
  footnote,
  progress,
  progressColor = 'bg-primary',
  className = '',
  children,
}: StatCardProps) {
  const tone = trend?.tone
  return (
    <div
      className={`relative overflow-hidden bg-surface-container-lowest p-xl rounded-2xl border border-outline-variant/30 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)] transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between gap-md">
        <div className="min-w-0 flex-1">
          <p className="font-label text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
          <div className="mt-2">
            <h2 className="font-headline text-[24px] leading-tight font-bold text-on-surface tabular-nums">{value}</h2>
          </div>
        </div>
        <div className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0`}>
          <Icon name={icon} className="text-[22px]" />
        </div>
      </div>

      {trend && (
        <div className="mt-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              tone ? toneStyles[tone] : `bg-transparent ${trend.color ?? 'text-primary'}`
            }`}
          >
            {(trend.icon || tone === 'up' || tone === 'down') && (
              <Icon
                name={trend.icon ?? (tone === 'up' ? 'trending_up' : 'trending_down')}
                className="text-[13px]"
              />
            )}
            {trend.text}
          </span>
        </div>
      )}

      {footnote && <p className="font-label text-label-sm text-on-surface-variant mt-2">{footnote}</p>}

      {typeof progress === 'number' && (
        <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} rounded-full transition-all duration-1000`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      {children}
    </div>
  )
}
