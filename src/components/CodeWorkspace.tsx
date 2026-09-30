'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  Sparkles, 
  Share2, 
  RotateCcw, 
  FileCode, 
  Copy, 
  Check, 
  Cpu, 
  Clock, 
  Database,
  Plus,
  Trash2,
  Maximize2,
  ChevronDown
} from 'lucide-react';
import { CodeFile, TerminalLog } from '@/types/meeting';
import { executeCodeInSandbox } from '@/lib/code-runner';

interface CodeWorkspaceProps {
  files: CodeFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onUpdateFileContent: (fileId: string, newContent: string) => void;
  onShareToChat: (fileName: string, code: string, language: string) => void;
  onAskAIAboutCode: (fileName: string, code: string) => void;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onUpdateFileContent,
  onShareToChat,
  onAskAIAboutCode,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTerminalTab, setActiveTerminalTab] = useState<'all' | 'stdout' | 'stderr' | 'metrics'>('all');
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      type: 'system',
      text: '[TechConvene Sandbox Engine v2.4 initialized. Ready for collaborative execution.]',
      timestamp: '14:30:00',
    },
  ]);
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<{
    timeMs: number;
    memoryKb: number;
    cpu: string;
  }>({
    timeMs: 24,
    memoryKb: 14500,
    cpu: '0.8%',
  });

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleRun = async () => {
    if (!activeFile) return;
    setIsRunning(true);

    try {
      const result = await executeCodeInSandbox(activeFile.content, activeFile.language);
      setTerminalLogs(result.logs);
      setBenchmarkMetrics({
        timeMs: result.executionTimeMs,
        memoryKb: result.memoryEstimateKb,
        cpu: `${(Math.random() * 0.5 + 0.4).toFixed(1)}%`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setTerminalLogs((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: 'stderr',
          text: `Sandbox Execution Error: ${error.message || String(error)}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'typescript':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'python':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'sql':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
  };

  const filteredLogs = terminalLogs.filter((log) => {
    if (activeTerminalTab === 'all') return true;
    if (activeTerminalTab === 'stdout') return log.type === 'stdout';
    if (activeTerminalTab === 'stderr') return log.type === 'stderr';
    if (activeTerminalTab === 'metrics') return log.type === 'benchmark';
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Bar: File Tabs & Action Controls */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between select-none">
        {/* Left: Tab list */}
        <div className="flex items-center space-x-1 overflow-x-auto py-1">
          {files.map((file) => {
            const isActive = file.id === activeFile?.id;
            return (
              <button
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${
                  file.language === 'typescript' ? 'text-blue-400' :
                  file.language === 'python' ? 'text-amber-400' : 'text-emerald-400'
                }`} />
                <span>{file.name}</span>
                {file.isEntrypoint && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Main Entrypoint" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Sandbox Execution & AI Actions */}
        <div className="flex items-center space-x-2">
          {/* Language indicator badge */}
          {activeFile && (
            <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${getLanguageColor(activeFile.language)}`}>
              {activeFile.language}
            </span>
          )}

          {/* Ask AI about this code */}
          <button
            onClick={() => activeFile && onAskAIAboutCode(activeFile.name, activeFile.content)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-medium transition-colors"
            title="Ask Gemini AI to review this code for performance, security, and partner takeaways"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden md:inline">Explain with AI</span>
          </button>

          {/* Share to meeting chat */}
          <button
            onClick={() => activeFile && onShareToChat(activeFile.name, activeFile.content, activeFile.language)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Broadcast code snippet to Meeting Chat"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
            <span>{isRunning ? 'Running...' : 'Run in Sandbox'}</span>
          </button>
        </div>
      </div>

      {/* Center: Split Editor (Top) & Terminal (Bottom) */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Editor Area */}
        <div className="flex-1 relative overflow-auto flex bg-[#0c1017]">
          {/* Line Numbers Bar */}
          <div className="w-12 py-3 bg-[#090d14] text-slate-600 text-xs font-mono text-right pr-3 select-none border-r border-slate-800/80 leading-6">
            {activeFile?.content.split('\n').map((_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>

          {/* Code Textarea / Editor Surface */}
          <div className="flex-1 relative">
            <textarea
              value={activeFile?.content || ''}
              onChange={(e) => activeFile && onUpdateFileContent(activeFile.id, e.target.value)}
              spellCheck={false}
              className="w-full h-full p-3 bg-transparent text-slate-200 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none selection:bg-violet-600/40"
              placeholder="// Write or paste code here..."
            />
          </div>
        </div>

        {/* Integrated Terminal Pane */}
        <div className="h-44 sm:h-52 bg-slate-950 border-t border-slate-800 flex flex-col">
          {/* Terminal Tabs & Metrics Bar */}
          <div className="h-8 bg-slate-900/90 border-b border-slate-800 px-3 flex items-center justify-between text-xs select-none">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px] pr-2 border-r border-slate-700/60">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>TERMINAL</span>
              </div>
              <button
                onClick={() => setActiveTerminalTab('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeTerminalTab === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Logs
              </button>
              <button
                onClick={() => setActiveTerminalTab('stdout')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeTerminalTab === 'stdout' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Stdout
              </button>
              <button
                onClick={() => setActiveTerminalTab('stderr')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeTerminalTab === 'stderr' ? 'bg-slate-800 text-red-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Errors
              </button>
            </div>

            {/* Performance Benchmark Highlights */}
            <div className="hidden sm:flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{benchmarkMetrics.timeMs}ms</span>
              </div>
              <div className="flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-violet-400" />
                <span>{benchmarkMetrics.cpu} CPU</span>
              </div>
              <div className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>{(benchmarkMetrics.memoryKb / 1024).toFixed(1)}MB Heap</span>
              </div>
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 bg-[#070a0f]">
            {filteredLogs.map((log) => {
              let colorClass = 'text-slate-300';
              if (log.type === 'stderr') colorClass = 'text-red-400 bg-red-950/20 px-1 py-0.5 rounded';
              if (log.type === 'system') colorClass = 'text-cyan-400/90';
              if (log.type === 'benchmark') colorClass = 'text-violet-400 font-semibold border-t border-slate-800/80 pt-1 mt-1';

              return (
                <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
                  <span className="text-slate-600 text-[10px] select-none">{log.timestamp}</span>
                  <pre className={`whitespace-pre-wrap flex-1 break-all ${colorClass}`}>
                    {log.text}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
