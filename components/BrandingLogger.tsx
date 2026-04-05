'use client'

import { useEffect, useRef } from 'react'

export default function BrandingLogger() {
  const hasLogged = useRef(false)

  useEffect(() => {
    if (hasLogged.current) return
    hasLogged.current = true

    const logoLines = [
      "",
      "  %c  __  __   ____   _   _   ____   ___   _       ___    ____ ",
      " %c |  \\/  | / __ \\ | \\ | | / ___| / _ \\ | |     / _ \\  / ___|",
      " %c | |\\/| || |  | ||  \\| || |    | | | || |    | | | || |    ",
      " %c | |  | || |__| || |\\  || |___ | |_| || |___ | |_| || |___ ",
      " %c |_|  |_| \\____/ |_| \\_| \\____| \\___/ |_____| \\___/  \\____|",
      " %c                                                          ",
      " %c       >> Roommate & Shared Living Ecosystem <<          ",
      ""
    ]

    const subText = [
      "%c----------------------------------------------------------",
      "%c 🛠️  BUILT BY  : MOHAMED BELLA",
      "%c 📧  CONTACT   : mohamedbella235@gmail.com",
      "%c ✨  STATUS    : System Initialized Successfully",
      "%c----------------------------------------------------------",
      ""
    ]

    let delay = 0
    
    // Animate Logo
    logoLines.forEach((line, i) => {
      setTimeout(() => {
        console.log(line, 'color: #0079D3; font-weight: bold; font-family: monospace;')
      }, delay)
      delay += 80
    })

    // Animate Info
    subText.forEach((line, i) => {
      setTimeout(() => {
        const color = i === 1 || i === 2 ? 'color: #FF4500; font-weight: 800;' : 'color: #878A8C; font-weight: 500;'
        console.log(line, `${color} font-family: system-ui;`)
      }, delay)
      delay += 100
    })

  }, [])

  return null
}
