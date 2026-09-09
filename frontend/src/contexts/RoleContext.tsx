'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export type AppRole = 'trainee' | 'analyst'

interface RoleContextType {
  role: AppRole
  setRole: (role: AppRole) => void
}

const RoleContext = createContext<RoleContextType>({
  role: 'analyst',
  setRole: () => {},
})

const ANALYST_ROUTES = [
  '/intelligence',
  '/advanced-search',
  '/scorecards',
  '/regional-analytics',
]

const TRAINEE_ROUTES = [
  '/dashboard',
  '/identity',
  '/outcomes',
  '/evidence',
  '/attestation',
]

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [role, setRoleState] = useState<AppRole>('analyst')

  useEffect(() => {
    // 1. Check if the current route explicitly belongs to a role
    if (ANALYST_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      setRoleState('analyst')
      localStorage.setItem('continuum_role', 'analyst')
      return
    }

    if (TRAINEE_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      setRoleState('trainee')
      localStorage.setItem('continuum_role', 'trainee')
      return
    }

    // 2. Otherwise fallback to stored preference
    const stored = localStorage.getItem('continuum_role') as AppRole | null
    if (stored === 'trainee' || stored === 'analyst') {
      setRoleState(stored)
    }
  }, [pathname])

  const setRole = (r: AppRole) => {
    localStorage.setItem('continuum_role', r)
    setRoleState(r)
  }

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
