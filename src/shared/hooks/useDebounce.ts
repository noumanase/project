// ─────────────────────────────────────────────────────────────────────────────
// shared/hooks/useDebounce.ts
//
// Debounces a value — prevents firing a new API request on every keystroke
// when the user is typing in a filter/search input.
//
// Usage:
//   const [search, setSearch] = useState('')
//   const debouncedSearch = useDebounce(search, 400)
//
//   useQuery({ queryKey: ['users', debouncedSearch], ... })
//   // ↑ only fires when the user stops typing for 400ms
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => { clearTimeout(timer); }
  }, [value, delay])

  return debouncedValue
}
