// =============================================================================
// Debounced Value Hook
// =============================================================================
// Delays updating a value until the user stops changing it for a specified time.
// Useful for search inputs to avoid firing API calls on every keystroke.

import { useState, useEffect } from 'react'

/**
 * Returns a debounced version of the input value.
 * The returned value only updates after the specified delay has passed
 * without the input value changing.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearch = useDebouncedValue(searchTerm, 300)
 *
 * // debouncedSearch only updates 300ms after user stops typing
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     fetchResults(debouncedSearch)
 *   }
 * }, [debouncedSearch])
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timer if the value changes before delay completes
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
