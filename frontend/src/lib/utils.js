import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function cva(base, config = {}) {
  const { variants = {}, defaultVariants = {} } = config

  return function (props = {}) {
    const { className, ...rest } = props
    const variantClasses = Object.keys(variants).reduce((acc, variant) => {
      const value = rest[variant] || defaultVariants[variant]
      if (value && variants[variant][value]) {
        acc.push(variants[variant][value])
      }
      return acc
    }, [])

    return cn(base, ...variantClasses, className)
  }
}
