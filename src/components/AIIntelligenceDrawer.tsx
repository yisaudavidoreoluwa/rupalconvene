'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  Send, 
  FileText, 
  CheckCircle, 
  Circle, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  User, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { MeetingMinutes, LiveCaption, ActionItem } from '@/types/meeting';
import { requestMeetingMinutes, askMeetingCopilot } from '@/lib/gemini-service';

interface AIIntelligenceDrawerProps {
  minutes: MeetingMinutes;
  onUpdateMinutes: (minutes: MeetingMinutes) => void;
  captions: LiveCaption[];
  activeCodeSnippet?: string;
  currentSlideTitle?: string;
}

export const AIIntelligenceDrawer: React.FC<AIIntelligenceDrawerProps> = ({
  minutes,
  onUpdateMinutes,
  captions,
  activeCodeSnippet,
  currentSlideTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'minutes' | 'transcript' | 'copilot'>('minutes');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Copilot chat state
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState<Array<{ sender: 'user' | 'gemini'; text: string }>>([
    {
      sender: 'gemini',
      text: 'Hello! I am your TechConvene Gemini Copilot. I analyze live audio streams, in-meeting code executions, and investor pitch slides. How can I assist you?',
    },
  ]);

  const handleGenerateMinutes = async () => {
    setIsGenerating(true);
    try {
      const generated = await requestMeetingMinutes({
        transcript: captions,
        meetingTitle: 'Synthetix & TechConvene Partner Sync',
      });
      onUpdateMinutes(generated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAskCopilot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!copilotQuery.trim() || copilotLoading) return;

    const userQ = copilotQuery.trim();
    setCopilotQuery('');
    setCopilotHistory((prev) => [...prev, { sender: 'user', text: userQ }]);
    setCopilotLoading(true);

    try {
      const answer = await askMeetingCopilot(userQ, {
        transcript: captions,
        activeCode: activeCodeSnippet,
        currentSlide: currentSlideTitle,
      });
      setCopilotHistory((prev) => [...prev, { sender: 'gemini', text: answer }]);
    } catch (e) {
      setCopilotHistory((prev) => [
        ...prev,
        { sender: 'gemini', text: 'Error connecting to Gemini Intelligence model. Please verify API configuration.' },
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const toggleActionItem = (id: string) => {
    onUpdateMinutes({
      ...minutes,
      actionItems: minutes.actionItems.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'completed' ? 'pending' : 'completed',
            }
          : item
      ),
    });
  };

  const handleCopyMinutes = () => {
    const text = `
# TECHCONVENE MEETING MINUTES - ${minutes.generatedAt}

## Executive Summary
${minutes.executiveSummary}

## Key Technical Decisions
${minutes.keyTechnicalDecisions.map((d) => `- ${d}`).join('\n')}

## Priority Action Items
${minutes.actionItems.map((a) => `- [${a.status === 'completed' ? 'x' : ' '}] ${a.task} (Assignee: ${a.assignee}, Due: ${a.due})`).join('\n')}

## Identified Risks & Blockers
${minutes.risksAndBlockers.map((r) => `- ${r}`).join('\n')}

## Investor Highlights
${minutes.investorHighlights.map((i) => `- ${i}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl select-none">
      {/* Drawer Top Navigation */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-violet-500/10 text-violet-400">
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">
            Gemini AI Intelligence
          </span>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('minutes')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'minutes' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Minutes & Debrief
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'copilot' ? 'bg-slate-700 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Copilot
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'transcript' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Transcript
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0e17]">
        {activeTab === 'minutes' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-medium">
                {minutes.generatedAt}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyMinutes}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Markdown' : 'Copy Minutes'}</span>
                </button>

                <button
                  onClick={handleGenerateMinutes}
                  disabled={isGenerating}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Synthesizing...' : 'Regenerate Debrief'}</span>
                </button>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Executive Summary</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {minutes.executiveSummary}
              </p>
            </div>

            {/* Technical Architecture Decisions */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Key Technical Decisions</span>
              </div>
              <ul className="space-y-2">
                {minutes.keyTechnicalDecisions.map((decision, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-300">
                    <span className="text-cyan-400 font-bold mt-0.5">•</span>
                    <span>{decision}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Priority Action Items */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Assigned Action Items & Deadlines</span>
                </div>
                <span className="text-xs text-slate-400">
                  {minutes.actionItems.filter((a) => a.status === 'completed').length} of {minutes.actionItems.length} Done
                </span>
              </div>

              <div className="space-y-2.5">
                {minutes.actionItems.map((item) => {
                  const isDone = item.status === 'completed';
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleActionItem(item.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isDone
                          ? 'bg-slate-900/30 border-slate-800/60 opacity-60'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 hover:text-slate-300 flex-shrink-0" />
                        )}
                        <span className={`text-xs sm:text-sm ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {item.task}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {item.assignee}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            item.priority === 'high'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {item.due}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risks & Investor Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Identified Risks & Blockers</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {minutes.risksAndBlockers.map((r, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Investor & Commercial Signals</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {minutes.investorHighlights.map((h, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Gemini Copilot Chat Interface */}
        {activeTab === 'copilot' && (
          <div className="h-full flex flex-col max-w-3xl mx-auto">
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
              {copilotHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'gemini' && (
                    <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-violet-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {copilotLoading && (
                <div className="flex items-center space-x-2 text-xs text-slate-400 pl-10">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                  <span>Gemini is analyzing meeting context...</span>
                </div>
              )}
            </div>

            {/* Copilot input box */}
            <form onSubmit={handleAskCopilot} className="relative pt-2">
              <input
                type="text"
                placeholder="Ask Gemini anything (e.g. 'What is our p99 latency target?', 'Explain the Python anomaly code')..."
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 pr-12 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 shadow-xl"
              />
              <button
                type="submit"
                disabled={!copilotQuery.trim() || copilotLoading}
                className="absolute right-2 top-4 p-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Continuous Live Transcript Stream */}
        {activeTab === 'transcript' && (
          <div className="space-y-3 max-w-3xl mx-auto">
            <div className="text-xs text-slate-400 flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Real-Time Multi-Speaker Audio Stream</span>
              </span>
              <span>100% Speech-to-Text Grounded</span>
            </div>

            {captions.map((cap) => (
              <div
                key={cap.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3"
              >
                <div className="text-[11px] font-mono text-slate-500 pt-0.5">
                  {cap.timestamp}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-300 mb-0.5">
                    {cap.speakerName}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({cap.speakerRole})
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {cap.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
