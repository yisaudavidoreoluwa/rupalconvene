'use client';

import React, { useState, useMemo } from 'react';
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
  Check,
  Search,
  Volume2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ChatMessage, Participant } from '@/types/meeting';

interface ChatAndQAPanelProps {
  messages: ChatMessage[];
  participants: Participant[];
  currentUser: Participant;
  onSendMessage: (text: string, type: ChatMessage['type']) => void;
  onUpvoteQuestion: (messageId: string) => void;
  onClose: () => void;
  onToggleScaleSimulation?: () => void;
  isScaleSimulated?: boolean;
  onMuteAll?: () => void;
  isHost?: boolean;
}

export const ChatAndQAPanel: React.FC<ChatAndQAPanelProps> = ({
  messages,
  participants,
  currentUser,
  onSendMessage,
  onUpvoteQuestion,
  onClose,
  onToggleScaleSimulation,
  isScaleSimulated = false,
  onMuteAll,
  isHost = false,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'qa' | 'participants'>('chat');
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [participantFilter, setParticipantFilter] = useState<'all' | 'speaking' | 'raised' | 'muted'>('all');

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

  // Filter participants by search query and category
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchesSearch = 
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.organization?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (participantFilter === 'speaking') return p.isSpeaking;
      if (participantFilter === 'raised') return p.handRaised;
      if (participantFilter === 'muted') return p.isMuted;
      return true;
    });
  }, [participants, searchQuery, participantFilter]);

  const speakingCount = participants.filter((p) => p.isSpeaking).length;
  const raisedCount = participants.filter((p) => p.handRaised).length;

  return (
    <div className="w-80 sm:w-96 h-full flex flex-col bg-white shadow-[-4px_0_25px_-5px_rgba(0,0,0,0.04)] z-20 select-none">
      {/* Panel Header */}
      <div className="h-14 bg-white px-4 flex items-center justify-between shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] flex-shrink-0">
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'chat' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-slate-600 hover:text-[#0f172a]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'qa' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Q&A</span>
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'participants' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-slate-600 hover:text-[#0f172a]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>({participants.length})</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-[#0f172a] hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel Body */}
      {activeTab === 'participants' ? (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
          {/* Controls & Search */}
          <div className="p-3 bg-white border-b border-slate-100 space-y-2.5 flex-shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${participants.length} participants...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto text-[11px] font-medium text-slate-600 scrollbar-none">
              <button
                onClick={() => setParticipantFilter('all')}
                className={`px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  participantFilter === 'all' ? 'bg-[#0f172a] text-white font-bold' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                All ({participants.length})
              </button>
              {speakingCount > 0 && (
                <button
                  onClick={() => setParticipantFilter('speaking')}
                  className={`px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors flex items-center space-x-1 ${
                    participantFilter === 'speaking' ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <Volume2 className="w-3 h-3 animate-pulse" />
                  <span>Speaking ({speakingCount})</span>
                </button>
              )}
              {raisedCount > 0 && (
                <button
                  onClick={() => setParticipantFilter('raised')}
                  className={`px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                    participantFilter === 'raised' ? 'bg-amber-500 text-white font-bold' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  ✋ Hands ({raisedCount})
                </button>
              )}
              <button
                onClick={() => setParticipantFilter('muted')}
                className={`px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  participantFilter === 'muted' ? 'bg-slate-700 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Muted
              </button>
            </div>

            {/* Host Actions: Mute All & Demo 30+ Scale */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              {isHost && onMuteAll && (
                <button
                  onClick={onMuteAll}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <MicOff className="w-3 h-3" />
                  <span>Mute All</span>
                </button>
              )}

              {onToggleScaleSimulation && (
                <button
                  onClick={onToggleScaleSimulation}
                  className={`ml-auto px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1 shadow-2xs ${
                    isScaleSimulated
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                  title="Simulate 30+ attendees joining and interacting"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isScaleSimulated ? 'Clear Demo Attendees' : 'Simulate 30+ Attendees'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Participant List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredParticipants.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-8">
                No participants match the filter.
              </div>
            ) : (
              filteredParticipants.map((p) => {
                const isSelf = p.id === currentUser.id;
                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      p.isSpeaking
                        ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                        : p.handRaised
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="relative flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className={`w-8 h-8 rounded-full object-cover ring-1 ${
                            p.isSpeaking ? 'ring-emerald-500 ring-2' : 'ring-slate-200'
                          }`}
                        />
                        {p.isSpeaking && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-white flex items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0f172a] truncate flex items-center space-x-1">
                          <span className="truncate">{p.name}</span>
                          {isSelf && <span className="text-slate-400 font-normal text-[10px]">(You)</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate font-medium">
                          {p.jobTitle || 'Team Member'} {p.organization ? `• ${p.organization}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-500 flex-shrink-0">
                      {p.handRaised && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded animate-bounce">
                          ✋
                        </span>
                      )}

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
                            <VideoOff className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Video className="w-3.5 h-3.5 text-blue-600" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-white hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-300 transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{msg.upvotes || 0}</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed font-normal">
                    {msg.text}
                  </p>

                  {/* Code Snippet Share */}
                  {msg.codeSnippet && (
                    <div className="mt-2.5 rounded-lg bg-[#0f172a] text-slate-200 p-2.5 text-xs font-mono relative overflow-hidden">
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700/60 text-[10px] text-slate-400">
                        <span>{msg.codeSnippet.language}</span>
                        <button
                          onClick={() => handleCopySnippet(msg.id, msg.codeSnippet!.code)}
                          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="overflow-x-auto text-[11px] leading-relaxed max-h-40">
                        <code>{msg.codeSnippet.code}</code>
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
            className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2 flex-shrink-0"
          >
            <input
              type="text"
              placeholder={activeTab === 'qa' ? 'Ask a question to the team...' : 'Type a message...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
