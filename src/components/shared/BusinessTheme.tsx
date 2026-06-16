'use client'

import { useEffect } from 'react'

interface BusinessThemeProps {
  primaryColor?: string | null
  secondaryColor?: string | null
}

export function BusinessTheme({ primaryColor, secondaryColor }: BusinessThemeProps) {
  useEffect(() => {
    const root = document.documentElement

    if (primaryColor) {
      root.style.setProperty('--primary', primaryColor)
      root.style.setProperty('--biz-primary', primaryColor)
    }
    if (secondaryColor) {
      root.style.setProperty('--secondary', secondaryColor)
      root.style.setProperty('--biz-secondary', secondaryColor)
    }

    return () => {
      // Restore defaults on unmount
      root.style.removeProperty('--primary')
      root.style.removeProperty('--secondary')
      root.style.removeProperty('--biz-primary')
      root.style.removeProperty('--biz-secondary')
    }
  }, [primaryColor, secondaryColor])

  return null
}
