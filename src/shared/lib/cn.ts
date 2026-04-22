// ─────────────────────────────────────────────────────────────────────────────
// shared/lib/cn.ts
//
// Combines clsx (conditional classes) + tailwind-merge (deduplication).
// Use this everywhere instead of template literals for class names.
//
// Without this, Tailwind classes conflict silently:
//   className={`p-2 ${large ? 'p-4' : ''}`}  ← both p-2 and p-4 apply, p-2 wins by accident
//
// With cn():
//   cn('p-2', large && 'p-4')  ← tailwind-merge correctly drops p-2, applies p-4
// ─────────────────────────────────────────────────────────────────────────────

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
