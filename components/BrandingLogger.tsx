'use client'

import { useEffect, useRef } from 'react'

export default function BrandingLogger() {
  const hasLogged = useRef(false)

  useEffect(() => {
    if (hasLogged.current) return
    hasLogged.current = true

    const ascii = `
%c
                                      _       _             
  _ __ ___   ___  _ __   ___ ___ | | ___   ___ 
 | '_ \` _ \\ / _ \\| '_ \\ / __/ _ \\| |/ _ \\ / __|
 | | | | | | (_) | | | | (__ (_) | | (_) | (__ 
 |_| |_| |_|\\___/|_| |_|\\___\\___/|_|\\___/ \\___|
                                                
    Premium Roommate Finding Platform
    Developed with ❤️ by Antigravity
    `

    console.log(
      ascii,
      'color: #0079D3; font-weight: bold; font-family: monospace; line-height: 1.2;'
    )
    
    console.log(
      '%c🚀 SAKANI AUTH: System initialized successfully.',
      'color: #FF4500; font-weight: bold; background: #FFF0E5; padding: 4px 8px; border-radius: 4px;'
    )
  }, [])

  return null
}
