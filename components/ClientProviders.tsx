'use client'

import { ReactNode } from 'react'
// import CustomCursor from '@/components/CustomCursor'
import { ToastProvider } from '@/components/Toast'
import ExitIntent from '@/components/ExitIntent'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {/* <CustomCursor /> */}
      <ExitIntent />
      {children}
    </ToastProvider>
  )
}
