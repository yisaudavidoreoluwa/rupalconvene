'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Briefcase,
  Upload,
  CheckCircle2,
  FileText,
  TrendingUp,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MousePointer,
  Download,
  Plus,
  Image as ImageIcon,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { PitchSlide, Participant } from '@/types/meeting';

interface PitchDeckViewerProps {
  slides: PitchSlide[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  isWatermarkActive: boolean;
  currentUser: Participant;
  onOpenDealRoom: () => void;
  onUploadSlide?: (newSlide: PitchSlide) => void;
  laserPointer?: { x: number; y: number; visible: boolean } | null;
  onLaserMove?: (x: number, y: number, visible: boolean) => void;
}

export const PitchDeckViewer: React.FC<PitchDeckViewerProps> = ({
  slides,
  currentSlideIndex,
  onSlideChange,
  isWatermarkActive,
  currentUser,
  onOpenDealRoom,
  onUploadSlide,
  laserPointer,
  onLaserMove,
}) => {
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [localLaser, setLocalLaser] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const slide = slides[currentSlideIndex] || slides[0];

  // Keyboard navigation (Left / Right Arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentSlideIndex < slides.length - 1) onSlideChange(currentSlideIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentSlideIndex > 0) onSlideChange(currentSlideIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, onSlideChange]);

  const handlePrev = () => {
    if (currentSlideIndex > 0) onSlideChange(currentSlideIndex - 1);
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) onSlideChange(currentSlideIndex + 1);
  };

  // Upload handling (Supports images, PDFs, presentation slides)
  const processUploadedFile = async (file: File) => {
    setIsUploading(true);
    setUploadStatus(`Preparing ${file.name}...`);

    // Immediate local object URL for instant preview
    const localPreviewUrl = URL.createObjectURL(file);
    const isImage = file.type.startsWith('image/');

    const pendingSlide: PitchSlide = {
      id: slides.length + 1,
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: isImage ? 'Visual Deck Slide' : 'Document Artifact',
      subtitle: `Uploaded by ${currentUser.name} • ${(file.size / 1024).toFixed(1)} KB`,
      imageUrl: isImage ? localPreviewUrl : undefined,
      fileUrl: localPreviewUrl,
      fileType: file.type,
      fileSizeBytes: file.size,
      bulletPoints: [
        `Live uploaded artifact: ${file.name}`,
        `File format: ${file.type || 'Document'}`,
        'End-to-end synchronized across all participant stages.',
      ],
      speakerNotes: `Presenter discussion notes for ${file.name}.`,
      metrics: [
        { label: 'File Size', value: `${(file.size / 1024).toFixed(0)} KB`, positive: true },
        { label: 'Type', value: file.type.split('/')[1]?.toUpperCase() || 'FILE' },
      ],
    };

    if (onUploadSlide) {
      onUploadSlide(pendingSlide);
      onSlideChange(slides.length);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploaderId', currentUser.id);

      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.file) {
        setUploadStatus(`Uploaded: ${file.name}`);
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch {
      setUploadStatus(`Uploaded locally: ${file.name}`);
      setTimeout(() => setUploadStatus(null), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  // Laser Pointer Interactions
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLaserActive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setLocalLaser({ x, y });
    if (onLaserMove) {
      onLaserMove(x, y, true);
    }
  }, [isLaserActive, onLaserMove]);

  const handleMouseLeave = useCallback(() => {
    setLocalLaser(null);
    if (onLaserMove) {
      onLaserMove(0, 0, false);
    }
  }, [onLaserMove]);

  const activeLaser = isLaserActive ? localLaser : (laserPointer?.visible ? laserPointer : null);

  const watermarkString = `CONFIDENTIAL • ${currentUser.name.toUpperCase()} • ${currentUser.email || 'RUPAL CONVENE'} • ENCRYPTED SESSION`;

  return (
    <div 
      className="w-full h-full flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs relative select-none"
      onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
      onDragLeave={() => setIsDraggingFile(false)}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 bg-[#0f172a]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white border-2 border-dashed border-blue-400 rounded-3xl">
          <Upload className="w-12 h-12 text-blue-400 animate-bounce mb-3" />
          <h3 className="text-lg font-bold">Drop Presentation Slides or Images Here</h3>
          <p className="text-xs text-slate-300 mt-1">Supports PNG, JPG, PDF, SVG slide decks</p>
        </div>
      )}

      {/* Screen-Privacy Watermark Overlay */}
      {isWatermarkActive && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden flex flex-col justify-around py-8 opacity-15">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="text-[#0f172a] font-mono text-[11px] sm:text-xs font-black tracking-widest uppercase transform -rotate-12 whitespace-nowrap text-center select-none"
            >
              {watermarkString} • {watermarkString}
            </div>
          ))}
        </div>
      )}

      {/* Top Presentation Action Bar */}
      <div className="h-12 bg-white border-b border-slate-100 px-3 sm:px-4 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0f172a] text-white whitespace-nowrap">
            {slide?.category || 'Presentation'}
          </span>
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
          {uploadStatus && (
            <span className="text-xs text-blue-600 font-medium flex items-center gap-1 animate-in fade-in truncate max-w-[150px] sm:max-w-[220px]">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
              <span className="truncate">{uploadStatus}</span>
            </span>
          )}
        </div>

        {/* Right Controls Group */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Laser Pointer Toggle */}
          <button
            onClick={() => setIsLaserActive(!isLaserActive)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              isLaserActive
                ? 'bg-red-500 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
            title={isLaserActive ? 'Turn off laser pointer' : 'Turn on live laser pointer'}
          >
            <span className={`w-2 h-2 rounded-full ${isLaserActive ? 'bg-white animate-ping' : 'bg-red-500'}`} />
            <span className="hidden sm:inline">Laser</span>
          </button>

          {/* Upload Presentation Deck */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.pptx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            title="Upload slide or document"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload Slide'}</span>
          </button>

          {/* Deal Room Button */}
          <button
            onClick={onOpenDealRoom}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
            title="Open Deal Room & Term Sheet"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Deal Room</span>
          </button>

          {/* Notes Toggle */}
          <button
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`px-2 py-1 rounded-xl text-xs font-semibold transition-colors ${
              showSpeakerNotes
                ? 'bg-[#0f172a] text-white'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
            title="Toggle speaker notes"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>

          {/* Slide Navigation Arrows */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className="p-1 rounded-lg text-slate-700 hover:text-[#0f172a] disabled:opacity-30 transition-colors"
              title="Previous Slide (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-1 rounded-lg text-slate-700 hover:text-[#0f172a] disabled:opacity-30 transition-colors"
              title="Next Slide (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Presentation Stage */}
      <div 
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex-1 flex flex-col justify-between p-4 sm:p-8 overflow-y-auto bg-[#fafafa] relative z-10 cursor-default"
      >
        {/* Live Synchronized Laser Pointer */}
        {activeLaser && (
          <div 
            className="absolute pointer-events-none z-40 transition-transform duration-75 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${activeLaser.x}%`, top: `${activeLaser.y}%` }}
          >
            <div className="relative">
              <span className="w-4 h-4 rounded-full bg-red-500 block animate-ping opacity-75 absolute -inset-1" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white block shadow-lg" />
            </div>
          </div>
        )}

        {/* 1. Uploaded Image / Document Slide View */}
        {slide?.imageUrl ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-2 min-h-[300px]">
            <div className="relative max-w-full max-h-[70vh] rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100 flex items-center justify-center p-2">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-h-[60vh] max-w-full object-contain rounded-xl transition-transform duration-150"
              />

              {/* Floating Zoom Bar for Image Slides */}
              <div className="absolute bottom-3 right-3 flex items-center space-x-1 p-1 rounded-xl bg-[#0f172a]/80 backdrop-blur-md text-white shadow-md z-20">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                  className="p-1 hover:text-blue-300 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1 font-bold">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                  className="p-1 hover:text-blue-300 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 hover:text-blue-300 transition-colors border-l border-white/20 pl-1.5"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="mt-3 text-center">
              <h2 className="text-base font-bold text-[#0f172a]">{slide.title}</h2>
              <p className="text-xs text-slate-500 font-medium">{slide.subtitle}</p>
            </div>
          </div>
        ) : (
          /* 2. Structured Executive Pitch Slide View */
          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full py-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Executive Strategy Deck</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight leading-tight">
                {slide?.title || 'Conference Presentation'}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">
                {slide?.subtitle || 'Session in progress'}
              </p>
            </div>

            {/* Bullet Points */}
            <div className="mt-6 sm:mt-8 space-y-3 max-w-2xl">
              {slide?.bulletPoints?.map((point, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base leading-relaxed font-normal">{point}</span>
                </div>
              ))}
            </div>

            {/* Slide Metrics Cards */}
            {slide?.metrics && (
              <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
                {slide.metrics.map((metric, idx) => (
                  <div key={idx} className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {metric.label}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#0f172a] mt-0.5">
                      {metric.value}
                    </div>
                    {metric.change && (
                      <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{metric.change}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Presenter Speaker Notes Banner */}
        {showSpeakerNotes && (
          <div className="mt-4 p-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-600 shadow-xs">
            <span className="font-bold text-[#0f172a] uppercase tracking-wider text-[10px] block mb-1">
              Presenter Notes:
            </span>
            <p className="italic text-slate-700 leading-relaxed">
              &quot;{slide?.speakerNotes || 'No notes for this slide.'}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Bottom Slide Thumbnails Strip */}
      <div className="h-16 bg-white border-t border-slate-100 px-3 flex items-center space-x-2.5 overflow-x-auto flex-shrink-0 z-20">
        {slides.map((s, index) => (
          <button
            key={s.id || index}
            onClick={() => onSlideChange(index)}
            className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border text-left flex-shrink-0 transition-all ${
              currentSlideIndex === index
                ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500'
                : 'bg-slate-50 border-slate-200/60 hover:border-slate-300'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-[#0f172a] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              {s.imageUrl ? <ImageIcon className="w-3 h-3 text-cyan-300" /> : index + 1}
            </div>
            <div className="max-w-[100px] truncate">
              <span className="text-[11px] font-bold text-slate-800 block truncate leading-tight">
                {s.title}
              </span>
              <span className="text-[9px] text-slate-400 block truncate">
                {s.category}
              </span>
            </div>
          </button>
        ))}

        {/* Quick Add Slide Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 text-slate-500 hover:text-blue-600 text-xs font-semibold flex-shrink-0 transition-colors"
          title="Upload image or deck slide"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[11px]">Add Slide</span>
        </button>
      </div>
    </div>
  );
};
