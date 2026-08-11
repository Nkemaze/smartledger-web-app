import { Icon } from './Icon'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string
  rounded?: string
  variant?: 'pill' | 'box' | 'field'
}

export function Input({ icon, rounded = 'rounded-full', variant = 'pill', className = '', ...rest }: InputProps) {
  const variants = {
    pill: 'bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20',
    box: 'bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20',
    field: 'bg-surface-container rounded-xl border-l-4 border-l-transparent focus:border-primary focus:ring-2 focus:ring-primary/20',
  }
  return (
    <div className="relative flex items-center">
      {icon && <Icon name={icon} className="absolute left-4 text-on-surface-variant text-md" />}
      <input
        className={`w-full outline-none transition-all text-body-md text-on-surface placeholder:text-outline/50 ${variants[variant]} ${rounded} ${icon ? 'pl-12 pr-4' : 'px-4'} py-2.5 ${className}`}
        {...rest}
      />
    </div>
  )
}

export function Select({
  icon,
  rounded = 'rounded-2xl',
  className = '',
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: string; rounded?: string }) {
  return (
    <div className="relative flex items-center">
      <select
        className={`appearance-none outline-none cursor-pointer font-label text-label-md text-on-surface bg-surface-container-low focus:ring-2 focus:ring-primary/20 transition-all ${rounded} px-lg py-3 pr-10 ${icon ? 'pl-10' : ''} ${className}`}
        {...rest}
      >
        {children}
      </select>
      <span className="material-symbols-outlined absolute right-3 pointer-events-none text-on-surface-variant text-md">
        expand_more
      </span>
    </div>
  )
}
