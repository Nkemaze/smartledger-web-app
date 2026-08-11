import { Icon } from './Icon'

interface StatCardProps {
  label: string
  value: string | React.ReactNode
  icon: string
  iconColor?: string
  iconBg?: string
  trend?: { text: string; color?: string; icon?: string }
  footnote?: React.ReactNode
  progress?: number
  progressColor?: string
  className?: string
  children?: React.ReactNode
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
  return (
    <div
      className={`relative overflow-hidden bg-surface-container-lowest p-xl rounded-2xl shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-label text-label-md text-on-surface-variant mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <h2 className="font-headline text-headline-lg text-on-surface">{value}</h2>
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 text-label-sm font-bold ${trend.color ?? 'text-primary'}`}
              >
                {trend.icon && <Icon name={trend.icon} className="text-sm" />}
                {trend.text}
              </span>
            )}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0`}>
          <Icon name={icon} className="text-2xl" />
        </div>
      </div>
      {footnote && <p className="font-label text-label-sm text-on-surface-variant mt-2">{footnote}</p>}
      {typeof progress === 'number' && (
        <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
          <div className={`h-full ${progressColor} rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }} />
        </div>
      )}
      {children}
    </div>
  )
}
