'use client'

import React from 'react'
import AmazonGovHeader from '@/components/layout/AmazonGovHeader'

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans">
      {/* Top Navigation Header for Both Roles */}
      <AmazonGovHeader />
      
      {/* Main Content Canvas */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1600px] w-full mx-auto">
        {children}
      </main>
    </div>
  )
}

