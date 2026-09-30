'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Video } from 'lucide-react';

interface RupalChatWidgetProps {
  onStartMeeting: () => void;
}

export const RupalChatWidget: React.FC<RupalChatWidgetProps> = ({ onStartMeeting }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    {
      sender: 'bot',
      text: 'Hi there 👋 What brings you to Rupal Tech solutions today? Looking to explore Rupal Convene or host a developer-partner conference?',
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    setTimeout(() => {
      let reply = "Thanks for asking! Rupal Convene combines WebRTC video conferencing with an in-meeting code runner, architecture whiteboard, and Gemini AI notes.";
      const lower = userText.toLowerCase();
      if (lower.includes('price') || lower.includes('cost') || lower.includes('plan')) {
        reply = "Rupal Convene offers flexible plans: Starter (free up to 50 attendees), Business ($12/user/mo with AI notes), and Enterprise with dedicated sandboxes and screen-privacy watermarking.";
      } else if (lower.includes('join') || lower.includes('start') || lower.includes('meet') || lower.includes('demo')) {
        reply = "You can jump right into our live conference room now! Click 'Try Meet for work' or launch the conference suite directly.";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
      {/* Floating Greeting Bubble matching screenshots */}
      {showBubble && !isOpen && (
        <div className="mb-3 relative max-w-xs p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setShowBubble(false)}
            className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-300 hover:bg-slate-400 text-slate-700 flex items-center justify-center text-[10px]"
          >
            ✕
          </button>
          <p className="font-medium leading-relaxed pr-1">
            Hi there 👋 What brings you to Rupal Tech solutions today?
          </p>
        </div>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200 h-[440px]">
          {/* Chat Header */}
          <div className="p-4 bg-[#1a73e8] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">Rupal Solutions Assistant</div>
                <div className="text-[11px] text-blue-100 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Online • Instant replies</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs bg-slate-50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-[#1a73e8] text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick action bar */}
          <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={onStartMeeting}
              className="flex items-center space-x-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
            >
              <Video className="w-3 h-3" />
              <span>Launch Live Conference</span>
            </button>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask about Rupal Convene..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-100 rounded-full border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-full bg-[#1a73e8] text-white hover:bg-[#1557b0] disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Main Floating Blue Action Button matching screenshots */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowBubble(false);
        }}
        className="w-14 h-14 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-xl shadow-blue-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Chat with Rupal Tech Solutions"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};
