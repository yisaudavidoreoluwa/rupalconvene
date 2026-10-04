'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  HelpCircle, 
  Users, 
  Send, 
  ThumbsUp, 
  X, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
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
    <div className="w-80 sm:w-96 h-full flex flex-col bg-white shadow-[-4px_0_25px_-5px_rgba(0,0,0,0.04)] z-20 select-none">
      {/* Panel Header */}
      <div className="h-14 bg-white px-4 flex items-center justify-between shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'chat' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-slate-600 hover:text-[#0f172a]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'qa' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Q&A</span>
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'participants' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-slate-600 hover:text-[#0f172a]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>({participants.length})</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel Body */}
      {activeTab === 'participants' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            In Meeting ({participants.length})
          </div>
          {participants.map((p) => (
            <div
              key={p.id}
              className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0f172a] truncate">
                    {p.name} {p.id === currentUser.id && '(You)'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate font-medium">
                    {p.jobTitle} • {p.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-slate-500">
                {p.inGreenRoom ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                    Green Room
                  </span>
                ) : (
                  <>
                    {p.isMuted ? (
                      <MicOff className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    {p.isVideoOff ? (
                      <VideoOff className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <Video className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                      ? 'bg-blue-50 border-blue-200'
                      : msg.senderId === currentUser.id
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-white border-slate-200 shadow-sm'
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
                      <span className="text-xs font-bold text-[#0f172a]">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.type === 'qa' && (
                      <button
                        onClick={() => onUpvoteQuestion(msg.id)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-white hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-300 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{msg.upvotes || 0}</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed font-normal">
                    {msg.text}
                  </p>

                  {/* Render shared code snippet if present */}
                  {msg.codeSnippet && (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#0f172a] text-slate-200 font-mono text-[11px] relative group">
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-700 text-slate-400">
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
                      <pre className="text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-32">
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
            className="p-3 bg-white shadow-[0_-2px_12px_-3px_rgba(0,0,0,0.04)] flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder={activeTab === 'qa' ? 'Ask an investor or tech question...' : 'Send message to meeting...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-100 rounded-xl px-3 py-2 text-xs text-[#0f172a] placeholder-slate-400 focus:outline-none shadow-2xs"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
