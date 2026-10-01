'use client';

import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  FileText, 
  TrendingUp, 
  Briefcase,
  Upload,
  CheckCircle2,
  Plus
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
}

export const PitchDeckViewer: React.FC<PitchDeckViewerProps> = ({
  slides,
  currentSlideIndex,
  onSlideChange,
  isWatermarkActive,
  currentUser,
  onOpenDealRoom,
  onUploadSlide,
}) => {
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slide = slides[currentSlideIndex] || slides[0];

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      onSlideChange(currentSlideIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      onSlideChange(currentSlideIndex + 1);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading to storage...');

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
        setUploadStatus(`Uploaded: ${data.file.originalName}`);
        
        const newSlide: PitchSlide = {
          id: slides.length + 1,
          title: file.name.replace(/\.[^/.]+$/, ''),
          category: 'Uploaded Deck Artifact',
          subtitle: `Uploaded via Rupal Storage (${(data.file.sizeBytes / 1024).toFixed(1)} KB)`,
          bulletPoints: [
            `Stored securely at ${data.file.url}`,
            'Indexed into conference session database.',
            'Protected by dynamic IP & timestamp watermarking.',
          ],
          speakerNotes: `Presenter notes for uploaded asset: ${data.file.originalName}`,
          metrics: [
            { label: 'File Size', value: `${(data.file.sizeBytes / 1024).toFixed(0)} KB`, positive: true },
            { label: 'MIME Type', value: data.file.mimeType.split('/')[1] || 'binary' },
          ]
        };

        if (onUploadSlide) {
          onUploadSlide(newSlide);
        }

        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch (err) {
      setUploadStatus('Upload failed');
      setTimeout(() => setUploadStatus(null), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const watermarkString = `CONFIDENTIAL • ${currentUser.name.toUpperCase()} • ${currentUser.email} • E2EE AUDITED SESSION`;

  return (
    <div className="w-full h-full flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs relative select-none">
      {/* Dynamic Screen-Privacy Watermark Overlay (Navy Tone) */}
      {isWatermarkActive && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden flex flex-col justify-around py-8 opacity-20">
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

      {/* Top Presentation Bar (White & Navy) */}
      <div className="h-12 bg-white border-b border-slate-100 px-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-[#0f172a]">
            {slide?.category || 'Presentation'}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
          {uploadStatus && (
            <span className="text-xs text-blue-600 font-medium flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {uploadStatus}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Upload Presentation Deck */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.png,.jpg,.jpeg,.pptx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            title="Upload PDF or slides to Rupal Storage"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload Deck'}</span>
          </button>

          {/* Deal Room Button */}
          <button
            onClick={onOpenDealRoom}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-colors shadow-xs"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span>Deal Room</span>
          </button>

          {/* Toggle Speaker Notes */}
          <button
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors ${
              showSpeakerNotes
                ? 'bg-[#0f172a] text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1" />
            Notes
          </button>

          {/* Navigation Arrows */}
          <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xl">
            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className="p-1 rounded-lg text-slate-700 hover:text-[#0f172a] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-1 rounded-lg text-slate-700 hover:text-[#0f172a] disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Main Presentation Canvas (White Background & Navy Typography) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 overflow-y-auto bg-white relative z-10">
        <div>
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight leading-tight">
              {slide?.title || 'Conference Presentation'}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">
              {slide?.subtitle || 'Session in progress'}
            </p>
          </div>

          {/* Bullet Points */}
          <div className="mt-8 space-y-3 max-w-2xl">
            {slide?.bulletPoints?.map((point, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed">{point}</span>
              </div>
            ))}
          </div>

          {/* Slide Metrics Cards (Clean Modern Cards with Low Borders) */}
          {slide?.metrics && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              {slide.metrics.map((metric, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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

        {/* Presenter Footer / Speaker Notes Banner */}
        {showSpeakerNotes && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-600">
            <span className="font-bold text-[#0f172a] uppercase tracking-wider text-[11px] block mb-1">
              Presenter Notes (Visible to Presenter & Stage):
            </span>
            <p className="italic text-slate-700 leading-relaxed">
              &quot;{slide?.speakerNotes}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
