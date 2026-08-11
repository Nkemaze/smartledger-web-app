interface ToggleProps {
  checked: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  disabledColor?: boolean
  size?: 'md' | 'lg'
}

export function Toggle({ checked, onChange, disabled = false, disabledColor = false, size = 'md' }: ToggleProps) {
  const track =
    size === 'md' ? 'w-11 h-6' : 'w-14 h-8'
  const knob = size === 'md' ? 'w-5 h-5' : 'w-7 h-7'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex items-center rounded-full transition-colors ${track} ${
        checked
          ? disabledColor
            ? 'bg-primary/40'
            : 'bg-secondary'
          : disabled
          ? 'bg-surface-container-highest opacity-50 cursor-not-allowed'
          : 'bg-surface-container-highest'
      } ${disabled && !disabledColor ? 'cursor-not-allowed' : ''}`}
    >
      <span
        className={`absolute top-[2px] left-[2px] rounded-full bg-white shadow transition-transform ${knob} ${
          checked ? 'translate-x-full' : ''
        } ${disabledColor && checked ? 'bg-primary' : ''}`}
      />
    </button>
  )
}
