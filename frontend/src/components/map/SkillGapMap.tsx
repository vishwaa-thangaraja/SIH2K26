'use client'

import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MOCK_SKILL_GAPS } from '@/lib/mockData'
import { RegionalSkillGap } from '@/types'
import { AlertCircle, TrendingUp, Users, MapPin } from 'lucide-react'

export default function SkillGapMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  // Default to Madurai (index 0)
  const [selectedDistrict, setSelectedDistrict] = useState<RegionalSkillGap>(MOCK_SKILL_GAPS[0])

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Clean up any stale map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    try {
      // Center directly on Madurai [9.9252, 78.1198]
      const map = L.map(mapContainerRef.current, {
        center: [9.9252, 78.1198],
        zoom: 8,
        scrollWheelZoom: false,
      })

      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      MOCK_SKILL_GAPS.forEach((district) => {
        const isHighGap = district.gap_ratio >= 0.27
        const isMadurai = district.district_name === 'Madurai'
        const color = isHighGap ? '#dc2626' : district.gap_ratio >= 0.25 ? '#d97706' : '#16a34a'

        const marker = L.circleMarker([district.lat, district.lng], {
          radius: isMadurai ? 28 : district.skill_demand_score / 3.4,
          color: isMadurai ? '#0284c7' : color,
          fillColor: color,
          fillOpacity: isMadurai ? 0.75 : 0.6,
          weight: isMadurai ? 3 : 2,
        }).addTo(map)

        const popupHtml = `
          <div style="font-family: Inter, system-ui, sans-serif; font-size: 12px; padding: 2px;">
            <strong style="font-size: 13px; color: #0f172a;">${district.district_name}, ${district.state}</strong><br/>
            <span style="color: #475569;">Industry Demand: <strong>${district.skill_demand_score}/100</strong></span><br/>
            <span style="color: #475569;">Certified Supply: <strong>${district.skill_supply_score}/100</strong></span><br/>
            <span style="color: ${color}; font-weight: bold;">Deficit Gap: ${Math.round(district.gap_ratio * 100)}%</span>
          </div>
        `
        marker.bindPopup(popupHtml)

        // Open popup by default on Madurai
        if (isMadurai) {
          marker.openPopup()
        }

        marker.on('click', () => {
          setSelectedDistrict(district)
        })
      })

      // Invalidate map size after mount to guarantee immediate tile paint
      const t1 = setTimeout(() => map.invalidateSize(), 150)
      const t2 = setTimeout(() => map.invalidateSize(), 600)

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }
      }
    } catch (err) {
      console.error('Leaflet initialization error:', err)
    }
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
      {/* Map Left Column (8 of 12 columns) */}
      <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative flex flex-col">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <MapPin size={16} className="text-sky-600" />
            <span>Madurai &amp; Southern Industrial Corridor Geographic Demand</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Click district circles to inspect</span>
        </div>

        <div className="w-full h-[540px] relative bg-slate-100">
          <div 
            ref={mapContainerRef} 
            className="h-full w-full absolute inset-0 z-0" 
            style={{ minHeight: '540px', width: '100%' }} 
          />
        </div>
      </div>

      {/* District Detail Sidebar Right Column (4 of 12 columns) */}
      <div className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Regional Demand Hotspot</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{selectedDistrict.district_name}</h3>
            <p className="text-xs text-slate-500 font-medium">{selectedDistrict.state} Industrial Corridor</p>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium"><TrendingUp size={14} className="text-blue-600" /> Industry Demand</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{selectedDistrict.skill_demand_score}<span className="text-xs font-normal text-slate-500">/100</span></p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium"><Users size={14} className="text-emerald-600" /> Certified Supply</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{selectedDistrict.skill_supply_score}<span className="text-xs font-normal text-slate-500">/100</span></p>
            </div>
          </div>

          {/* Gap Status */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 my-3">
            <div className="flex items-center justify-between text-xs font-bold text-red-800">
              <span className="flex items-center gap-1.5"><AlertCircle size={15} /> Critical Skill Deficit</span>
              <span>{Math.round(selectedDistrict.gap_ratio * 100)}% Gap</span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2 mt-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: `${selectedDistrict.gap_ratio * 100 * 2.5}%` }} />
            </div>
          </div>

          {/* Demanded vs Supplied Skills */}
          <div className="space-y-3 mt-4 text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-1.5">Top Demanded Skills (Unmet):</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDistrict.top_demanded_skills.map((skill) => (
                  <span key={skill} className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded font-semibold text-[11px]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1.5">Existing Training Supply:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDistrict.top_supplied_skills.map((skill) => (
                  <span key={skill} className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded font-semibold text-[11px]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Aggregated from verified 3M–12M outcome events and regional employer vacancies in Tamil Nadu.
          </p>
        </div>
      </div>
    </div>
  )
}
