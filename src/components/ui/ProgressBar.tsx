export function ProgressBar({
  value,
  color = 'bg-primary',
  track = 'bg-surface-container',
  height = 'h-1',
  className = '',
}: {
  value: number
  color?: string
  track?: string
  height?: string
  className?: string
}) {
  return (
    <div className={`${height} w-full ${track} rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${color} rounded-full transition-all duration-1000`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
