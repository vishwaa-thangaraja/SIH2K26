'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export function RoleEntryButton({
  role,
  href,
  label,
  styleClass,
}: {
  role: 'trainee' | 'analyst'
  href: string
  label: string
  styleClass: string
}) {
  const router = useRouter()

  const handleClick = () => {
    localStorage.setItem('continuum_role', role)
    router.push(href)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center justify-center gap-2 font-bold text-sm px-5 py-3 rounded-xl shadow transition-colors ${styleClass}`}
    >
      {label}
      <ArrowRight size={16} />
    </button>
  )
}
