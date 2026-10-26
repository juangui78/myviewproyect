'use client'
import { NextUIProvider } from '@nextui-org/react'
import { HeroUIProvider } from '@heroui/react'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children, session }) {
  return (
    <NextUIProvider>
      <HeroUIProvider>
        <SessionProvider session={session}>
          {children}
        </SessionProvider> 
      </HeroUIProvider>
    </NextUIProvider>
  )
}
