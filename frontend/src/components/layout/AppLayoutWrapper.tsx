'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import AmazonGovHeader from '@/components/layout/AmazonGovHeader'

const OFFICIAL_ONLY_ROUTES = [
  '/intelligence',
  '/advanced-search',
  '/scorecards',
  '/regional-analytics',
  '/intake/import',
]

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { role, activeTrainee } = useRole()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const effectiveRole = (localStorage.getItem('continuum_role') as string | null) || role

    // ── Security & Privacy Isolation for Trainee Role ──
    if (effectiveRole === 'trainee') {
      // 1. Restrict official-only administrative routes
      if (OFFICIAL_ONLY_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
        router.replace('/dashboard')
        return
      }

      const effectiveId = (
        activeTrainee?.trainee_id || 
        localStorage.getItem('continuum_active_trainee_id') || 
        'T002'
      ).toUpperCase()

      // 2. Trainees cannot access administrative audit timeline (/trainees/[id]/timeline)
      if (pathname.includes('/timeline')) {
        router.replace(`/trainees/${effectiveId}`)
        return
      }

      // 3. Restrict foreign trainee profile inspection (/trainees/[other_id])
      const match = pathname.match(/\/trainees\/(T\d+)/i)
      if (match && match[1]) {
        const requestedId = match[1].toUpperCase()
        if (requestedId !== effectiveId) {
          router.replace(`/trainees/${effectiveId}`)
          return
        }
      }
    }
  }, [role, pathname, activeTrainee?.trainee_id, router])

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans">
      {/* Top Navigation Header */}
      <AmazonGovHeader />
      
      {/* Main Content Canvas */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1600px] w-full mx-auto">
        {children}
      </main>
    </div>
  )
}
