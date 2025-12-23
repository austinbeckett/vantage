// =============================================================================
// Search Confirmation Modal
// =============================================================================
// Modal for selecting from multiple search results when creating a watchlist

import { useState } from 'react'
import { X, Package, Pill, Loader2, AlertCircle, Check } from 'lucide-react'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface SearchConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedValue: string) => void
  searchType: 'brand' | 'ingredient'
  searchTerm: string
  results: string[]
  isLoading?: boolean
  error?: string | null
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function SearchConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  searchType,
  searchTerm,
  results,
  isLoading = false,
  error = null,
}: SearchConfirmationModalProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null)

  if (!isOpen) return null

  const Icon = searchType === 'brand' ? Package : Pill
  const title = searchType === 'brand' ? 'Select Product' : 'Select Ingredient'
  const subtitle = searchType === 'brand'
    ? `Multiple products match "${searchTerm}"`
    : `Multiple ingredients match "${searchTerm}"`

  const handleConfirm = () => {
    if (selectedValue) {
      onConfirm(selectedValue)
    }
  }

  const handleSelect = (value: string) => {
    setSelectedValue(value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
              <span className="ml-2 text-neutral-500 dark:text-neutral-400">
                Searching...
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
              <span className="text-red-600 dark:text-red-400">{error}</span>
            </div>
          ) : results.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <AlertCircle className="w-6 h-6 text-amber-500 mr-2" />
              <span className="text-neutral-500 dark:text-neutral-400">
                No {searchType === 'brand' ? 'products' : 'ingredients'} found for "{searchTerm}"
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, idx) => (
                <button
                  key={`${result}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(result)}
                  className={`
                    w-full px-4 py-3 rounded-xl text-left
                    flex items-center gap-3
                    transition-all duration-150
                    ${selectedValue === result
                      ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500 ring-2 ring-primary-500/20'
                      : 'bg-neutral-50 dark:bg-neutral-700/50 border-2 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                    ${selectedValue === result
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400'
                    }
                  `}>
                    {selectedValue === result ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`
                    font-medium truncate
                    ${selectedValue === result
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-neutral-700 dark:text-neutral-300'
                    }
                  `}>
                    {result}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedValue || isLoading}
            className={`
              px-5 py-2 text-sm font-medium rounded-lg transition-colors
              ${selectedValue && !isLoading
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'
              }
            `}
          >
            Create Watchlist
          </button>
        </div>
      </div>
    </div>
  )
}
