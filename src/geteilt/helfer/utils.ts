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

/**
 * Auf 2 Dezimalstellen runden (für Währungsbeträge).
 */
export function runde2(wert: number): number {
  return Math.round(wert * 100) / 100
}

/**
 * Zahl als Währungsbetrag formatieren (Euro).
 */
export function formatiereWaehrung(wert: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(wert)
}

/**
 * Prozentwert formatieren.
 */
export function formatiereProzent(wert: number, nachkommastellen: number = 1): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: nachkommastellen,
    maximumFractionDigits: nachkommastellen,
  }).format(wert / 100)
}
