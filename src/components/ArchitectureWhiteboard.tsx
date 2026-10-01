'use client';

import React, { useState, useRef } from 'react';
import { 
  Square, 
  Circle, 
  Cloud, 
  Database, 
  Layers, 
  Plus, 
  Trash2, 
  Sparkles, 
  Move,
  RotateCcw
} from 'lucide-react';
import { WhiteboardElement } from '@/types/meeting';

interface ArchitectureWhiteboardProps {
  elements: WhiteboardElement[];
  onUpdateElements: (elements: WhiteboardElement[]) => void;
  onAskAIAboutArchitecture: (elements: WhiteboardElement[]) => void;
}

export const ArchitectureWhiteboard: React.FC<ArchitectureWhiteboardProps> = ({
  elements,
  onUpdateElements,
  onAskAIAboutArchitecture,
}) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<WhiteboardElement['type']>('service');
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, el: WhiteboardElement) => {
    e.stopPropagation();
    setSelectedElementId(el.id);
    setDraggingId(el.id);
    setDragOffset({
      x: e.clientX - el.x,
      y: e.clientY - el.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return;
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(canvasBounds.width - 160, e.clientX - dragOffset.x));
    const newY = Math.max(10, Math.min(canvasBounds.height - 90, e.clientY - dragOffset.y));

    onUpdateElements(
      elements.map((el) => (el.id === draggingId ? { ...el, x: newX, y: newY } : el))
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleAddNode = () => {
    if (!newNodeLabel.trim()) return;

    let color = '#0f172a';
    let fillColor = '#0f172a';
    if (newNodeType === 'database') {
      color = '#047857';
      fillColor = '#047857';
    } else if (newNodeType === 'cloud') {
      color = '#1d4ed8';
      fillColor = '#1d4ed8';
    } else if (newNodeType === 'sticky') {
      color = '#b45309';
      fillColor = '#b45309';
    }

    const newElement: WhiteboardElement = {
      id: `node-${Date.now()}`,
      type: newNodeType,
      x: 150 + Math.random() * 200,
      y: 120 + Math.random() * 150,
      width: 150,
      height: 75,
      label: newNodeLabel.trim(),
      color,
      fillColor,
    };

    onUpdateElements([...elements, newElement]);
    setNewNodeLabel('');
  };

  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    onUpdateElements(elements.filter((el) => el.id !== selectedElementId));
    setSelectedElementId(null);
  };

  const handleResetDefaults = () => {
    onUpdateElements([
      {
        id: 'node-client',
        type: 'rect',
        x: 60,
        y: 160,
        width: 140,
        height: 70,
        label: 'Client WebRTC / Next.js',
        color: '#1d4ed8',
        fillColor: '#0f172a'
      },
      {
        id: 'node-lb',
        type: 'service',
        x: 250,
        y: 160,
        width: 140,
        height: 70,
        label: 'Cloudflare Edge / Anycast',
        color: '#4338ca',
        fillColor: '#0f172a'
      },
      {
        id: 'node-gateway',
        type: 'cloud',
        x: 440,
        y: 160,
        width: 160,
        height: 80,
        label: 'API Gateway & SFU Cluster',
        color: '#0284c7',
        fillColor: '#0f172a'
      },
      {
        id: 'node-kafka',
        type: 'rect',
        x: 660,
        y: 90,
        width: 150,
        height: 65,
        label: 'Kafka Event Stream',
        color: '#b45309',
        fillColor: '#0f172a'
      },
      {
        id: 'node-db',
        type: 'database',
        x: 660,
        y: 230,
        width: 150,
        height: 70,
        label: 'PostgreSQL Distributed DB',
        color: '#047857',
        fillColor: '#0f172a'
      },
    ]);
  };

  const getNodeIcon = (type: WhiteboardElement['type']) => {
    switch (type) {
      case 'cloud':
        return <Cloud className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'service':
        return <Layers className="w-4 h-4" />;
      case 'circle':
        return <Circle className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs select-none">
      {/* Top Toolbar (White & Navy) */}
      <div className="h-14 bg-white border-b border-slate-100 px-4 flex items-center justify-between">
        {/* Node creation controls */}
        <div className="flex items-center space-x-2">
          <select
            value={newNodeType}
            onChange={(e) => setNewNodeType(e.target.value as WhiteboardElement['type'])}
            className="bg-slate-50 border border-slate-300 text-xs font-semibold text-[#0f172a] rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="service">Microservice</option>
            <option value="cloud">Cloud / Gateway</option>
            <option value="database">Database / Storage</option>
            <option value="rect">Queue / Worker</option>
            <option value="sticky">Sticky Note</option>
          </select>

          <input
            type="text"
            placeholder="Node label (e.g. Redis Cache)..."
            value={newNodeLabel}
            onChange={(e) => setNewNodeLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
            className="bg-slate-50 border border-slate-300 text-xs font-medium text-[#0f172a] rounded-lg px-3 py-1.5 w-44 sm:w-56 focus:outline-none focus:border-[#0f172a]"
          />

          <button
            onClick={handleAddNode}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Node</span>
          </button>

          {selectedElementId && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-colors"
              title="Delete Selected Node"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* AI & Reset Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onAskAIAboutArchitecture(elements)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">AI Architecture Review</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
            title="Reset Architecture Diagram"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas (White Background with Navy Grid Dots) */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => setSelectedElementId(null)}
        className="flex-1 relative overflow-hidden bg-white bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] cursor-crosshair"
      >
        {/* SVG Connectors between nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrowhead-navy"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#0f172a" />
            </marker>
          </defs>
          
          {elements.length >= 3 && (
            <>
              <line
                x1={elements[0].x + elements[0].width}
                y1={elements[0].y + elements[0].height / 2}
                x2={elements[1].x}
                y2={elements[1].y + elements[1].height / 2}
                stroke="#0f172a"
                strokeWidth="2"
                strokeDasharray="4"
                markerEnd="url(#arrowhead-navy)"
              />
              <line
                x1={elements[1].x + elements[1].width}
                y1={elements[1].y + elements[1].height / 2}
                x2={elements[2].x}
                y2={elements[2].y + elements[2].height / 2}
                stroke="#0f172a"
                strokeWidth="2"
                markerEnd="url(#arrowhead-navy)"
              />
            </>
          )}
        </svg>

        {/* Empty Canvas Starter State */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center p-6">
            <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
              <Layers className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-base font-bold text-[#0f172a]">Interactive Architecture Canvas</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Drag and drop microservices, databases, and gateways. Click &ldquo;+ Add Node&rdquo; above or load a starter template.
            </p>
            <button
              onClick={handleResetDefaults}
              className="mt-4 pointer-events-auto px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Load Cloud Architecture Stencil
            </button>
          </div>
        )}

        {/* Draggable Architecture Nodes (Deep Navy Cards) */}
        {elements.map((el) => {
          const isSelected = el.id === selectedElementId;
          return (
            <div
              key={el.id}
              onMouseDown={(e) => handleMouseDown(e, el)}
              style={{
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
              }}
              className={`absolute p-3 rounded-xl border-2 bg-[#0f172a] text-white shadow-lg cursor-grab active:cursor-grabbing transition-transform ${
                isSelected ? 'ring-4 ring-blue-500/40 border-blue-500 scale-105 z-20' : 'border-[#1e293b] hover:scale-[1.02] z-10'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1 text-slate-300">
                <div className="flex items-center space-x-1.5">
                  {getNodeIcon(el.type)}
                  <span className="uppercase text-[10px] tracking-wider">{el.type}</span>
                </div>
                <Move className="w-3 h-3 opacity-60" />
              </div>
              <div className="text-xs font-bold text-white leading-snug line-clamp-2">
                {el.label}
              </div>
            </div>
          );
        })}

        {/* Canvas Helper Legend */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-white/90 border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-sm flex items-center space-x-3 pointer-events-none">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Frontend</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#0f172a]" />
            <span>Gateway</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Database</span>
          </span>
        </div>
      </div>
    </div>
  );
};
