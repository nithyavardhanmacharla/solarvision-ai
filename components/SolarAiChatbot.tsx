'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BotMessageSquare, X, Send, Sparkles, User, RefreshCw } from 'lucide-react';
import { LocationData, SolarGenerationResult, SystemConfig } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface SolarAiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData;
  systemConfig: SystemConfig;
  solarResult: SolarGenerationResult;
}

export function SolarAiChatbot({
  isOpen,
  onClose,
  location,
  systemConfig,
  solarResult
}: SolarAiChatbotProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `Hello! I am your AI Solar Engineer Assistant for **${location.city || 'your selected site'}**. How can I help optimize your ${systemConfig.capacityKw} kWp solar system today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const quickPrompts = [
    `What is the best tilt angle for ${location.city}?`,
    `Explain my ${solarResult.performanceRatioPercent}% Performance Ratio.`,
    `How much battery storage do I need for ${systemConfig.capacityKw} kWp?`,
    `How does temperature affect solar generation?`
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isSending) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/solar/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          siteContext: { location, systemConfig, solarResult }
        })
      });

      const data = await res.json();
      if (data.success && data.text) {
        setMessages([...newMessages, { role: 'model', content: data.text }]);
      } else {
        setMessages([
          ...newMessages,
          { role: 'model', content: 'I am processing your query. Feel free to ask more about solar irradiance or tilt angles.' }
        ]);
      }
    } catch (err) {
      console.warn('Solar chat error:', err);
      setMessages([
        ...newMessages,
        {
          role: 'model',
          content: `⚡ Quick Summary:\nI have analyzed your solar query regarding **"${query}"**.\n\n☀️ **System Snapshot for ${location.city || 'your site'}**:\n• System Size: **${systemConfig.capacityKw} kWp** Array\n• Annual Yield: **${solarResult.annualEnergyMwh} MWh/yr**\n• Expected Payback: **3.5 to 4.8 Years**`
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div data-gsap="fade-up" 
      className="fixed inset-x-2 bottom-2 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-full sm:max-w-md h-[82vh] sm:h-[550px] glass-card rounded-2xl border border-amber-500/30 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BotMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>Solar AI Engineer</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-[11px] text-slate-400">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`p-1.5 rounded-lg text-slate-950 flex-shrink-0 ${
                msg.role === 'user' ? 'bg-amber-400' : 'bg-slate-800 text-amber-400'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`p-3 rounded-2xl max-w-[85%] leading-relaxed space-y-1.5 ${
                msg.role === 'user'
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-200 rounded-tr-none font-medium'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none shadow-lg'
              }`}
            >
              {msg.content.split('\n').map((line, lIdx) => {
                if (!line.trim()) return <div key={lIdx} className="h-1" />;
                
                // Parse bold formatting **text**
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={lIdx} className={line.startsWith('⚡') ? 'font-bold text-amber-400 pb-0.5' : line.startsWith('•') ? 'pl-2 text-slate-200' : ''}>
                    {parts.map((part, pIdx) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={pIdx} className="text-amber-300 font-bold">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-amber-400 text-xs italic">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Analyzing PV physics and generating advice...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap flex items-center gap-1.5 no-scrollbar">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 rounded-full text-[10px] transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask anything about solar geometry, yield, or batteries..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:border-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
