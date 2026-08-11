import { Icon } from './Icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'dark' | 'error'
  icon?: string
  iconClassName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  rounded?: string
}

const base =
  'inline-flex items-center justify-center gap-2 font-label transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap'

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-on-primary hover:shadow-xl hover:shadow-primary/20',
  secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
  ghost: 'bg-transparent text-on-surface-variant hover:text-primary hover:bg-surface-container',
  outline: 'border-2 border-primary/20 text-primary hover:bg-primary/5',
  dark: 'bg-on-surface text-surface hover:bg-on-surface-variant',
  error: 'bg-error-container text-on-error-container hover:opacity-90',
}

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-label-sm rounded-lg',
  md: 'px-4 py-2.5 text-label-md rounded-xl',
  lg: 'px-6 py-3 text-label-md rounded-xl',
  xl: 'px-8 py-4 text-label-md rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'lg',
  icon,
  iconClassName = 'text-[20px]',
  rounded,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${rounded ?? ''} ${className}`} {...rest}>
      {icon && <Icon name={icon} className={iconClassName} />}
      {children}
    </button>
  )
}
