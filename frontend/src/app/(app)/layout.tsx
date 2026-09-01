import React from 'react'
import { RoleProvider } from '@/contexts/RoleContext'
import AppLayoutWrapper from '@/components/layout/AppLayoutWrapper'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleProvider>
      <AppLayoutWrapper>
        {children}
      </AppLayoutWrapper>
    </RoleProvider>
  )
}

