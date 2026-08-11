export function Avatar({
  initials,
  src,
  size = 'w-10 h-10',
  className = '',
  ring,
}: {
  initials?: string
  src?: string
  size?: string
  className?: string
  ring?: string
}) {
  const bg = 'bg-surface-container-high text-on-surface-variant'
  return (
    <div
      className={`${size} rounded-full overflow-hidden flex items-center justify-center font-bold flex-shrink-0 ${bg} ${ring ?? ''} ${className}`}
    >
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-bold">{initials}</span>
      )}
    </div>
  )
}
