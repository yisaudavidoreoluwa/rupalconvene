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
  Maximize2,
  Hand,
  Lock,
  Unlock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { PitchSlide, Participant, RoomPermissions } from '@/types/meeting';

interface PitchDeckViewerProps {
  slides: PitchSlide[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  isWatermarkActive: boolean;
  currentUser: Participant;
  onOpenDealRoom: () => void;
  onUploadSlide?: (newSlide: PitchSlide) => void;
  onUploadSlides?: (newSlides: PitchSlide[]) => void;
  laserPointer?: { x: number; y: number; visible: boolean } | null;
  onLaserMove?: (x: number, y: number, visible: boolean) => void;
  // Hands on Deck & Host Permission Props (Requirement 6)
  isHost?: boolean;
  canControlDeck?: boolean;
  roomPermissions?: RoomPermissions;
  onUpdatePermissions?: (permissions: RoomPermissions) => void;
  onRequestDeckAccess?: () => void;
}

// Client-side PDF.js Dynamic Loader
const loadPdfJs = async () => {
  if (typeof window === 'undefined') return null;
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  return new Promise<any>((resolve, reject) => {
    const existingScript = document.getElementById('pdfjs-script');
    if (existingScript) {
      const interval = setInterval(() => {
        if ((window as any).pdfjsLib) {
          clearInterval(interval);
          resolve((window as any).pdfjsLib);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = 'pdfjs-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      } else {
        reject(new Error('PDF.js failed to initialize'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
    document.head.appendChild(script);
  });
};

export const PitchDeckViewer: React.FC<PitchDeckViewerProps> = ({
  slides,
  currentSlideIndex,
  onSlideChange,
  isWatermarkActive,
  currentUser,
  onOpenDealRoom,
  onUploadSlide,
  onUploadSlides,
  laserPointer,
  onLaserMove,
  isHost = true,
  canControlDeck = true,
  roomPermissions,
  onUpdatePermissions,
  onRequestDeckAccess,
}) => {
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [localLaser, setLocalLaser] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [deckRequestSent, setDeckRequestSent] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Determine if current user is allowed to control slides & deck (Requirement 6)
  const hasDeckControl = isHost || roomPermissions?.handsOnDeck || canControlDeck;

  const slide = slides[currentSlideIndex] || slides[0];

  // Keyboard navigation (Left / Right Arrow) - Only if user has deck control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasDeckControl) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentSlideIndex < slides.length - 1) onSlideChange(currentSlideIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentSlideIndex > 0) onSlideChange(currentSlideIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, onSlideChange, hasDeckControl]);

  const handlePrev = () => {
    if (!hasDeckControl) return;
    if (currentSlideIndex > 0) onSlideChange(currentSlideIndex - 1);
  };

  const handleNext = () => {
    if (!hasDeckControl) return;
    if (currentSlideIndex < slides.length - 1) onSlideChange(currentSlideIndex + 1);
  };

  // Toggle Hands on Deck (Host Action)
  const handleToggleHandsOnDeck = () => {
    if (!isHost || !roomPermissions || !onUpdatePermissions) return;
    onUpdatePermissions({
      ...roomPermissions,
      handsOnDeck: !roomPermissions.handsOnDeck,
    });
  };

  // Attendee requests hands on deck
  const handleRequestHandsOnDeck = () => {
    if (onRequestDeckAccess) {
      onRequestDeckAccess();
      setDeckRequestSent(true);
      setTimeout(() => setDeckRequestSent(false), 4000);
    }
  };

  // Process Multi-page PDF Presentation Upload or Image Upload (Requirement 5)
  const processUploadedFile = async (file: File) => {
    setIsUploading(true);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    try {
      if (isPdf) {
        setUploadStatus(`Loading PDF Presentation: ${file.name}...`);
        const pdfjsLib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        if (totalPages === 0) {
          throw new Error('PDF has no pages.');
        }

        setUploadStatus(`Processing ${totalPages} slides from PDF...`);
        const generatedSlides: PitchSlide[] = [];

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          setUploadStatus(`Rendering slide ${pageNum} of ${totalPages}...`);
          const page = await pdf.getPage(pageNum);

          // Render at 2x resolution for sharp high-DPI slide display
          const viewport = page.getViewport({ scale: 2.0 });
          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = viewport.width;
          offscreenCanvas.height = viewport.height;
          const context = offscreenCanvas.getContext('2d');

          await page.render({ canvasContext: context, viewport }).promise;
          const pageDataUrl = offscreenCanvas.toDataURL('image/png');

          // Extract text for slide metadata / notes if available
          let bulletPoints = [
            `Slide ${pageNum} of presentation document ${file.name}`,
            `Source format: PDF Document (${(file.size / 1024).toFixed(1)} KB)`,
            'Synchronized across all conference stages.',
          ];

          try {
            const textContent = await page.getTextContent();
            const textItems = textContent.items
              .map((it: any) => it.str?.trim())
              .filter((s: string) => s && s.length > 3);
            if (textItems.length > 0) {
              bulletPoints = textItems.slice(0, 4);
            }
          } catch {}

          const newSlide: PitchSlide = {
            id: Date.now() + pageNum,
            title: `${file.name.replace(/\.[^/.]+$/, '')} (Slide ${pageNum}/${totalPages})`,
            category: 'PDF Presentation',
            subtitle: `Page ${pageNum} of ${totalPages} • Uploaded by ${currentUser.name}`,
            imageUrl: pageDataUrl,
            fileType: 'application/pdf',
            fileSizeBytes: file.size,
            bulletPoints,
            speakerNotes: `Presenter discussion notes for ${file.name} - slide ${pageNum}.`,
            metrics: [
              { label: 'Slide Index', value: `${pageNum} / ${totalPages}` },
              { label: 'Document', value: 'PDF' },
            ],
          };

          generatedSlides.push(newSlide);
        }

        // Add all slides to desk
        const startTargetIndex = slides.length;
        if (onUploadSlides) {
          onUploadSlides(generatedSlides);
        } else if (onUploadSlide) {
          generatedSlides.forEach((s) => onUploadSlide(s));
        }

        // Jump to the first page of the new presentation
        onSlideChange(startTargetIndex);
        setUploadStatus(`Successfully extracted ${totalPages} slides!`);
        setTimeout(() => setUploadStatus(null), 3500);

      } else {
        // Standard Image Slide Upload
        setUploadStatus(`Uploading image slide ${file.name}...`);
        const localPreviewUrl = URL.createObjectURL(file);

        const newSlide: PitchSlide = {
          id: Date.now(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          category: isImage ? 'Visual Deck Slide' : 'Document Artifact',
          subtitle: `Uploaded by ${currentUser.name} • ${(file.size / 1024).toFixed(1)} KB`,
          imageUrl: localPreviewUrl,
          fileUrl: localPreviewUrl,
          fileType: file.type,
          fileSizeBytes: file.size,
          bulletPoints: [
            `Live presentation slide: ${file.name}`,
            `Format: ${file.type || 'Image'}`,
            'End-to-end synchronized across all participant stages.',
          ],
          speakerNotes: `Presenter discussion notes for ${file.name}.`,
          metrics: [
            { label: 'File Size', value: `${(file.size / 1024).toFixed(0)} KB`, positive: true },
            { label: 'Type', value: file.type.split('/')[1]?.toUpperCase() || 'IMG' },
          ],
        };

        if (onUploadSlide) {
          onUploadSlide(newSlide);
        }
        onSlideChange(slides.length);
        setUploadStatus(`Uploaded slide: ${file.name}`);
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch (err: any) {
      console.error('[Deck] Failed to process presentation file:', err);
      setUploadStatus(`Upload failed: ${err.message || 'Error parsing file'}`);
      setTimeout(() => setUploadStatus(null), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (!hasDeckControl) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  // Laser Pointer Interactions
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLaserActive || !canvasRef.current || !hasDeckControl) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setLocalLaser({ x, y });
    if (onLaserMove) {
      onLaserMove(x, y, true);
    }
  }, [isLaserActive, onLaserMove, hasDeckControl]);

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
      className="w-full h-full flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] relative select-none"
      onDragOver={(e) => { 
        if (hasDeckControl) {
          e.preventDefault(); 
          setIsDraggingFile(true); 
        }
      }}
      onDragLeave={() => setIsDraggingFile(false)}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 bg-[#0f172a]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white border-2 border-dashed border-blue-400 rounded-3xl">
          <Upload className="w-12 h-12 text-blue-400 animate-bounce mb-3" />
          <h3 className="text-lg font-bold">Drop Presentation Slides or Multi-page PDF Here</h3>
          <p className="text-xs text-slate-300 mt-1">Extracts and converts all PDF pages into synchronized presentation slides</p>
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
      <div className="h-12 bg-white px-3 sm:px-4 flex items-center justify-between z-20 flex-shrink-0 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0f172a] text-white whitespace-nowrap">
            {slide?.category || 'Presentation'}
          </span>
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
          {uploadStatus && (
            <span className="text-xs text-blue-600 font-medium flex items-center gap-1 animate-in fade-in truncate max-w-[150px] sm:max-w-[240px]">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
              <span className="truncate">{uploadStatus}</span>
            </span>
          )}
        </div>

        {/* Center/Right: Hands on Deck Controls (Requirement 6) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Host Hands on Deck Toggle */}
          {isHost ? (
            <button
              onClick={handleToggleHandsOnDeck}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                roomPermissions?.handsOnDeck
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Toggle Hands on Deck: Allow all attendees to advance slides and present"
            >
              <Hand className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hands on Deck:</span>
              <span>{roomPermissions?.handsOnDeck ? 'Everyone' : 'Host Only'}</span>
            </button>
          ) : (
            <div>
              {hasDeckControl ? (
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <Hand className="w-3 h-3 text-emerald-600" />
                  <span className="hidden sm:inline">Deck Access Granted</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span className="hidden xs:inline">Host Locked</span>
                  </div>
                  <button
                    onClick={handleRequestHandsOnDeck}
                    disabled={deckRequestSent}
                    className="px-2.5 py-1 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {deckRequestSent ? '✓ Requested' : 'Request Hands on Deck'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Laser Pointer Toggle (Only if user has deck control) */}
          {hasDeckControl && (
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
          )}

          {/* Upload Presentation Deck (Images or multi-page PDFs) */}
          {hasDeckControl && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.pptx"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
                title="Upload multi-page PDF or slide image"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">{isUploading ? 'Extracting...' : 'Upload PDF / Slide'}</span>
              </button>
            </>
          )}

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
              disabled={currentSlideIndex === 0 || !hasDeckControl}
              className="p-1 rounded-lg text-slate-700 hover:text-[#0f172a] disabled:opacity-30 transition-colors"
              title="Previous Slide (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentSlideIndex === slides.length - 1 || !hasDeckControl}
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
                className="max-h-[60vh] max-w-full object-contain rounded-xl transition-transform duration-150 select-none pointer-events-none"
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
            onClick={() => hasDeckControl && onSlideChange(index)}
            disabled={!hasDeckControl}
            className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border text-left flex-shrink-0 transition-all ${
              currentSlideIndex === index
                ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500'
                : hasDeckControl
                ? 'bg-slate-50 border-slate-200/60 hover:border-slate-300'
                : 'bg-slate-50/50 border-slate-200/40 opacity-70 cursor-not-allowed'
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
        {hasDeckControl && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 text-slate-500 hover:text-blue-600 text-xs font-semibold flex-shrink-0 transition-colors"
            title="Upload multi-page PDF or slide image"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px]">Add Slide / PDF</span>
          </button>
        )}
      </div>
    </div>
  );
};
