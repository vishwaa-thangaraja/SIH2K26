'use client'

import React from 'react'
import { RoleProvider } from '@/contexts/RoleContext'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <RoleProvider>{children}</RoleProvider>
}
