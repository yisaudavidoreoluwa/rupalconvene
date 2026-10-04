'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Wand2,
  Lock,
  Unlock,
  Users,
  ShieldCheck,
  Columns,
  Rows,
  ChevronDown,
  UserCheck,
  GripVertical
} from 'lucide-react';
import { CodeFile, CodeLanguage, TerminalLog, RoomPermissions, Participant } from '@/types/meeting';
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
  // Permissions & Real-time Collaboration Props
  isHost?: boolean;
  canEditCode?: boolean;
  roomPermissions?: RoomPermissions;
  onUpdatePermissions?: (permissions: RoomPermissions) => void;
  onRequestEditAccess?: () => void;
  remoteEditorStatus?: { name: string; fileId: string } | null;
  onBroadcastCodeEdit?: (fileId: string, content: string) => void;
  participants?: Participant[];
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
  isHost = true,
  canEditCode = true,
  roomPermissions,
  onUpdatePermissions,
  onRequestEditAccess,
  remoteEditorStatus,
  onBroadcastCodeEdit,
  participants = [],
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Layout states: 'side-by-side' (default), 'stacked', 'editor-only', 'preview-only'
  const [workspaceLayout, setWorkspaceLayout] = useState<'side-by-side' | 'stacked' | 'editor-only' | 'preview-only'>('side-by-side');
  const [editorWidthPct, setEditorWidthPct] = useState(50);
  const isDraggingSplitRef = useRef(false);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);

  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'terminal'>('preview');
  const [activeTerminalTab, setActiveTerminalTab] = useState<'all' | 'stdout' | 'stderr' | 'metrics'>('all');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Host Permissions Dropdown & Request Feedback
  const [showPermissionMenu, setShowPermissionMenu] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

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
  const broadcastDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Drag listeners for adjustable split pane
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplitRef.current || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const offset = e.clientX - rect.left;
      const pct = Math.min(Math.max((offset / rect.width) * 100, 20), 80);
      setEditorWidthPct(Math.round(pct));
    };

    const handleMouseUp = () => {
      if (isDraggingSplitRef.current) {
        isDraggingSplitRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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

  // Auto-switch right tab to preview if opening an HTML or Markdown file
  useEffect(() => {
    if (activeFile?.language === 'html' || activeFile?.language === 'markdown') {
      setActiveRightTab('preview');
    }
  }, [activeFile?.id, activeFile?.language]);

  // Synchronize textarea scroll with line numbers
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Support Tab key indentation inside textarea (2 spaces) & Live debounced broadcast
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!canEditCode) return;
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      if (activeFile) {
        handleCodeChange(newValue);
      }
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Debounced live code broadcast
  const handleCodeChange = (newVal: string) => {
    if (!activeFile || !canEditCode) return;
    onUpdateFileContent(activeFile.id, newVal);

    if (onBroadcastCodeEdit) {
      if (broadcastDebounceRef.current) {
        clearTimeout(broadcastDebounceRef.current);
      }
      broadcastDebounceRef.current = setTimeout(() => {
        onBroadcastCodeEdit(activeFile.id, newVal);
      }, 75); // fast 75ms debounce for smooth live collaborative editing
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
        setActiveRightTab('preview');
      } else {
        setActiveRightTab('terminal');
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
      setActiveRightTab('terminal');
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

  const handleSendRequestAccess = () => {
    if (onRequestEditAccess) {
      onRequestEditAccess();
      setRequestSent(true);
      setTimeout(() => setRequestSent(false), 4000);
    }
  };

  // Host toggles participant in allowed list
  const handleToggleParticipantEdit = (participantId: string) => {
    if (!isHost || !roomPermissions || !onUpdatePermissions) return;
    const currentList = roomPermissions.allowedEditorIds || [];
    const isAllowed = currentList.includes(participantId);
    const updated = isAllowed
      ? currentList.filter((id) => id !== participantId)
      : [...currentList, participantId];

    onUpdatePermissions({
      ...roomPermissions,
      codeEditMode: 'selected',
      allowedEditorIds: updated,
    });
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
    <div className={`w-full h-full flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] select-none transition-all duration-200 ${
      isFullscreen ? 'fixed inset-2 z-50 rounded-2xl shadow-2xl' : 'relative'
    }`}>
      {/* 1. Top Navigation & Action Toolbar */}
      <div className="h-12 bg-white px-3 flex items-center justify-between gap-2 overflow-x-auto flex-shrink-0 z-20 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)]">
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
                {onDeleteFile && !file.isEntrypoint && files.length > 1 && canEditCode && (
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
          {onAddFile && canEditCode && (
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

        {/* Center: Permissions Control / Indicator (Requirement 2) */}
        <div className="flex items-center space-x-1.5 flex-shrink-0 relative">
          {isHost ? (
            <div className="relative">
              <button
                onClick={() => setShowPermissionMenu(!showPermissionMenu)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-xs font-semibold transition-colors"
                title="Manage code edit permissions for participants"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Edit Access:</span>
                <span className="font-bold text-blue-700">
                  {roomPermissions?.codeEditMode === 'everyone'
                    ? 'Everyone'
                    : roomPermissions?.codeEditMode === 'selected'
                    ? `Selected (${roomPermissions.allowedEditorIds?.length || 0})`
                    : 'Host Only'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {/* Host Permissions Popover */}
              {showPermissionMenu && (
                <div className="absolute top-full mt-1.5 right-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 text-xs">
                  <div className="font-bold text-[#0f172a] pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span>Code Workspace Permissions</span>
                    <button 
                      onClick={() => setShowPermissionMenu(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5 py-2">
                    <button
                      onClick={() => {
                        onUpdatePermissions?.({ ...roomPermissions!, codeEditMode: 'host-only' });
                        setShowPermissionMenu(false);
                      }}
                      className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        roomPermissions?.codeEditMode === 'host-only' ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <div>
                        <div>Host Only</div>
                        <div className="text-[10px] text-slate-500 font-normal">Attendees watch in real time</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onUpdatePermissions?.({ ...roomPermissions!, codeEditMode: 'everyone' });
                        setShowPermissionMenu(false);
                      }}
                      className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        roomPermissions?.codeEditMode === 'everyone' ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div>Everyone</div>
                        <div className="text-[10px] text-slate-500 font-normal">All attendees can edit files</div>
                      </div>
                    </button>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 px-1">
                        Select Specific Attendees:
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-1">
                        {participants.length === 0 ? (
                          <div className="text-[11px] text-slate-400 italic px-1">No other attendees in room</div>
                        ) : (
                          participants.map((p) => {
                            const isAllowed = roomPermissions?.allowedEditorIds?.includes(p.id);
                            return (
                              <div
                                key={p.id}
                                onClick={() => handleToggleParticipantEdit(p.id)}
                                className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-50 cursor-pointer"
                              >
                                <span className="truncate max-w-[140px] text-slate-700">{p.name}</span>
                                <input
                                  type="checkbox"
                                  checked={!!isAllowed}
                                  onChange={() => {}}
                                  className="w-3.5 h-3.5 text-blue-600 rounded"
                                />
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {canEditCode ? (
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  <span className="hidden sm:inline">Can Edit (Host Granted)</span>
                  <span className="sm:hidden">Edit Mode</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>View Only</span>
                  </div>
                  <button
                    onClick={handleSendRequestAccess}
                    disabled={requestSent}
                    className="px-2 py-1 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {requestSent ? '✓ Requested' : 'Request Edit'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Layout Switcher, AI, Share, Copy, Run & Fullscreen (Requirement 1) */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {/* Full Width Codebase Quick Toggle */}
          <button
            onClick={() => setWorkspaceLayout(workspaceLayout === 'editor-only' ? 'side-by-side' : 'editor-only')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              workspaceLayout === 'editor-only'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 active:scale-95'
            }`}
            title={workspaceLayout === 'editor-only' ? 'Restore Split View (Editor + Preview)' : 'Expand Codebase to Full Width'}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{workspaceLayout === 'editor-only' ? 'Split View' : 'Full Width'}</span>
          </button>

          {/* Layout Mode Selector (Side-by-Side, Full Code, Stacked, Preview) */}
          <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setWorkspaceLayout('side-by-side')}
              className={`p-1 rounded text-xs transition-colors ${
                workspaceLayout === 'side-by-side' ? 'bg-white text-[#0f172a] font-bold shadow-xs' : 'text-slate-500 hover:text-[#0f172a]'
              }`}
              title="Side-by-side Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setWorkspaceLayout('editor-only')}
              className={`p-1 rounded text-xs transition-colors ${
                workspaceLayout === 'editor-only' ? 'bg-white text-[#0f172a] font-bold shadow-xs' : 'text-slate-500 hover:text-[#0f172a]'
              }`}
              title="Full Width Codebase View"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setWorkspaceLayout('stacked')}
              className={`p-1 rounded text-xs transition-colors ${
                workspaceLayout === 'stacked' ? 'bg-white text-[#0f172a] font-bold shadow-xs' : 'text-slate-500 hover:text-[#0f172a]'
              }`}
              title="Stacked Layout (Editor Top, Preview Bottom)"
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setWorkspaceLayout('preview-only')}
              className={`p-1 rounded text-xs transition-colors ${
                workspaceLayout === 'preview-only' ? 'bg-white text-[#0f172a] font-bold shadow-xs' : 'text-slate-500 hover:text-[#0f172a]'
              }`}
              title="Full Preview Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Width Presets in Side-by-Side Mode */}
          {workspaceLayout === 'side-by-side' && (
            <div className="hidden xl:flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
              <button
                onClick={() => setEditorWidthPct(50)}
                className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                  editorWidthPct === 50 ? 'bg-slate-200 text-slate-800 font-bold' : 'hover:bg-slate-100'
                }`}
                title="Reset to 50/50 Split"
              >
                50%
              </button>
              <button
                onClick={() => setEditorWidthPct(70)}
                className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                  editorWidthPct === 70 ? 'bg-slate-200 text-slate-800 font-bold' : 'hover:bg-slate-100'
                }`}
                title="Expand to 70% Code Width"
              >
                70%
              </button>
            </div>
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
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            title="Execute in isolated sandbox"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
            <span className="hidden xs:inline">{isRunning ? 'Running...' : 'Run & Preview'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Workspace Surface: Side-by-Side (Split) or Stacked Layout */}
      <div 
        ref={splitContainerRef}
        className={`flex-1 min-h-0 bg-[#0a192f] relative overflow-hidden flex ${
          workspaceLayout === 'stacked' ? 'flex-col' : 'flex-col md:flex-row'
        }`}
      >
        {/* LEFT / TOP PANE: Code Editor */}
        <div 
          style={workspaceLayout === 'side-by-side' ? { width: `${editorWidthPct}%` } : undefined}
          className={`flex flex-col min-h-0 overflow-hidden relative ${
            workspaceLayout === 'editor-only'
              ? 'w-full h-full'
              : workspaceLayout === 'preview-only'
              ? 'hidden'
              : workspaceLayout === 'stacked'
              ? 'w-full h-1/2 border-b border-[#1e293b]'
              : 'h-full'
          }`}
        >
          {/* Live Remote Editor Presence Banner (Requirement 3) */}
          {remoteEditorStatus && (
            <div className="h-6 bg-emerald-950/70 border-b border-emerald-800/50 px-3 flex items-center justify-between text-[11px] text-emerald-300 font-mono flex-shrink-0 animate-in fade-in">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>{remoteEditorStatus.name} is editing live...</span>
              </span>
              <span className="text-[10px] text-emerald-400/80">Synchronized</span>
            </div>
          )}

          {/* Editor Canvas (Line Numbers + Textarea) */}
          <div className="flex-1 relative overflow-hidden flex bg-[#0a192f] min-h-0">
            {/* Line Numbers Gutter */}
            <div 
              ref={lineNumbersRef}
              className="w-12 py-3 bg-[#071324] text-slate-600 text-xs font-mono text-right pr-3 select-none border-r border-[#1e293b] leading-6 overflow-hidden flex-shrink-0"
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
                onChange={(e) => handleCodeChange(e.target.value)}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                readOnly={!canEditCode}
                spellCheck={false}
                className={`w-full h-full p-3 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none selection:bg-blue-600/40 tab-4 ${
                  !canEditCode ? 'cursor-not-allowed opacity-90' : ''
                }`}
                placeholder="// Collaborative code editor..."
              />

              {/* Read Only Watermark when user does not have permission */}
              {!canEditCode && (
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[#0f172a]/90 backdrop-blur-md border border-slate-700 text-amber-300 text-xs flex items-center space-x-2 shadow-lg z-10 pointer-events-none">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Read Only • Controlled by Host</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DRAGGABLE RESIZER SPLITTER (Requirement: Allow codebase adjustments) */}
        {workspaceLayout === 'side-by-side' && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              isDraggingSplitRef.current = true;
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
            }}
            onDoubleClick={() => setEditorWidthPct(50)}
            title={`Drag to adjust editor width (${editorWidthPct}%) • Double-click to reset (50/50)`}
            className="hidden md:flex w-2.5 hover:w-3 bg-[#071324] hover:bg-blue-600/80 border-x border-[#1e293b] cursor-col-resize items-center justify-center transition-all z-20 group relative select-none flex-shrink-0"
          >
            <div className="w-0.5 h-8 bg-slate-600 rounded group-hover:bg-white transition-colors" />
          </div>
        )}

        {/* RIGHT / BOTTOM PANE: Live Browser Preview & Terminal Console (Requirement 1) */}
        <div 
          style={workspaceLayout === 'side-by-side' ? { width: `${100 - editorWidthPct}%` } : undefined}
          className={`flex flex-col min-h-0 bg-[#050c18] overflow-hidden ${
            workspaceLayout === 'preview-only'
              ? 'w-full h-full'
              : workspaceLayout === 'editor-only'
              ? 'hidden'
              : workspaceLayout === 'stacked'
              ? 'w-full h-1/2'
              : 'h-full'
          }`}
        >
          {/* Right Sub-Header: Live Preview vs Terminal Console Switcher */}
          <div className="h-10 bg-[#071324] border-b border-[#1e293b] px-3 flex items-center justify-between text-xs select-none flex-shrink-0">
            <div className="flex items-center space-x-1.5">
              {/* Live Preview Tab */}
              <button
                onClick={() => setActiveRightTab('preview')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeRightTab === 'preview'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>

              {/* Terminal Logs Tab */}
              <button
                onClick={() => setActiveRightTab('terminal')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeRightTab === 'terminal'
                    ? 'bg-[#1e293b] text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Terminal Console</span>
              </button>
            </div>

            {/* Controls depending on active right tab */}
            {activeRightTab === 'preview' ? (
              <div className="flex items-center space-x-2">
                {/* Viewport Device Frame Switcher */}
                <div className="flex items-center bg-[#0a192f] p-0.5 rounded-lg border border-slate-800">
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

                {/* Reload Preview Button */}
                <button
                  onClick={() => setPreviewKey((k) => k + 1)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Reload Live Preview"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
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

                <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-800">
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

          {/* Right Body: Live Iframe Canvas or Terminal Console */}
          <div className="flex-1 overflow-hidden relative bg-[#050c18] flex items-center justify-center">
            {activeRightTab === 'preview' ? (
              <div className="w-full h-full flex items-center justify-center p-2 bg-[#050c18] overflow-auto">
                <div 
                  className={`h-full bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
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
                    title="Live Hypertext Sandbox Preview"
                    sandbox="allow-scripts allow-modals"
                    className="w-full h-full border-0 bg-white"
                  />
                </div>
              </div>
            ) : (
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

        {/* 3. Gemini AI Explanation Flyout Drawer (Side overlay) */}
        {showGeminiPanel && (
          <div className="absolute top-0 right-0 w-full sm:w-96 md:w-[420px] bg-[#071324] border-l border-[#1e293b] flex flex-col h-full z-30 shadow-2xl animate-in slide-in-from-right duration-200">
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
                    <p className="text-xs font-bold text-white">Analyzing Code Architecture</p>
                    <p className="text-[11px] text-slate-400 mt-1">Google Gemini 3.5 evaluating syntax, logic, and complexity...</p>
                  </div>
                </div>
              ) : explanationText ? (
                <div className="prose prose-invert prose-xs max-w-none space-y-3">
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 text-blue-200 text-[11px]">
                    <span className="font-bold flex items-center gap-1 mb-1">
                      <Bot className="w-3.5 h-3.5 text-blue-400" />
                      Gemini Deep Learning Summary
                    </span>
                    Real-time synthesis for peer developers and technical reviewers.
                  </div>
                  <div className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed">
                    {explanationText}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center p-4">
                  <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs">Click &quot;Explain with AI&quot; above to get a complete technical breakdown.</p>
                </div>
              )}
            </div>

            {/* Follow-up question input */}
            <form onSubmit={handleAskFollowUp} className="p-3 bg-[#0a192f] border-t border-[#1e293b] flex items-center space-x-2">
              <input
                type="text"
                value={geminiQuery}
                onChange={(e) => setGeminiQuery(e.target.value)}
                placeholder="Ask Gemini about this code..."
                disabled={isExplaining || isFollowUpLoading}
                className="flex-1 bg-[#050c18] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!geminiQuery.trim() || isExplaining || isFollowUpLoading}
                className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
                title="Send follow-up question"
              >
                <Send className={`w-3.5 h-3.5 ${isFollowUpLoading ? 'animate-spin' : ''}`} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 4. Add File Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-[#0f172a]">Create New Hypertext File</h3>
            <p className="text-xs text-slate-500 mt-1">Add a new file to the isolated sandbox environment.</p>

            <form onSubmit={handleCreateFile} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. navigation.html, styles.css"
                  autoFocus
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-[#0f172a] focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Language</label>
                <select
                  value={newFileLang}
                  onChange={(e) => setNewFileLang(e.target.value as CodeLanguage)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-[#0f172a] focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="html">HTML (HyperText Markup)</option>
                  <option value="css">CSS (Cascading Styles)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="markdown">Markdown</option>
                  <option value="python">Python</option>
                  <option value="sql">SQL</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFileName.trim()}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#0f172a] hover:bg-[#1e293b] text-white disabled:opacity-50 transition-colors"
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
