'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export type AppRole = 'trainee' | 'analyst'

export interface TraineeSession {
  trainee_id: string
  name: string
  program?: string
  provider?: string
  district?: string
  state?: string
  phone?: string
  email?: string
  initials?: string
}

export const DEFAULT_TRAINEES: Record<string, TraineeSession> = {
  T001: {
    trainee_id: 'T001',
    name: 'Aarav Kumar',
    program: 'Data Analytics',
    district: 'Madurai',
    state: 'Tamil Nadu',
    initials: 'AK',
  },
  T002: {
    trainee_id: 'T002',
    name: 'Priya S',
    program: 'Web Development',
    district: 'Madurai',
    state: 'Tamil Nadu',
    initials: 'PS',
  },
  T003: {
    trainee_id: 'T003',
    name: 'Arun Prakash',
    program: 'Digital Marketing',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    initials: 'AP',
  },
  T004: {
    trainee_id: 'T004',
    name: 'Meena R',
    program: 'Electrical Technician',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    initials: 'MR',
  },
  T005: {
    trainee_id: 'T005',
    name: 'Rahul Kumar',
    program: 'Tailoring & Apparel Design',
    district: 'Salem',
    state: 'Tamil Nadu',
    initials: 'RK',
  },
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

interface RoleContextType {
  role: AppRole
  setRole: (role: AppRole) => void
  activeTrainee: TraineeSession
  setActiveTraineeId: (id: string) => void
}

const RoleContext = createContext<RoleContextType>({
  role: 'analyst',
  setRole: () => {},
  activeTrainee: DEFAULT_TRAINEES.T001,
  setActiveTraineeId: () => {},
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
  const [activeTrainee, setActiveTrainee] = useState<TraineeSession>(DEFAULT_TRAINEES.T001)

  const fetchTraineeFromBackend = useCallback(async (id: string) => {
    const formattedId = id.toUpperCase()
    try {
      const res = await fetch(`http://127.0.0.1:8000/trainees/${formattedId}`)
      if (res.ok) {
        const data = await res.json()
        const initials = getInitials(data.name || formattedId)
        const updated: TraineeSession = {
          trainee_id: data.trainee_id || formattedId,
          name: data.name || formattedId,
          program: data.program || 'Vocational Training',
          district: data.district || 'Madurai',
          state: data.state || 'Tamil Nadu',
          phone: data.phone,
          email: data.email,
          initials,
        }
        setActiveTrainee(updated)
        return
      }
    } catch {
      // Backend unavailable, fallback to preset dictionary
    }

    if (DEFAULT_TRAINEES[formattedId]) {
      setActiveTrainee(DEFAULT_TRAINEES[formattedId])
    } else {
      setActiveTrainee({
        trainee_id: formattedId,
        name: `Trainee ${formattedId}`,
        program: 'Skill Certification',
        district: 'Regional Cluster',
        initials: formattedId.slice(0, 2).toUpperCase(),
      })
    }
  }, [])

  const setActiveTraineeId = useCallback((id: string) => {
    const cleanId = id.toUpperCase()
    localStorage.setItem('continuum_active_trainee_id', cleanId)
    fetchTraineeFromBackend(cleanId)
  }, [fetchTraineeFromBackend])

  // 1. Initial Session Load (run once on mount - NEVER mutate role on route navigation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('continuum_role') as AppRole | null
      if (stored === 'trainee' || stored === 'analyst') {
        setRoleState(stored)
      } else {
        // Fallback only on initial cold visit if no role has ever been set
        if (TRAINEE_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
          setRoleState('trainee')
          localStorage.setItem('continuum_role', 'trainee')
        } else {
          setRoleState('analyst')
          localStorage.setItem('continuum_role', 'analyst')
        }
      }

      const storedTrainee = localStorage.getItem('continuum_active_trainee_id')
      if (storedTrainee) {
        fetchTraineeFromBackend(storedTrainee)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2. Trainee ID sync from URL params / routes (strictly preserves current role)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const paramTraineeId = urlParams.get('trainee_id')
      if (paramTraineeId) {
        setActiveTraineeId(paramTraineeId)
        return
      }

      // Check path matching /trainees/(T\d+)
      const match = pathname.match(/\/trainees\/(T\d+)/i)
      if (match && match[1]) {
        fetchTraineeFromBackend(match[1])
        return
      }
    }
  }, [pathname, setActiveTraineeId, fetchTraineeFromBackend])

  const setRole = (r: AppRole) => {
    localStorage.setItem('continuum_role', r)
    setRoleState(r)
  }

  return (
    <RoleContext.Provider value={{ role, setRole, activeTrainee, setActiveTraineeId }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
