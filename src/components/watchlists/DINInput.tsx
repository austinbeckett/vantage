// =============================================================================
// DIN Input
// =============================================================================
// Simple input for Drug Identification Number (8-digit format)

import { useState, useRef, useEffect } from 'react'
import { Hash, X } from 'lucide-react'
import { MIN_DIN_LENGTH } from '../../lib/hooks'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface DINInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DINInput({
  value,
  onChange,
  placeholder = 'e.g., 02303310',
  label = 'Drug Identification Number (DIN)',
}: DINInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 8)
    setInputValue(newValue)
    onChange(newValue)
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    inputRef.current?.focus()
  }

  const isPartial = inputValue.length > 0 && inputValue.length < MIN_DIN_LENGTH

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          maxLength={8}
          className={`
            w-full px-4 py-2.5 pr-20
            bg-white dark:bg-neutral-800
            border rounded-lg
            text-neutral-900 dark:text-neutral-100
            placeholder:text-neutral-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/30
            font-mono tracking-wider
            ${isPartial
              ? 'border-amber-400 dark:border-amber-500'
              : 'border-neutral-200 dark:border-neutral-700'
            }
          `}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {inputValue && (
            <>
              <span className={`text-xs font-mono ${isPartial ? 'text-amber-500' : 'text-neutral-400'}`}>
                {inputValue.length}/8
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <Hash className="w-4 h-4 text-neutral-400" />
        </div>
      </div>

      {isPartial && (
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
          DIN must be 8 digits
        </p>
      )}
    </div>
  )
}
