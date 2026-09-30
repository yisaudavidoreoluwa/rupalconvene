'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  HelpCircle, 
  Users, 
  Send, 
  ThumbsUp, 
  Code, 
  X, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';
import { ChatMessage, Participant } from '@/types/meeting';

interface ChatAndQAPanelProps {
  messages: ChatMessage[];
  participants: Participant[];
  currentUser: Participant;
  onSendMessage: (text: string, type: ChatMessage['type']) => void;
  onUpvoteQuestion: (messageId: string) => void;
  onClose: () => void;
}

export const ChatAndQAPanel: React.FC<ChatAndQAPanelProps> = ({
  messages,
  participants,
  currentUser,
  onSendMessage,
  onUpvoteQuestion,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'qa' | 'participants'>('chat');
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), activeTab === 'qa' ? 'qa' : 'chat');
    setInputText('');
  };

  const handleCopySnippet = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'qa') return m.type === 'qa';
    return m.type === 'chat' || m.type === 'code-share' || m.type === 'system';
  });

  return (
    <div className="w-80 sm:w-96 h-full flex flex-col bg-slate-950 border-l border-slate-800 shadow-2xl z-20 select-none">
      {/* Panel Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'chat' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'qa' ? 'bg-slate-700 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Q&A</span>
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'participants' ? 'bg-slate-700 text-violet-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>({participants.length})</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel Body */}
      {activeTab === 'participants' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            In Meeting ({participants.length})
          </div>
          {participants.map((p) => (
            <div
              key={p.id}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {p.name} {p.id === currentUser.id && '(You)'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {p.jobTitle} • {p.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-slate-400">
                {p.inGreenRoom ? (
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Green Room
                  </span>
                ) : (
                  <>
                    {p.isMuted ? (
                      <MicOff className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    {p.isVideoOff ? (
                      <VideoOff className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Video className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {filteredMessages.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-10">
                No {activeTab === 'qa' ? 'questions' : 'messages'} yet. Be the first to start the discussion!
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border ${
                    msg.type === 'qa'
                      ? 'bg-slate-900/90 border-cyan-500/30'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.type === 'qa' && (
                      <button
                        onClick={() => onUpvoteQuestion(msg.id)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{msg.upvotes || 0}</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {msg.text}
                  </p>

                  {/* Render shared code snippet if present */}
                  {msg.codeSnippet && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] relative group">
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800 text-slate-500">
                        <span>{msg.codeSnippet.language}</span>
                        <button
                          onClick={() => handleCopySnippet(msg.id, msg.codeSnippet!.code)}
                          className="hover:text-white transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-32">
                        {msg.codeSnippet.code}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder={activeTab === 'qa' ? 'Ask a priority investor/tech question...' : 'Send message to meeting...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
