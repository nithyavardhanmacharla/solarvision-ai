'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/language-context';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons' | 'compact';
  className?: string;
}

export function LanguageSelector({ variant = 'dropdown', className = '' }: LanguageSelectorProps) {
  const { language, setLanguage, currentLanguageInfo } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'buttons') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-5 gap-2 ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-amber-400 text-zinc-950 border-amber-300 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <div className="flex flex-col text-left truncate">
                <span className="truncate leading-tight">{lang.nativeName}</span>
                <span className={`text-[10px] truncate ${isSelected ? 'text-zinc-800 font-normal' : 'text-zinc-500'}`}>
                  {lang.name}
                </span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
        title="Select Application Language"
      >
        <Globe className="w-3.5 h-3.5 text-amber-400" />
        <span className="mr-0.5">{currentLanguageInfo.flag}</span>
        <span className="font-bold text-zinc-100">{currentLanguageInfo.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl py-2 z-[120] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
            Select Language ({SUPPORTED_LANGUAGES.length})
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-amber-400/10 text-amber-300 font-bold'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-zinc-100">{lang.nativeName}</span>
                      <span className="text-[10px] text-zinc-400">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
