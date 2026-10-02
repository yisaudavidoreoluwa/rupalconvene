'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Terminal, 
  Sparkles, 
  Share2, 
  FileCode, 
  Copy, 
  Check, 
  Cpu, 
  Clock, 
  Database,
  Plus,
  Trash2,
  Eye,
  Code2,
  RotateCcw,
  Maximize2,
  Minimize2,
  Send,
  Smartphone,
  Tablet,
  Monitor,
  BookOpen,
  Palette,
  X,
  Bot,
  HelpCircle,
  Wand2
} from 'lucide-react';
import { CodeFile, CodeLanguage, TerminalLog } from '@/types/meeting';
import { executeCodeInSandbox, buildHypertextPreviewBundle } from '@/lib/code-runner';
import { explainCodeWithGemini } from '@/lib/gemini-service';

interface CodeWorkspaceProps {
  files: CodeFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onUpdateFileContent: (fileId: string, newContent: string) => void;
  onShareToChat: (fileName: string, code: string, language: string) => void;
  onAskAIAboutCode: (fileName: string, code: string) => void;
  onAddFile?: (newFile: CodeFile) => void;
  onDeleteFile?: (fileId: string) => void;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onUpdateFileContent,
  onShareToChat,
  onAskAIAboutCode,
  onAddFile,
  onDeleteFile,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'preview' | 'terminal'>('preview');
  const [activeTerminalTab, setActiveTerminalTab] = useState<'all' | 'stdout' | 'stderr' | 'metrics'>('all');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Gemini AI In-IDE Explanation State
  const [showGeminiPanel, setShowGeminiPanel] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationText, setExplanationText] = useState<string>('');
  const [geminiQuery, setGeminiQuery] = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [copiedExplanation, setCopiedExplanation] = useState(false);

  // Add File Dialog State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLang, setNewFileLang] = useState<CodeLanguage>('html');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);

  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      type: 'system',
      text: '[Rupal Convene Sandbox Engine v3.0 initialized. Ready for collaborative hypertext execution.]',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<{
    timeMs: number;
    memoryKb: number;
    cpu: string;
  }>({
    timeMs: 2,
    memoryKb: 14200,
    cpu: '0.4%',
  });

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Auto-switch to preview tab if opening an HTML or Markdown file
  useEffect(() => {
    if (activeFile?.language === 'html' || activeFile?.language === 'markdown') {
      setActiveBottomTab('preview');
    }
  }, [activeFile?.id, activeFile?.language]);

  // Synchronize textarea scroll with line numbers
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Support Tab key indentation inside textarea (2 spaces)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      if (activeFile) {
        onUpdateFileContent(activeFile.id, newValue);
      }
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Run Code in Sandbox
  const handleRun = async () => {
    if (!activeFile) return;
    setIsRunning(true);

    try {
      const result = await executeCodeInSandbox(activeFile.content, activeFile.language, files);
      setTerminalLogs(result.logs);
      setBenchmarkMetrics({
        timeMs: result.executionTimeMs,
        memoryKb: result.memoryEstimateKb,
        cpu: `${(Math.random() * 0.4 + 0.3).toFixed(1)}%`,
      });
      // Force iframe preview re-render
      setPreviewKey((k) => k + 1);
      if (activeFile.language === 'html' || activeFile.language === 'markdown' || activeFile.language === 'css') {
        setActiveBottomTab('preview');
      } else {
        setActiveBottomTab('terminal');
      }
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
      setActiveBottomTab('terminal');
    } finally {
      setIsRunning(false);
    }
  };

  // Trigger Gemini AI Code Explanation
  const handleExplainWithGemini = async () => {
    if (!activeFile) return;
    setShowGeminiPanel(true);
    setIsExplaining(true);
    setExplanationText('');

    // Also notify parent copilot hook
    onAskAIAboutCode(activeFile.name, activeFile.content);

    try {
      const explanation = await explainCodeWithGemini({
        code: activeFile.content,
        fileName: activeFile.name,
        language: activeFile.language,
      });
      setExplanationText(explanation);
    } catch (err) {
      console.warn('[Gemini Explainer] error:', err);
      setExplanationText('Could not generate Gemini explanation at this moment. Please check your network connection.');
    } finally {
      setIsExplaining(false);
    }
  };

  // Ask Follow-Up Question to Gemini
  const handleAskFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiQuery.trim() || !activeFile || isFollowUpLoading) return;

    const userQ = geminiQuery.trim();
    setGeminiQuery('');
    setIsFollowUpLoading(true);

    try {
      const response = await explainCodeWithGemini({
        code: activeFile.content,
        fileName: activeFile.name,
        language: activeFile.language,
        userQuestion: userQ,
      });
      setExplanationText((prev) => prev + `\n\n---\n### Q: ${userQ}\n\n${response}`);
    } catch {
      setExplanationText((prev) => prev + `\n\n---\n**Error processing follow-up question.**`);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyExplanation = () => {
    if (!explanationText) return;
    navigator.clipboard.writeText(explanationText);
    setCopiedExplanation(true);
    setTimeout(() => setCopiedExplanation(false), 2000);
  };

  // Add new file handler
  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    let cleanName = newFileName.trim();
    // Auto-append extension if missing
    if (!cleanName.includes('.')) {
      const extMap: Record<CodeLanguage, string> = {
        html: '.html',
        css: '.css',
        typescript: '.ts',
        javascript: '.js',
        markdown: '.md',
        python: '.py',
        sql: '.sql',
        json: '.json',
        xml: '.xml',
        go: '.go',
        rust: '.rs',
      };
      cleanName += extMap[newFileLang] || '.html';
    }

    const defaultContentMap: Partial<Record<CodeLanguage, string>> = {
      html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>New Component</title>\n</head>\n<body>\n  <h2>New Hypertext View</h2>\n</body>\n</html>`,
      css: `/* New Component Styles */\nbody {\n  font-family: sans-serif;\n  color: #0f172a;\n}`,
      javascript: `// Interactive Component Controller\nconsole.log('Component initialized.');`,
      typescript: `// TypeScript Module\nexport function execute() {\n  return { active: true };\n}`,
      markdown: `# Document Title\n\nWrite hypertext markdown notes here.`,
      python: `# Python Module\ndef run():\n    print("Running...")\nrun()`,
    };

    const newFile: CodeFile = {
      id: `file-${Date.now()}`,
      name: cleanName,
      language: newFileLang,
      content: defaultContentMap[newFileLang] || '// New File',
    };

    if (onAddFile) {
      onAddFile(newFile);
    }
    onSelectFile(newFile.id);
    setShowAddModal(false);
    setNewFileName('');
  };

  const getLanguageIcon = (lang: CodeLanguage) => {
    switch (lang) {
      case 'html':
        return <Code2 className="w-3.5 h-3.5 text-orange-400" />;
      case 'css':
        return <Palette className="w-3.5 h-3.5 text-sky-400" />;
      case 'markdown':
        return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
      case 'python':
        return <Terminal className="w-3.5 h-3.5 text-amber-400" />;
      case 'sql':
        return <Database className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'html':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'css':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'markdown':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'typescript':
      case 'javascript':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'python':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'sql':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-800 bg-slate-100 border-slate-200';
    }
  };

  const filteredLogs = terminalLogs.filter((log) => {
    if (activeTerminalTab === 'all') return true;
    if (activeTerminalTab === 'stdout') return log.type === 'stdout';
    if (activeTerminalTab === 'stderr') return log.type === 'stderr';
    if (activeTerminalTab === 'metrics') return log.type === 'benchmark';
    return true;
  });

  const previewBundle = buildHypertextPreviewBundle(files, activeFile);

  return (
    <div className={`w-full h-full flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs select-none transition-all duration-200 ${
      isFullscreen ? 'fixed inset-2 z-50 rounded-2xl shadow-2xl' : 'relative'
    }`}>
      {/* 1. Sleek Minimal Top Navigation Bar */}
      <div className="h-12 bg-white border-b border-slate-100 px-3 flex items-center justify-between gap-2 overflow-x-auto">
        {/* Left: Tab list with File Language Icons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 flex-1 min-w-0">
          {files.map((file) => {
            const isActive = file.id === activeFile?.id;
            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'bg-[#0f172a] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0f172a] hover:bg-slate-100'
                }`}
              >
                {getLanguageIcon(file.language)}
                <span className="truncate max-w-[120px]">{file.name}</span>
                {file.isEntrypoint && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Main Entrypoint" />
                )}
                {onDeleteFile && !file.isEntrypoint && files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 rounded transition-opacity"
                    title="Close file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add New File Button */}
          {onAddFile && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-[#0f172a] hover:bg-slate-100 transition-colors flex-shrink-0"
              title="Create new file"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New File</span>
            </button>
          )}
        </div>

        {/* Right: Actions (Explain with Gemini AI, Copy, Share, Run & Fullscreen) */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {/* Language badge */}
          {activeFile && (
            <span className={`hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${getLanguageColor(activeFile.language)}`}>
              {activeFile.language}
            </span>
          )}

          {/* Explain with Gemini AI Button */}
          <button
            onClick={handleExplainWithGemini}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
              showGeminiPanel
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 active:scale-95'
            }`}
            title="Ask Google Gemini 3.5 AI to analyze architecture, logic, and performance"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span className="hidden sm:inline">Explain with AI</span>
          </button>

          {/* Share to chat */}
          <button
            onClick={() => activeFile && onShareToChat(activeFile.name, activeFile.content, activeFile.language)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
            title="Broadcast code snippet to Meeting Chat"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            title="Execute in isolated sandbox"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
            <span>{isRunning ? 'Running...' : 'Run & Preview'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Workspace Surface: Split Editor & Runner + Optional Gemini Flyout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-[#0a192f] relative overflow-hidden">
        {/* Left Side: Code Editor & Bottom Runner */}
        <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
          {/* Editor Canvas */}
          <div className="flex-1 relative overflow-hidden flex bg-[#0a192f] min-h-[160px]">
            {/* Line Numbers Gutter */}
            <div 
              ref={lineNumbersRef}
              className="w-12 py-3 bg-[#071324] text-slate-600 text-xs font-mono text-right pr-3 select-none border-r border-[#1e293b] leading-6 overflow-hidden"
            >
              {activeFile?.content.split('\n').map((_, index) => (
                <div key={index} className="h-6">{index + 1}</div>
              ))}
            </div>

            {/* Code Textarea Surface */}
            <div className="flex-1 relative h-full">
              <textarea
                ref={textareaRef}
                value={activeFile?.content || ''}
                onChange={(e) => activeFile && onUpdateFileContent(activeFile.id, e.target.value)}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="w-full h-full p-3 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none selection:bg-blue-600/40 tab-4"
                placeholder="// Write or paste hypertext code here..."
              />
            </div>
          </div>

          {/* 3. Bottom Pane: Live Browser Preview & Terminal Console */}
          <div className="h-56 sm:h-64 bg-[#050c18] border-t border-[#1e293b] flex flex-col flex-shrink-0">
            {/* Tab Bar: Preview vs Terminal */}
            <div className="h-9 bg-[#071324] border-b border-[#1e293b] px-3 flex items-center justify-between text-xs select-none">
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Live Preview Tab */}
                <button
                  onClick={() => setActiveBottomTab('preview')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    activeBottomTab === 'preview'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>

                {/* Terminal Tab */}
                <button
                  onClick={() => setActiveBottomTab('terminal')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    activeBottomTab === 'terminal'
                      ? 'bg-[#1e293b] text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Terminal Logs</span>
                </button>
              </div>

              {/* Conditional Controls based on active bottom tab */}
              {activeBottomTab === 'preview' ? (
                <div className="flex items-center space-x-2 text-[11px]">
                  {/* Device Switcher */}
                  <div className="hidden xs:flex items-center bg-[#0a192f] p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-[#1e293b] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      title="Desktop view (100%)"
                    >
                      <Monitor className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('tablet')}
                      className={`p-1 rounded ${previewDevice === 'tablet' ? 'bg-[#1e293b] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      title="Tablet view (768px)"
                    >
                      <Tablet className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-[#1e293b] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      title="Mobile view (375px)"
                    >
                      <Smartphone className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Refresh Preview */}
                  <button
                    onClick={() => setPreviewKey((k) => k + 1)}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                    title="Reload live preview"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                  {/* Terminal filter tabs */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setActiveTerminalTab('all')}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${activeTerminalTab === 'all' ? 'bg-[#1e293b] text-white' : 'hover:text-white'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveTerminalTab('stdout')}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${activeTerminalTab === 'stdout' ? 'bg-[#1e293b] text-emerald-400' : 'hover:text-white'}`}
                    >
                      Stdout
                    </button>
                    <button
                      onClick={() => setActiveTerminalTab('stderr')}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${activeTerminalTab === 'stderr' ? 'bg-[#1e293b] text-red-400' : 'hover:text-white'}`}
                    >
                      Errors
                    </button>
                  </div>

                  {/* Metrics */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>{benchmarkMetrics.timeMs}ms</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Cpu className="w-3 h-3 text-indigo-400" />
                      <span>{benchmarkMetrics.cpu}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Content Body */}
            <div className="flex-1 overflow-hidden relative bg-[#050c18]">
              {activeBottomTab === 'preview' ? (
                /* Interactive Live Preview Iframe */
                <div className="w-full h-full flex items-center justify-center p-2 bg-[#050c18] overflow-auto">
                  <div 
                    className={`h-full bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                      previewDevice === 'mobile'
                        ? 'w-[375px]'
                        : previewDevice === 'tablet'
                        ? 'w-[768px]'
                        : 'w-full'
                    }`}
                  >
                    <iframe
                      key={previewKey}
                      srcDoc={previewBundle}
                      title="Hypertext Sandbox Preview"
                      sandbox="allow-scripts allow-modals"
                      className="w-full h-full border-0 bg-white"
                    />
                  </div>
                </div>
              ) : (
                /* Terminal Console Logs */
                <div className="w-full h-full p-3 overflow-y-auto font-mono text-xs space-y-1 bg-[#050c18]">
                  {filteredLogs.map((log) => {
                    let colorClass = 'text-slate-300';
                    if (log.type === 'stderr') colorClass = 'text-red-400 bg-red-950/20 px-1 py-0.5 rounded';
                    if (log.type === 'system') colorClass = 'text-blue-400 font-medium';
                    if (log.type === 'benchmark') colorClass = 'text-indigo-400 font-bold border-t border-slate-800 pt-1 mt-1';

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
              )}
            </div>
          </div>
        </div>

        {/* 4. Gemini AI Explanation Flyout / Side Drawer */}
        {showGeminiPanel && (
          <div className="w-full md:w-96 lg:w-[420px] bg-[#071324] border-l border-[#1e293b] flex flex-col h-full z-20 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-3.5 bg-[#0a192f] border-b border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400">
                  <Sparkles className="w-4 h-4 fill-blue-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Gemini AI Code Review</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-normal">Active</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                    Explaining {activeFile?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={handleCopyExplanation}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Copy explanation"
                >
                  {copiedExplanation ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setShowGeminiPanel(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Close AI panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Explanation Content Body */}
            <div className="flex-1 p-4 overflow-y-auto text-xs leading-relaxed space-y-3 font-sans text-slate-200">
              {isExplaining ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-3">
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute h-8 w-8 rounded-full bg-blue-400 opacity-75"></span>
                    <div className="p-2.5 bg-blue-600 rounded-full text-white shadow-lg">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white">Gemini 3.5 is analyzing logic...</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Evaluating architecture, security, and standards</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed text-slate-300 font-sans text-xs">
                    {explanationText}
                  </div>
                </div>
              )}
            </div>

            {/* Follow-up Question Input */}
            <div className="p-3 bg-[#0a192f] border-t border-[#1e293b]">
              <form onSubmit={handleAskFollowUp} className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={geminiQuery}
                  onChange={(e) => setGeminiQuery(e.target.value)}
                  placeholder="Ask Gemini about this code..."
                  disabled={isFollowUpLoading || isExplaining}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#071324] border border-[#1e293b] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!geminiQuery.trim() || isFollowUpLoading || isExplaining}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shadow-xs"
                >
                  <Send className={`w-3.5 h-3.5 ${isFollowUpLoading ? 'animate-spin' : ''}`} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 5. Add File Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#0f172a]">Create New Code File</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  File Name
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. hero-section.html, animation.css, app.js"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Hypertext / Script Language
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['html', 'css', 'javascript', 'typescript', 'markdown', 'python'] as CodeLanguage[]).map((lang) => (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => setNewFileLang(lang)}
                      className={`p-2 rounded-xl border text-center font-bold capitalize transition-all ${
                        newFileLang === lang
                          ? 'bg-[#0f172a] text-white border-[#0f172a]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFileName.trim()}
                  className="px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md"
                >
                  Create File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
