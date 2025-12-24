// =============================================================================
// Portal Component
// =============================================================================
// Renders children into document.body using React Portal
// Useful for dropdowns that need to escape overflow:hidden containers

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

interface PortalProps {
  children: React.ReactNode
}

export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(children, document.body)
}
