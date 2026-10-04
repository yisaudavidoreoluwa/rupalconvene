'use client';

import React, { useState, useEffect } from 'react';
import { 
  Info, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Download, 
  Settings, 
  Minus, 
  X, 
  FileText, 
  Edit3, 
  CheckSquare, 
  Square,
  ChevronRight
} from 'lucide-react';
import { LiveCaption } from '@/types/meeting';

interface GeminiNotesCardProps {
  captions?: LiveCaption[];
  meetingTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface NoteItem {
  task: string;
  assignee?: string;
  status: 'pending' | 'completed';
}

interface GeminiNotesData {
  summary: string;
  keyTakeaways: string[];
  actionItems: NoteItem[];
  decisions: string[];
  updatedAt: string;
  source?: string;
}

export const GeminiNotesCard: React.FC<GeminiNotesCardProps> = ({
  captions = [],
  meetingTitle = 'Executive & Engineering Sync',
  isOpen,
  onClose,
  className = '',
}) => {
  // Setup preferences matching the screenshot
  const [useTranscript, setUseTranscript] = useState(true);
  const [autoStart, setAutoStart] = useState(true);
  const [allowEveryone, setAllowEveryone] = useState(true);

  // Card view state: 'setup' (exact match to screenshot), 'active' (notes studio), 'minimized'
  const [viewState, setViewState] = useState<'setup' | 'active' | 'minimized'>('setup');
  const [activeTab, setActiveTab] = useState<'ai' | 'personal'>('ai');
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  // Personal notes editor state
  const [personalNotes, setPersonalNotes] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rupal_personal_notes') || '';
    }
    return '';
  });

  // AI-generated notes state
  const [aiNotes, setAiNotes] = useState<GeminiNotesData>({
    summary: 'The team is aligning on distributed WebRTC video mesh architecture, presentation deck sync, and enterprise security compliance.',
    keyTakeaways: [
      'Edge routing verified with sub-10ms peer signaling latency.',
      'Active speaker auto-focus highlights the presenter in high-definition 2x2 grid.',
      'Gemini AI note-taking continuously processes meeting context to create personalized action items.'
    ],
    actionItems: [
      { task: 'Verify token bucket rate limiter edge benchmarks', assignee: 'Alex Vance', status: 'pending' },
      { task: 'Circulate term sheet syndication updates', assignee: 'Elena Rostova', status: 'pending' },
      { task: 'Confirm automated meeting transcript storage', assignee: 'You', status: 'completed' }
    ],
    decisions: [
      'Approved zero-trust DTLS-SRTP encryption standard',
      'Adopted edge-to-edge 2x2 gallery viewport'
    ],
    updatedAt: 'Just now',
    source: 'gemini-live'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Persist personal notes locally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rupal_personal_notes', personalNotes);
    }
  }, [personalNotes]);

  // Fetch / Generate notes from Gemini API
  const handleGenerateNotes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'take_notes',
          transcript: captions.map((c) => ({
            speakerName: c.speakerName,
            text: c.text,
            timestamp: c.timestamp,
          })),
          userNotes: personalNotes,
          meetingTitle,
          options: {
            useTranscript,
            autoStart,
            allowEveryone,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.notes) {
          setAiNotes(data.notes);
        }
      }
    } catch (err) {
      console.warn('Failed to generate Gemini notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActionItem = (index: number) => {
    setAiNotes((prev) => {
      const updated = [...prev.actionItems];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          status: updated[index].status === 'completed' ? 'pending' : 'completed',
        };
      }
      return { ...prev, actionItems: updated };
    });
  };

  const handleCopyNotes = () => {
    const text = `=== Meeting Notes: ${meetingTitle} ===\nUpdated: ${aiNotes.updatedAt}\n\nSummary:\n${aiNotes.summary}\n\nKey Takeaways:\n${aiNotes.keyTakeaways.map((t) => `• ${t}`).join('\n')}\n\nAction Items:\n${aiNotes.actionItems.map((a) => `[${a.status === 'completed' ? 'X' : ' '}] ${a.task} (${a.assignee || 'Unassigned'})`).join('\n')}\n\nPersonal Notes:\n${personalNotes || 'None'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNotes = () => {
    const text = `# Meeting Notes: ${meetingTitle}\n*Generated via Gemini AI - ${aiNotes.updatedAt}*\n\n## Personal Summary for You\n${aiNotes.summary}\n\n## Key Takeaways\n${aiNotes.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\n## Action Items\n${aiNotes.actionItems.map((a) => `- [${a.status === 'completed' ? 'x' : ' '}] **${a.task}** (${a.assignee || 'Unassigned'})`).join('\n')}\n\n## Key Decisions\n${aiNotes.decisions.map((d) => `- ${d}`).join('\n')}\n\n## Personal Notes\n${personalNotes || 'No personal notes recorded.'}\n`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-notes-${meetingTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  // Minimized Floating Pill
  if (viewState === 'minimized') {
    return (
      <div className={`absolute top-4 right-4 z-40 ${className}`}>
        <button
          onClick={() => setViewState('active')}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#181a20]/95 hover:bg-[#22252e] text-white shadow-2xl border border-white/10 backdrop-blur-md transition-all active:scale-95 group"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-semibold">My Notes</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">Gemini</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`absolute top-3 sm:top-5 right-3 sm:right-5 z-40 w-[92vw] sm:w-[350px] md:w-[360px] animate-in fade-in zoom-in-95 duration-200 select-none ${className}`}>
      {/* 1. SETUP VIEW — EXACT MATCH TO SCREENSHOT */}
      {viewState === 'setup' && (
        <div className="bg-[#181a20]/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/10 text-white flex flex-col relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 relative">
              <h2 className="text-[17px] font-semibold tracking-tight text-white">My Notes</h2>
              <button 
                type="button"
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                aria-label="Notes information"
              >
                <Info className="w-4 h-4" />
              </button>

              {/* Info Tooltip */}
              {showInfoTooltip && (
                <div className="absolute top-7 left-0 z-50 bg-[#0f1115] border border-slate-700 text-slate-200 text-xs p-2.5 rounded-xl shadow-xl w-60 animate-in fade-in">
                  Gemini AI summarizes audio and transcripts in real time, drafting personal notes and action items strictly for your view.
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subtitle / Explainer Text */}
          <p className="text-[13px] text-slate-300 font-normal leading-snug mb-3.5">
            Take notes or use meeting transcript to create a personal summary <span className="font-semibold text-white">for you</span>.
          </p>

          {/* Checkboxes List Matching Screenshot */}
          <div className="flex flex-col space-y-1 mb-4">
            {/* Row 1: Use meeting transcript */}
            <div 
              onClick={() => setUseTranscript(!useTranscript)}
              className="flex items-center justify-between py-2 cursor-pointer group select-none"
            >
              <span className="text-[13px] text-slate-200 group-hover:text-white transition-colors">
                Use meeting transcript
              </span>
              <div 
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  useTranscript 
                    ? 'bg-[#3b82f6] text-white shadow-xs' 
                    : 'border border-slate-500 bg-transparent'
                }`}
              >
                {useTranscript && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Row 2: Auto-start note for future meetings */}
            <div 
              onClick={() => setAutoStart(!autoStart)}
              className="flex items-center justify-between py-2 cursor-pointer group select-none"
            >
              <span className="text-[13px] text-slate-200 group-hover:text-white transition-colors">
                Auto-start note for future meetings
              </span>
              <div 
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  autoStart 
                    ? 'bg-[#3b82f6] text-white shadow-xs' 
                    : 'border border-slate-500 bg-transparent'
                }`}
              >
                {autoStart && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Row 3: Allow everyone to use the meeting transcripts with My Notes */}
            <div 
              onClick={() => setAllowEveryone(!allowEveryone)}
              className="flex items-center justify-between py-2 cursor-pointer group select-none"
            >
              <span className="text-[13px] text-slate-200 group-hover:text-white transition-colors pr-2 leading-tight">
                Allow everyone to use the meeting transcripts with My Notes
              </span>
              <div 
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                  allowEveryone 
                    ? 'bg-[#3b82f6] text-white shadow-xs' 
                    : 'border border-slate-500 bg-transparent'
                }`}
              >
                {allowEveryone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* Action Button: Gradient Pill Button Matching Screenshot */}
          <button
            onClick={() => {
              setViewState('active');
              handleGenerateNotes();
            }}
            className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#4481eb] to-[#9b51e0] hover:opacity-95 active:scale-[0.98] text-white font-medium text-sm transition-all shadow-[0_4px_20px_rgba(68,129,235,0.35)] flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Start taking notes</span>
          </button>
        </div>
      )}

      {/* 2. ACTIVE NOTES STUDIO — GEMINI AI NOTE-TAKING MODE */}
      {viewState === 'active' && (
        <div className="bg-[#181a20]/95 backdrop-blur-md rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/10 text-white flex flex-col overflow-hidden max-h-[82vh]">
          {/* Top Bar */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">My Notes</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                Gemini AI
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleGenerateNotes}
                disabled={isLoading}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Regenerate with Gemini"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
              <button
                onClick={handleCopyNotes}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title={copied ? 'Copied!' : 'Copy Notes'}
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDownloadNotes}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Download Markdown"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewState('setup')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Notes Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewState('minimized')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Minimize"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-white/5 bg-[#14161b]">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-colors ${
                activeTab === 'ai'
                  ? 'border-blue-500 text-white bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>AI Summary for You</span>
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-colors ${
                activeTab === 'personal'
                  ? 'border-blue-500 text-white bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3 h-3 text-slate-300" />
              <span>Personal Notes</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-3.5 sm:p-4 overflow-y-auto space-y-4 max-h-[50vh] text-xs">
            {activeTab === 'ai' ? (
              <>
                {/* Personal Summary */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                      Personal Summary
                    </span>
                    <span className="text-[10px] text-slate-400">{aiNotes.updatedAt}</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {aiNotes.summary}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
                    Key Highlights
                  </h4>
                  <div className="space-y-1.5">
                    {aiNotes.keyTakeaways.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-slate-200 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                        <span className="leading-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Items with Checkboxes */}
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
                    Action Items & Next Steps
                  </h4>
                  <div className="space-y-1.5">
                    {aiNotes.actionItems.map((action, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleActionItem(idx)}
                        className={`flex items-start space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          action.status === 'completed'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-400'
                            : 'bg-white/[0.03] border-white/5 text-slate-200 hover:bg-white/[0.06]'
                        }`}
                      >
                        {action.status === 'completed' ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <span className={`${action.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                            {action.task}
                          </span>
                          {action.assignee && (
                            <span className="ml-1.5 text-[10px] text-blue-400 font-medium">
                              @{action.assignee}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decisions */}
                {aiNotes.decisions && aiNotes.decisions.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
                      Key Decisions
                    </h4>
                    <div className="space-y-1.5">
                      {aiNotes.decisions.map((d, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-slate-300 text-xs bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                          <Check className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Personal Notes Scratchpad */
              <div className="flex flex-col h-full space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Private notes (only visible to you)</span>
                  <span>Auto-saved</span>
                </div>
                <textarea
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder="Type your notes, questions, or action items here..."
                  className="w-full h-44 bg-white/[0.04] border border-white/10 rounded-xl p-3 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans"
                />
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="p-3 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Transcripts active</span>
            </div>

            <button
              onClick={handleGenerateNotes}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center space-x-1 shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Update with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
