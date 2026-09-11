'use client'

import { API_BASE } from '@/lib/api'
import React, { useState, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  Position,
  Handle
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { MOCK_DSIG_NODES, MOCK_DSIG_EDGES } from '@/lib/mockData'
import { DSIGNode as DSIGNodeType } from '@/types'
import { ShieldCheck, Phone, Mail, GraduationCap, Building2, Calendar, CheckCircle2, History } from 'lucide-react'

// Custom node component for polished rendering
function CustomDSIGNode({ data }: { data: DSIGNodeType }) {
  const isCore = data.node_type === 'identity'
  const isActive = data.is_active

  const getIcon = () => {
    switch (data.node_type) {
      case 'identity': return <ShieldCheck size={20} className="text-white" />
      case 'phone': return <Phone size={16} className={isActive ? 'text-emerald-700' : 'text-slate-500'} />
      case 'email': return <Mail size={16} className="text-sky-700" />
      case 'training': return <GraduationCap size={16} className="text-indigo-700" />
      case 'employer': return <Building2 size={16} className={isActive ? 'text-amber-700' : 'text-slate-500'} />
    }
  }

  if (isCore) {
    return (
      <div className="relative flex flex-col items-center justify-center w-28 h-28 rounded-full bg-slate-900 text-white shadow-xl border-4 border-slate-700 cursor-pointer p-2 text-center">
        <Handle type="target" position={Position.Top} className="!bg-slate-500" />
        <ShieldCheck size={24} className="text-sky-400 mb-1" />
        <span className="text-xs font-bold tracking-wider">{data.label}</span>
        <span className="text-[10px] text-sky-300 font-mono">{data.value}</span>
        <Handle type="source" position={Position.Bottom} className="!bg-slate-500" />
      </div>
    )
  }

  return (
    <div
      className={`relative min-w-[200px] rounded-lg p-3 shadow-md border-2 transition-all cursor-pointer bg-white ${
        isActive 
          ? 'border-slate-300 hover:border-sky-500 shadow-sm' 
          : 'border-slate-200 bg-slate-50 opacity-80 border-dashed'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
        <div className="flex items-center gap-1.5">
          {getIcon()}
          <span className="text-xs font-bold text-slate-800">{data.label}</span>
        </div>
        {isActive ? (
          <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
            <CheckCircle2 size={10} /> Active
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold border border-slate-200">
            <History size={10} /> Historical
          </span>
        )}
      </div>

      <div className="text-xs text-slate-700 font-medium truncate mb-1">
        {data.value}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
        <span>Conf: <strong className="text-slate-800">{Math.round(data.confidence * 100)}%</strong></span>
        <span className="truncate max-w-[100px]">{data.verification_method.replace('_', ' ')}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  )
}

const nodeTypes = {
  custom: CustomDSIGNode
}

interface DSIGGraphProps {
  traineeId?: string
}

export default function DSIGGraph({ traineeId }: DSIGGraphProps) {
  const [liveData, setLiveData] = useState<{ nodes: DSIGNodeType[]; edges: any[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedNode, setSelectedNode] = useState<DSIGNodeType | null>(null)

  // Fetch live DSIG when traineeId changes
  React.useEffect(() => {
    if (!traineeId) {
      setLiveData(null)
      setSelectedNode(MOCK_DSIG_NODES[0])
      return
    }

    setLoading(true)
    fetch(`${API_BASE}/trainees/${traineeId}/dsig`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch DSIG')
        return res.json()
      })
      .then(data => {
        if (data.nodes && data.nodes.length > 0) {
          const adaptedNodes: DSIGNodeType[] = data.nodes.map((n: any) => ({
            ...n,
            id: n.node_id,
          }))
          const adaptedEdges = data.edges.map((e: any) => ({
            ...e,
            id: e.edge_id,
            source: e.source_node_id,
            target: e.target_node_id,
          }))
          setLiveData({ nodes: adaptedNodes, edges: adaptedEdges })
          setSelectedNode(adaptedNodes[0] || null)
        }
      })
      .catch(err => {
        console.warn('Using mock DSIG due to error:', err)
        setLiveData(null)
        setSelectedNode(MOCK_DSIG_NODES[0])
      })
      .finally(() => setLoading(false))
  }, [traineeId])

  const nodesToRender = liveData ? liveData.nodes : MOCK_DSIG_NODES
  const edgesToRender = liveData ? liveData.edges : MOCK_DSIG_EDGES

  // Dynamic layout generator for any trainee's graph nodes
  const initialNodes: Node[] = useMemo(() => {
    if (!liveData) {
      const posMap: Record<string, { x: number; y: number }> = {
        'core-T001': { x: 380, y: 180 },
        'phone-A': { x: 50, y: 40 },
        'phone-B': { x: 50, y: 320 },
        'email-1': { x: 680, y: 40 },
        'training-1': { x: 680, y: 320 },
        'employer-A': { x: 220, y: 480 },
        'employer-B': { x: 520, y: 480 },
      }
      return MOCK_DSIG_NODES.map((node) => ({
        id: node.id,
        type: 'custom',
        position: posMap[node.id] || { x: 200, y: 200 },
        data: node,
      }))
    }

    // Radial/Star layout around core identity
    const centerX = 380
    const centerY = 220
    const nonCore = nodesToRender.filter(n => n.node_type !== 'identity')
    const totalOuter = nonCore.length

    return nodesToRender.map((node, index) => {
      if (node.node_type === 'identity') {
        return {
          id: node.id,
          type: 'custom',
          position: { x: centerX, y: centerY },
          data: node,
        }
      }

      const outerIdx = nonCore.findIndex(n => n.id === node.id)
      const angle = (outerIdx / (totalOuter || 1)) * (2 * Math.PI) - (Math.PI / 2)
      const radius = 240
      const x = Math.round(centerX + radius * Math.cos(angle))
      const y = Math.round(centerY + radius * Math.sin(angle))

      return {
        id: node.id,
        type: 'custom',
        position: { x, y },
        data: node,
      }
    })
  }, [liveData, nodesToRender])

  const initialEdges: Edge[] = useMemo(() => {
    return edgesToRender.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: edge.edge_type === 'phone_change' || edge.edge_type === 'credential',
      style: {
        stroke: edge.edge_type === 'phone_change' ? '#9333ea' : edge.edge_type === 'credential' ? '#16a34a' : '#0284c7',
        strokeWidth: 2,
        strokeDasharray: edge.edge_type === 'phone_change' ? '5,5' : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.edge_type === 'phone_change' ? '#9333ea' : edge.edge_type === 'credential' ? '#16a34a' : '#0284c7',
      },
    }))
  }, [edgesToRender])

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[720px] w-full">
      {/* Canvas */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur border border-slate-200 rounded-lg p-3 shadow-sm flex flex-wrap gap-2 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5 mr-2">Legend:</span>
          <span className="inline-flex items-center gap-1 text-slate-900 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> Core Identity</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Active Anchor</span>
          <span className="inline-flex items-center gap-1 text-slate-500 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Historical Anchor</span>
          <span className="inline-flex items-center gap-1 text-purple-700 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> State Transition</span>
        </div>

        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNode(node.data as DSIGNodeType)}
          fitView
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </div>

      {/* Node Inspector Panel */}
      <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        {selectedNode ? (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Node Inspector</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedNode.label}</h3>
              <p className="text-xs text-slate-500 font-mono">{selectedNode.node_id}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500">Anchor Value</span>
                <p className="font-semibold text-slate-900 break-all">{selectedNode.value}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500">Anchor State</span>
                <div className="mt-1">
                  {selectedNode.is_active ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 size={12} /> Active Primary Anchor
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-700 border border-slate-300 text-xs px-2.5 py-1 rounded font-semibold inline-flex items-center gap-1">
                      <History size={12} /> Historical Anchor (Replaced)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Verification Confidence</span>
                  <span className="text-slate-900 font-bold">{Math.round(selectedNode.confidence * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${selectedNode.confidence > 0.9 ? 'bg-emerald-500' : 'bg-sky-500'}`} 
                    style={{ width: `${selectedNode.confidence * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500">Verification Source</span>
                <p className="text-slate-800 text-xs bg-slate-50 border border-slate-200 p-2 rounded mt-1 font-mono">
                  {selectedNode.verification_method}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Valid From</span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar size={12} /> {selectedNode.valid_from}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Valid Until</span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar size={12} /> {selectedNode.valid_until || 'Present (Active)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">
            Click on any graph node to inspect provenance & verification attributes.
          </div>
        )}

        <div className="border-t border-slate-200 pt-4 mt-4">
          <div className="bg-sky-50 border border-sky-200 p-3 rounded-lg text-xs text-sky-800">
            <strong>DSIG Continuity Rule:</strong> When anchors change, relationships are logged as temporal edges. The central identity <code>T001</code> never fragments.
          </div>
        </div>
      </div>
    </div>
  )
}
