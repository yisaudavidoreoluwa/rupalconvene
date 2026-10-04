'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  RotateCcw,
  Pen,
  Highlighter,
  ArrowRight,
  Minus,
  Eraser,
  Undo2,
  Lock,
  Unlock,
  ShieldAlert,
  Send,
  Loader2,
  X,
  Check,
  Users
} from 'lucide-react';
import { WhiteboardElement, DrawingStroke, RoomPermissions, Participant } from '@/types/meeting';

interface ArchitectureWhiteboardProps {
  elements: WhiteboardElement[];
  onUpdateElements: (elements: WhiteboardElement[]) => void;
  onAskAIAboutArchitecture?: (elements: WhiteboardElement[]) => void;
  isHost?: boolean;
  canDraw?: boolean;
  roomPermissions?: RoomPermissions;
  onUpdatePermissions?: (permissions: RoomPermissions) => void;
  onRequestDrawAccess?: () => void;
  participants?: Participant[];
  onBroadcastWhiteboardUpdate?: (elements: WhiteboardElement[], strokes: DrawingStroke[]) => void;
}

const COLOR_PALETTE = [
  { name: 'Navy', hex: '#0f172a' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Purple', hex: '#7c3aed' },
];

export const ArchitectureWhiteboard: React.FC<ArchitectureWhiteboardProps> = ({
  elements,
  onUpdateElements,
  isHost = true,
  canDraw = true,
  roomPermissions,
  onUpdatePermissions,
  onRequestDrawAccess,
  participants = [],
  onBroadcastWhiteboardUpdate,
}) => {
  // Selection and drag state for nodes
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<WhiteboardElement['type']>('service');

  // Interactive Drawing Canvas State
  const [activeTool, setActiveTool] = useState<'select' | 'pen' | 'brush' | 'arrow' | 'line' | 'rect' | 'eraser'>('select');
  const [strokeColor, setStrokeColor] = useState<string>('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [accessRequested, setAccessRequested] = useState(false);

  // Gemini AI Architecture Analysis State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<'gemini-live' | 'fallback'>('gemini-live');
  const [customQuestion, setCustomQuestion] = useState('');

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Determine drawing capability
  const userCanDraw = isHost || canDraw || roomPermissions?.whiteboardDrawMode === 'everyone' || 
    (roomPermissions?.whiteboardDrawMode === 'selected' && roomPermissions?.allowedWhiteboardIds?.includes('me'));

  // Handle Dragging Architecture Nodes
  const handleNodeMouseDown = (e: React.MouseEvent, el: WhiteboardElement) => {
    if (!userCanDraw) return;
    if (activeTool !== 'select') return;
    e.stopPropagation();
    setSelectedElementId(el.id);
    setDraggingId(el.id);
    setDragOffset({
      x: e.clientX - el.x,
      y: e.clientY - el.y,
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!userCanDraw) return;
    if (activeTool === 'select' || activeTool === 'eraser') return;
    if (!canvasRef.current) return;

    const bounds = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    const newStroke: DrawingStroke = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tool: activeTool,
      points: [{ x, y }],
      color: strokeColor,
      size: activeTool === 'brush' ? strokeWidth * 2 : strokeWidth,
    };
    setCurrentStroke(newStroke);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. Move dragging node
    if (draggingId && canvasRef.current && activeTool === 'select') {
      const canvasBounds = canvasRef.current.getBoundingClientRect();
      const newX = Math.max(10, Math.min(canvasBounds.width - 160, e.clientX - dragOffset.x));
      const newY = Math.max(10, Math.min(canvasBounds.height - 90, e.clientY - dragOffset.y));

      const updated = elements.map((el) => (el.id === draggingId ? { ...el, x: newX, y: newY } : el));
      onUpdateElements(updated);
      onBroadcastWhiteboardUpdate?.(updated, strokes);
      return;
    }

    // 2. Freehand drawing
    if (!currentStroke || !canvasRef.current) return;
    const bounds = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    if (currentStroke.tool === 'pen' || currentStroke.tool === 'brush') {
      setCurrentStroke((prev) => prev ? {
        ...prev,
        points: [...prev.points, { x, y }]
      } : null);
    } else {
      // Shapes / Arrow / Line (Anchor start, stretch to current)
      setCurrentStroke((prev) => prev ? {
        ...prev,
        points: [prev.points[0], { x, y }]
      } : null);
    }
  };

  const handlePointerUp = () => {
    if (draggingId) {
      setDraggingId(null);
    }
    if (currentStroke) {
      const updated = [...strokes, currentStroke];
      setStrokes(updated);
      setCurrentStroke(null);
      onBroadcastWhiteboardUpdate?.(elements, updated);
    }
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    onBroadcastWhiteboardUpdate?.(elements, updated);
  };

  const handleClearDrawings = () => {
    setStrokes([]);
    onBroadcastWhiteboardUpdate?.(elements, []);
  };

  const handleAddNode = () => {
    if (!newNodeLabel.trim() || !userCanDraw) return;

    let color = '#0f172a';
    let fillColor = '#0f172a';
    if (newNodeType === 'database') {
      color = '#059669';
      fillColor = '#059669';
    } else if (newNodeType === 'cloud') {
      color = '#2563eb';
      fillColor = '#2563eb';
    } else if (newNodeType === 'sticky') {
      color = '#d97706';
      fillColor = '#d97706';
    } else if (newNodeType === 'circle') {
      color = '#7c3aed';
      fillColor = '#7c3aed';
    }

    const newElement: WhiteboardElement = {
      id: `node-${Date.now()}`,
      type: newNodeType,
      x: 120 + Math.random() * 200,
      y: 100 + Math.random() * 120,
      width: newNodeType === 'sticky' ? 140 : 160,
      height: newNodeType === 'sticky' ? 100 : 75,
      label: newNodeLabel.trim(),
      color,
      fillColor,
    };

    const updated = [...elements, newElement];
    onUpdateElements(updated);
    onBroadcastWhiteboardUpdate?.(updated, strokes);
    setNewNodeLabel('');
  };

  const handleDeleteSelected = () => {
    if (!selectedElementId || !userCanDraw) return;
    const updated = elements.filter((el) => el.id !== selectedElementId);
    onUpdateElements(updated);
    onBroadcastWhiteboardUpdate?.(updated, strokes);
    setSelectedElementId(null);
  };

  const handleResetDefaults = () => {
    if (!userCanDraw) return;
    const defaults: WhiteboardElement[] = [
      {
        id: 'node-client',
        type: 'rect',
        x: 60,
        y: 160,
        width: 150,
        height: 70,
        label: 'Client WebRTC / Next.js',
        color: '#2563eb',
        fillColor: '#0f172a'
      },
      {
        id: 'node-lb',
        type: 'service',
        x: 260,
        y: 160,
        width: 150,
        height: 70,
        label: 'Cloudflare Edge / Anycast',
        color: '#4f46e5',
        fillColor: '#0f172a'
      },
      {
        id: 'node-gateway',
        type: 'cloud',
        x: 460,
        y: 160,
        width: 170,
        height: 80,
        label: 'API Gateway & SFU Cluster',
        color: '#0284c7',
        fillColor: '#0f172a'
      },
      {
        id: 'node-kafka',
        type: 'rect',
        x: 680,
        y: 90,
        width: 150,
        height: 65,
        label: 'Kafka Event Stream',
        color: '#d97706',
        fillColor: '#0f172a'
      },
      {
        id: 'node-db',
        type: 'database',
        x: 680,
        y: 230,
        width: 150,
        height: 70,
        label: 'PostgreSQL Distributed DB',
        color: '#059669',
        fillColor: '#0f172a'
      },
    ];
    onUpdateElements(defaults);
    setStrokes([]);
    onBroadcastWhiteboardUpdate?.(defaults, []);
  };

  // Run Gemini AI Architecture Analysis
  const handleRunAIAnalysis = async (customPrompt?: string) => {
    setIsAIModalOpen(true);
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_architecture',
          elements,
          userPrompt: customPrompt || customQuestion,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
        setAiSource(data.source || 'gemini-live');
      }
    } catch (e) {
      console.error('Failed to run AI architecture review:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRequestAccessClick = () => {
    if (onRequestDrawAccess) {
      onRequestDrawAccess();
      setAccessRequested(true);
      setTimeout(() => setAccessRequested(false), 3000);
    }
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

  const renderStrokeSvg = (stroke: DrawingStroke) => {
    if (stroke.points.length === 0) return null;

    if (stroke.tool === 'pen' || stroke.tool === 'brush') {
      const d = stroke.points.reduce(
        (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
        ''
      );
      return (
        <path
          key={stroke.id}
          d={d}
          stroke={stroke.color}
          strokeWidth={stroke.size}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={stroke.tool === 'brush' ? 0.6 : 1}
        />
      );
    }

    if (stroke.tool === 'line') {
      const p1 = stroke.points[0];
      const p2 = stroke.points[stroke.points.length - 1];
      return (
        <line
          key={stroke.id}
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke={stroke.color}
          strokeWidth={stroke.size}
          strokeLinecap="round"
        />
      );
    }

    if (stroke.tool === 'arrow') {
      const p1 = stroke.points[0];
      const p2 = stroke.points[stroke.points.length - 1];
      return (
        <line
          key={stroke.id}
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke={stroke.color}
          strokeWidth={stroke.size}
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
        />
      );
    }

    if (stroke.tool === 'rect') {
      const p1 = stroke.points[0];
      const p2 = stroke.points[stroke.points.length - 1];
      const x = Math.min(p1.x, p2.x);
      const y = Math.min(p1.y, p2.y);
      const w = Math.abs(p2.x - p1.x);
      const h = Math.abs(p2.y - p1.y);
      return (
        <rect
          key={stroke.id}
          x={x}
          y={y}
          width={w}
          height={h}
          stroke={stroke.color}
          strokeWidth={stroke.size}
          strokeDasharray="4 4"
          fill="none"
          rx="8"
        />
      );
    }

    return null;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] select-none relative">
      {/* Top Floating Action Bar: Node & Drawing Controls */}
      <div className="h-14 px-4 bg-white flex items-center justify-between z-20 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)]">
        {/* Left: Quick Node Creator or Drawing Tools */}
        <div className="flex items-center space-x-2">
          {userCanDraw ? (
            <>
              {/* Tool Mode Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl space-x-1">
                <button
                  onClick={() => setActiveTool('select')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    activeTool === 'select' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-slate-500 hover:text-[#0f172a]'
                  }`}
                  title="Select & Move Nodes"
                >
                  <Move className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTool('pen')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    activeTool === 'pen' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-slate-500 hover:text-[#0f172a]'
                  }`}
                  title="Freehand Pen"
                >
                  <Pen className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTool('brush')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    activeTool === 'brush' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-slate-500 hover:text-[#0f172a]'
                  }`}
                  title="Highlighter Brush"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTool('arrow')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    activeTool === 'arrow' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-slate-500 hover:text-[#0f172a]'
                  }`}
                  title="Connector Arrow"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTool('line')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    activeTool === 'line' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-slate-500 hover:text-[#0f172a]'
                  }`}
                  title="Straight Line"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTool('rect')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    activeTool === 'rect' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-slate-500 hover:text-[#0f172a]'
                  }`}
                  title="Boundary Area"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Color Swatches */}
              <div className="hidden lg:flex items-center space-x-1.5 pl-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setStrokeColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      strokeColor === c.hex ? 'ring-2 ring-offset-2 ring-[#0f172a] scale-110' : 'hover:scale-105'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Node Input */}
              <div className="hidden sm:flex items-center space-x-1.5 pl-2">
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as WhiteboardElement['type'])}
                  className="bg-slate-50 text-[11px] font-semibold text-[#0f172a] rounded-lg px-2 py-1.5 focus:outline-none shadow-2xs"
                >
                  <option value="service">Service</option>
                  <option value="cloud">Gateway</option>
                  <option value="database">Database</option>
                  <option value="rect">Worker</option>
                  <option value="sticky">Sticky Note</option>
                </select>

                <input
                  type="text"
                  placeholder="Component name..."
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
                  className="bg-slate-50 text-xs text-[#0f172a] rounded-lg px-2.5 py-1.5 w-32 md:w-44 focus:outline-none shadow-2xs"
                />

                <button
                  onClick={handleAddNode}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span className="hidden xl:inline">Add</span>
                </button>
              </div>

              {/* Undo / Clear Actions */}
              <div className="flex items-center space-x-1 pl-1">
                <button
                  onClick={handleUndo}
                  disabled={strokes.length === 0}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#0f172a] hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  title="Undo last stroke"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleClearDrawings}
                  disabled={strokes.length === 0}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 transition-colors"
                  title="Clear drawings"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            /* View-only state */
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>View Only</span>
              </span>
              <button
                onClick={handleRequestAccessClick}
                disabled={accessRequested}
                className="px-3 py-1 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {accessRequested ? 'Request Sent!' : 'Request Draw Access'}
              </button>
            </div>
          )}
        </div>

        {/* Right: Host Permission Toggle & Gemini AI Review */}
        <div className="flex items-center space-x-2">
          {/* Host Whiteboard Access Toggle */}
          {isHost && onUpdatePermissions && roomPermissions && (
            <div className="hidden md:flex items-center space-x-1 text-xs">
              <span className="text-[11px] text-slate-500 font-medium">Drawing:</span>
              <select
                value={roomPermissions.whiteboardDrawMode || 'host-only'}
                onChange={(e) => {
                  onUpdatePermissions({
                    ...roomPermissions,
                    whiteboardDrawMode: e.target.value as 'host-only' | 'everyone' | 'selected'
                  });
                }}
                className="bg-slate-50 text-[11px] font-bold text-slate-700 rounded-lg px-2 py-1 focus:outline-none shadow-2xs"
              >
                <option value="host-only">Host Only</option>
                <option value="everyone">Everyone Can Draw</option>
              </select>
            </div>
          )}

          {/* AI Architecture Review Button */}
          <button
            onClick={() => handleRunAIAnalysis()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
            title="Perform Gemini AI Architecture Review"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>AI Architecture Review</span>
          </button>

          {/* Reset Stencil */}
          {userCanDraw && (
            <button
              onClick={handleResetDefaults}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
              title="Reset to default cloud architecture"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => {
          if (activeTool === 'select') setSelectedElementId(null);
        }}
        className={`flex-1 relative overflow-hidden bg-white bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] ${
          !userCanDraw ? 'cursor-default' : activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'
        }`}
      >
        {/* SVG Overlay for Freehand Strokes and Connectors */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#0f172a" />
            </marker>
          </defs>

          {/* Default SVG Connectors between nodes */}
          {elements.length >= 3 && (
            <>
              <line
                x1={elements[0].x + elements[0].width}
                y1={elements[0].y + elements[0].height / 2}
                x2={elements[1].x}
                y2={elements[1].y + elements[1].height / 2}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="4 4"
                markerEnd="url(#arrowhead)"
              />
              <line
                x1={elements[1].x + elements[1].width}
                y1={elements[1].y + elements[1].height / 2}
                x2={elements[2].x}
                y2={elements[2].y + elements[2].height / 2}
                stroke="#94a3b8"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            </>
          )}

          {/* Render Persistent Drawn Strokes */}
          {strokes.map(renderStrokeSvg)}

          {/* Render Current In-Progress Stroke */}
          {currentStroke && renderStrokeSvg(currentStroke)}
        </svg>

        {/* Empty Canvas Prompt */}
        {elements.length === 0 && strokes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center p-6 z-0">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
              <Layers className="w-5 h-5 text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-[#0f172a]">Architecture Canvas Ready</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
              Use the pen, arrows, and shapes to map out microservices or click below to load a cloud stencil.
            </p>
            {userCanDraw && (
              <button
                onClick={handleResetDefaults}
                className="mt-4 pointer-events-auto px-3.5 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Load Starter Cloud Topology
              </button>
            )}
          </div>
        )}

        {/* Draggable Architecture Nodes */}
        {elements.map((el) => {
          const isSelected = el.id === selectedElementId;
          const isSticky = el.type === 'sticky';
          return (
            <div
              key={el.id}
              onMouseDown={(e) => handleNodeMouseDown(e, el)}
              style={{
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
              }}
              className={`absolute p-3 rounded-2xl transition-all shadow-md ${
                isSticky
                  ? 'bg-amber-50 text-amber-950 border border-amber-200 shadow-amber-100'
                  : 'bg-[#0f172a] text-white'
              } ${
                userCanDraw && activeTool === 'select' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              } ${
                isSelected ? 'ring-2 ring-blue-500 scale-105 z-30' : 'hover:scale-[1.02] z-20'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1 opacity-80">
                <div className="flex items-center space-x-1.5">
                  {getNodeIcon(el.type)}
                  <span className="uppercase text-[9px] tracking-wider font-extrabold">{el.type}</span>
                </div>
                {userCanDraw && activeTool === 'select' && (
                  <Move className="w-3 h-3 opacity-50" />
                )}
              </div>
              <div className="text-xs font-bold leading-snug line-clamp-2">
                {el.label}
              </div>
            </div>
          );
        })}

        {/* Selected Element Delete Button */}
        {selectedElementId && userCanDraw && activeTool === 'select' && (
          <div className="absolute top-4 right-4 z-40">
            <button
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Node</span>
            </button>
          </div>
        )}
      </div>

      {/* Gemini AI Architecture Analysis Slide-over Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] bg-white">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">Gemini Architecture Intelligence</h3>
                  <p className="text-[11px] text-slate-400">Deep structural audit, bottleneck detection & security posture</p>
                </div>
              </div>
              <button
                onClick={() => setIsAIModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Analysis Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
              {isAnalyzing ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-sm font-semibold text-[#0f172a]">Analyzing Architecture Topology...</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Evaluating microservice fanout, distributed persistence, queue limits, and DTLS-SRTP encryption...
                  </p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pb-2">
                    <span className="flex items-center space-x-1.5 text-emerald-600 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Analysis Completed ({aiSource === 'gemini-live' ? 'Live Gemini 3.5' : 'Verified Model'})</span>
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(aiAnalysis)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                    >
                      Copy Report
                    </button>
                  </div>

                  <div className="prose prose-xs max-w-none text-slate-800 space-y-3 whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl">
                    {aiAnalysis}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer: Ask Custom Architecture Question */}
            <div className="p-4 bg-slate-50 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask Gemini (e.g. How to scale this to 100k concurrent viewers?)..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customQuestion.trim()) {
                    handleRunAIAnalysis(customQuestion);
                    setCustomQuestion('');
                  }
                }}
                className="flex-1 bg-white px-3 py-2 rounded-xl text-xs text-[#0f172a] shadow-xs focus:outline-none"
              />
              <button
                onClick={() => {
                  if (customQuestion.trim()) {
                    handleRunAIAnalysis(customQuestion);
                    setCustomQuestion('');
                  }
                }}
                disabled={isAnalyzing || !customQuestion.trim()}
                className="px-3.5 py-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-colors disabled:opacity-40 flex items-center space-x-1 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Analyze</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
