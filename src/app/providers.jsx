'use client'
import { NextUIProvider } from '@nextui-org/react'
import { HeroUIProvider } from '@heroui/react'
import { SessionProvider } from 'next-auth/react'
import RegisterSW from '@/web/global_components/pwa/registerSW.client'

export function Providers({ children, session }) {
  return (
    <NextUIProvider>
      <HeroUIProvider>
        <SessionProvider session={session}>
          <RegisterSW />
          {children}
        </SessionProvider> 
      </HeroUIProvider>
    </NextUIProvider>
  )
}
