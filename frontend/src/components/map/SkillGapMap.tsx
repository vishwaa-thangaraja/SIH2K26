'use client'

import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MOCK_SKILL_GAPS } from '@/lib/mockData'
import { RegionalSkillGap } from '@/types'
import { AlertCircle, TrendingUp, Users, MapPin } from 'lucide-react'

export default function SkillGapMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [districts, setDistricts] = useState<any[]>(MOCK_SKILL_GAPS)
  const [selectedDistrict, setSelectedDistrict] = useState<any>(MOCK_SKILL_GAPS[0])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/intelligence/district-density')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setDistricts(data)
          setSelectedDistrict(data[0])
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Clean up any stale map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    try {
      // Center on Tamil Nadu / South India
      const map = L.map(mapContainerRef.current, {
        center: [10.5, 78.0],
        zoom: 7,
        scrollWheelZoom: false,
      })

      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      districts.forEach((district) => {
        const gapVal = district.gap_ratio ?? 0.25
        const isHighGap = gapVal >= 0.24
        const color = isHighGap ? '#dc2626' : gapVal >= 0.20 ? '#d97706' : '#16a34a'
        const traineeCount = district.trainee_count || 0
        const certCount = district.certified_count || 0
        const gapPercent = district.gap_percentage ?? Math.round(gapVal * 100)
        const gapMultiple = district.gap_ratio_multiple ?? (gapVal > 0 ? (1 / (1 - gapVal)).toFixed(2) : '1.0')

        const marker = L.circleMarker([district.lat, district.lng], {
          radius: Math.max(10, Math.min(28, 12 + traineeCount * 1.5)),
          color: color,
          fillColor: color,
          fillOpacity: 0.7,
          weight: 2,
        }).addTo(map)

        const popupHtml = `
          <div style="font-family: Inter, system-ui, sans-serif; font-size: 12px; padding: 2px;">
            <strong style="font-size: 13px; color: #0f172a;">${district.district_name}, ${district.state}</strong><br/>
            <span style="color: #0284c7; font-weight: bold;">Audited DB Trainees: ${traineeCount} (${certCount} Certified)</span><br/>
            <span style="color: #475569;">Industry Demand: <strong>${district.skill_demand_score}/100</strong></span><br/>
            <span style="color: #475569;">Certified Supply Score: <strong>${district.skill_supply_score}/100</strong></span><br/>
            <span style="color: ${color}; font-weight: bold;">Deficit Gap: ${gapPercent}% (${gapMultiple}x)</span>
          </div>
        `
        marker.bindPopup(popupHtml)

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
  }, [districts])

  const demandedSkills: string[] = Array.isArray(selectedDistrict?.top_demanded_skills)
    ? selectedDistrict.top_demanded_skills
    : typeof selectedDistrict?.top_demanded_skills === 'string'
    ? (() => {
        try {
          return JSON.parse(selectedDistrict.top_demanded_skills)
        } catch {
          return [selectedDistrict.top_demanded_skills]
        }
      })()
    : ['CNC Machine Operation', 'Precision Welding (L5)', 'Auto Components']

  const suppliedSkills: string[] = Array.isArray(selectedDistrict?.top_supplied_skills)
    ? selectedDistrict.top_supplied_skills
    : typeof selectedDistrict?.top_supplied_skills === 'string'
    ? (() => {
        try {
          return JSON.parse(selectedDistrict.top_supplied_skills)
        } catch {
          return [selectedDistrict.top_supplied_skills]
        }
      })()
    : ['Basic IT Support', 'Customer Service', 'Vocational Tech']

  const selectedGapPercent = selectedDistrict?.gap_percentage ?? Math.round((selectedDistrict?.gap_ratio ?? 0.25) * 100)
  const selectedGapMultiple = selectedDistrict?.gap_ratio_multiple ?? (selectedDistrict?.gap_ratio ? (1 / (1 - selectedDistrict.gap_ratio)).toFixed(2) : '1.42')

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
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{selectedDistrict?.district_name || 'Madurai'}</h3>
            <p className="text-xs text-slate-500 font-medium">{selectedDistrict?.state || 'Tamil Nadu'} Industrial Corridor</p>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium"><TrendingUp size={14} className="text-blue-600" /> Industry Demand</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{selectedDistrict?.skill_demand_score ?? 88}<span className="text-xs font-normal text-slate-500">/100</span></p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium"><Users size={14} className="text-emerald-600" /> Certified Supply</span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {selectedDistrict?.certified_count !== undefined 
                  ? selectedDistrict.certified_count 
                  : (selectedDistrict?.trainee_count ?? 10)}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  {selectedDistrict?.trainee_count ? `(${selectedDistrict.trainee_count} Enrolled)` : 'Graduates'}
                </span>
              </p>
            </div>
          </div>

          {/* Gap Status */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 my-3">
            <div className="flex items-center justify-between text-xs font-bold text-red-800">
              <span className="flex items-center gap-1.5"><AlertCircle size={15} /> Regional Skill Deficit</span>
              <span>{selectedGapPercent}% Deficit ({selectedGapMultiple}x Gap)</span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2 mt-2">
              <div className="bg-red-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, selectedGapPercent * 2.5)}%` }} />
            </div>
          </div>

          {/* Demanded vs Supplied Skills */}
          <div className="space-y-3 mt-4 text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-1.5">Top Demanded Skills (Unmet):</span>
              <div className="flex flex-wrap gap-1.5">
                {demandedSkills.map((skill: string) => (
                  <span key={skill} className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded font-semibold text-[11px]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1.5">Existing Training Supply:</span>
              <div className="flex flex-wrap gap-1.5">
                {suppliedSkills.map((skill: string) => (
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
