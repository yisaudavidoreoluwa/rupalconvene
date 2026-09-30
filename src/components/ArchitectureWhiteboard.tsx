'use client';

import React, { useState, useRef } from 'react';
import { 
  Square, 
  Circle, 
  Cloud, 
  Database, 
  Layers, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Download, 
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

    let color = '#8b5cf6';
    let fillColor = '#2e1065';
    if (newNodeType === 'database') {
      color = '#10b981';
      fillColor = '#022c22';
    } else if (newNodeType === 'cloud') {
      color = '#06b6d4';
      fillColor = '#083344';
    } else if (newNodeType === 'sticky') {
      color = '#ec4899';
      fillColor = '#500724';
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
        color: '#06b6d4',
        fillColor: '#083344'
      },
      {
        id: 'node-lb',
        type: 'service',
        x: 250,
        y: 160,
        width: 140,
        height: 70,
        label: 'Cloudflare Edge / Anycast',
        color: '#8b5cf6',
        fillColor: '#2e1065'
      },
      {
        id: 'node-gateway',
        type: 'cloud',
        x: 440,
        y: 160,
        width: 160,
        height: 80,
        label: 'API Gateway & SFU Cluster',
        color: '#3b82f6',
        fillColor: '#172554'
      },
      {
        id: 'node-kafka',
        type: 'rect',
        x: 660,
        y: 90,
        width: 150,
        height: 65,
        label: 'Kafka Event Stream',
        color: '#f59e0b',
        fillColor: '#451a03'
      },
      {
        id: 'node-db',
        type: 'database',
        x: 660,
        y: 230,
        width: 150,
        height: 70,
        label: 'PostgreSQL Distributed DB',
        color: '#10b981',
        fillColor: '#022c22'
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
    <div className="w-full h-full flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl select-none">
      {/* Top Toolbar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
        {/* Node creation controls */}
        <div className="flex items-center space-x-2">
          <select
            value={newNodeType}
            onChange={(e) => setNewNodeType(e.target.value as WhiteboardElement['type'])}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
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
            className="bg-slate-800/80 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 w-44 sm:w-56 focus:outline-none focus:border-violet-500"
          />

          <button
            onClick={handleAddNode}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Node</span>
          </button>

          {selectedElementId && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs transition-colors"
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
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">AI Architecture Review</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset Architecture Diagram"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => setSelectedElementId(null)}
        className="flex-1 relative overflow-hidden bg-[#090d16] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] cursor-crosshair"
      >
        {/* SVG Connectors between nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
          </defs>
          
          {/* Default connections representation */}
          {elements.length >= 3 && (
            <>
              <line
                x1={elements[0].x + elements[0].width}
                y1={elements[0].y + elements[0].height / 2}
                x2={elements[1].x}
                y2={elements[1].y + elements[1].height / 2}
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="4"
                markerEnd="url(#arrowhead)"
              />
              <line
                x1={elements[1].x + elements[1].width}
                y1={elements[1].y + elements[1].height / 2}
                x2={elements[2].x}
                y2={elements[2].y + elements[2].height / 2}
                stroke="#64748b"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            </>
          )}
        </svg>

        {/* Draggable Architecture Nodes */}
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
                borderColor: el.color,
                backgroundColor: el.fillColor || 'rgba(15, 23, 42, 0.9)',
              }}
              className={`absolute p-3 rounded-xl border-2 shadow-xl backdrop-blur-md cursor-grab active:cursor-grabbing transition-transform ${
                isSelected ? 'ring-4 ring-white/30 scale-105 z-20' : 'hover:scale-[1.02] z-10'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1" style={{ color: el.color }}>
                <div className="flex items-center space-x-1.5">
                  {getNodeIcon(el.type)}
                  <span className="uppercase text-[10px] tracking-wider">{el.type}</span>
                </div>
                <Move className="w-3 h-3 opacity-60" />
              </div>
              <div className="text-xs font-medium text-slate-100 leading-snug line-clamp-2">
                {el.label}
              </div>
            </div>
          );
        })}

        {/* Canvas Helper Legend */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-md flex items-center space-x-3 pointer-events-none">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Frontend</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span>Gateway</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Database</span>
          </span>
        </div>
      </div>
    </div>
  );
};
