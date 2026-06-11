import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge.
 * Handles class conflicts and conditional classes.
 *
 * @example
 * cn('px-4 py-2', 'px-6', { 'bg-primary': isActive }) // → 'py-2 px-6 bg-primary'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
