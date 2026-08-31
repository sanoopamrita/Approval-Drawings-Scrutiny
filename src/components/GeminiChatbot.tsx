import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Paperclip,
  Camera,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Building2,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Download,
  Info,
  Maximize2,
  Minimize2,
  GripHorizontal,
  Move,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { AreaStatementData, JurisdictionType, Language } from '../types';
import { ChatMessage, sendChatMessage } from '../services/geminiService';
import { getSystemConfig, getFormattedRulesTag } from '../services/configService';

interface GeminiChatbotProps {
  language: Language;
  jurisdiction: JurisdictionType;
  projectData: AreaStatementData | null;
  mode?: 'embedded' | 'floating';
  onClose?: () => void;
}

const QUICK_DOMAINS_ML = [
  {
    id: 'kmbr',
    label: '🏛️ KMBR/KPBR',
    prompts: [
      'ചെറിയ പ്ലോട്ട് ഇളവുകൾ (Rule 60/62) പ്രകാരം സെറ്റ്ബാക്ക് എത്ര?',
      'കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിൽ എത്ര അകലം വേണം?',
      '150 ച.മീ താഴെയുള്ള വീടിന് കാർ പാർക്കിംഗ് നിർബന്ധമാണോ?',
      'മഴവെള്ള സംഭരണിയുടെ കപ്പാസിറ്റി (Rule 48) എങ്ങനെ കണക്കാക്കാം?',
    ],
  },
  {
    id: 'fire',
    label: '🚒 ഫയർ & സേഫ്റ്റി (NBC)',
    prompts: [
      'ഫയർ NOC (Fire Clearance) ഏതൊക്കെ കെട്ടിടങ്ങൾക്ക് നിർബന്ധമാണ്?',
      'ഫയർ എഞ്ചിൻ പാതയ്ക്ക് (Fire Tender Access) എത്ര വീതി വേണം?',
      'എമർജൻസി സ്റ്റെയർകേസിന്റെ അനുവദനീയമായ കുറഞ്ഞ വീതി എത്ര?',
    ],
  },
  {
    id: 'school',
    label: '🏫 KER സ്കൂൾ നിയമങ്ങൾ',
    prompts: [
      'KER പ്രകാരം ക്ലാസ്റൂമിന്റെ കുറഞ്ഞ വിസ്തീർണ്ണവും ഉയരവും എത്ര?',
      'സ്കൂളിലെ ആൺകുട്ടികൾക്കും പെൺകുട്ടികൾക്കും ആവശ്യമായ ടോയ്‌ലറ്റ് അനുപാതം എത്ര?',
      'സ്കൂൾ കെട്ടിടങ്ങളിൽ റാംപും പ്ലേഗ്രൗണ്ടും നിർബന്ധമാണോ?',
    ],
  },
  {
    id: 'crz',
    label: '🌊 CRZ & നിലം നിയമം',
    prompts: [
      'തീരദേശ മേഖലയിൽ (CRZ) നിർമ്മാണ രഹിത ദൂരപരിധി (NDZ) എത്രയാണ്?',
      'ഡാറ്റാ ബാങ്കിൽ ഉൾപ്പെട്ട ഭൂമി മാറ്റാൻ ഫോറം 5 അപേക്ഷ എങ്ങനെ നൽകണം?',
      'പുരയിടം തരംമാറ്റാൻ ഫോറം 6 പ്രകാരമുള്ള നിയമങ്ങൾ എന്തൊക്കെ?',
    ],
  },
  {
    id: 'ksmart',
    label: '💻 K-Smart & നോട്ടീസ്',
    prompts: [
      '300 ച.മീറ്റർ വരെ സെൽഫ് സർട്ടിഫിക്കേഷൻ വഴി പെർമിറ്റ് എങ്ങനെ ലഭിക്കും?',
      'കെ-സ്മാർട്ട് നിർദ്ദിഷ്ട CAD ലെയറുകൾ ഏതൊക്കെയാണ്?',
      'തദ്ദേശ സ്ഥാപനത്തിൽ നിന്ന് ലഭിച്ച ന്യൂനത നോട്ടീസിന് എങ്ങനെ മറുപടി നൽകാം?',
    ],
  },
];

const QUICK_DOMAINS_EN = [
  {
    id: 'kmbr',
    label: '🏛️ KMBR/KPBR',
    prompts: [
      'What are small plot concessions (Rule 60/62) for setbacks & coverage?',
      'Minimum clearance required between drinking well and septic tank?',
      'Is car parking required for residential houses below 150 sq.m?',
      'How to calculate Rainwater Harvesting (RWH Rule 48) capacity?',
    ],
  },
  {
    id: 'fire',
    label: '🚒 Fire & Life Safety',
    prompts: [
      'What are the mandatory Fire NOC thresholds under NBC 2016 & Kerala Fire Dept?',
      'What is the required fire tender access driveway width and clearance?',
      'Minimum emergency staircase width and travel distance rules?',
    ],
  },
  {
    id: 'school',
    label: '🏫 KER Education Rules',
    prompts: [
      'What are mandatory classroom dimensions and ceiling heights under KER?',
      'What are the required toilet and urinal ratios for schools under KER?',
      'Are ramps, accessibility tactile guides, and playground mandatory for schools?',
    ],
  },
  {
    id: 'crz',
    label: '🌊 CRZ & Wetland Act',
    prompts: [
      'What is the No Development Zone (NDZ) buffer distance under CRZ 2019?',
      'How to apply for Data Bank exclusion under Form 5 of Kerala Wetland Act?',
      'What is the procedure for Form 6 land conversion under Section 27A?',
    ],
  },
  {
    id: 'ksmart',
    label: '💻 K-Smart & Notice',
    prompts: [
      'How does instant self-certification work for dwellings <=300 sq.m?',
      'What are the mandatory K-Smart AutoCAD layer names?',
      'How to draft a statutory reply for an LSGD objection/defect notice?',
    ],
  },
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  language,
  jurisdiction,
  projectData,
  mode = 'embedded',
  onClose,
}) => {
  const isMl = language === 'ml';
  const [selectedDomain, setSelectedDomain] = useState('kmbr');
  const [analysisPreset, setAnalysisPreset] = useState<'plan' | 'notice' | 'setback'>('plan');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const welcomeText = isMl
      ? `നമസ്കാരം. ഞാൻ വിന്യാസ. എന്ത് സഹായമാണ് ഞാൻ ചെയ്തു തരേണ്ടത്?

കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ (**KMBR 2019 & KPBR 2019**), ഫയർ & ലൈഫ് സേഫ്റ്റി (**NBC 2016 Part 4**), സ്കൂൾ ചട്ടങ്ങൾ (**KER**), തീരദേശ പരിപാലന നിയമങ്ങൾ (**CRZ 2019**), നെൽവയൽ-തണ്ണീർത്തട തരംമാറ്റൽ, കെ-സ്മാർട്ട് (**K-Smart**) ഓൺലൈൻ പെർമിറ്റ്, തദ്ദേശ സ്ഥാപന ന്യൂനത നോട്ടീസ് തിരുത്തലുകൾ എന്നിവയിലെല്ലാം ഒരു സീനിയർ ഗവൺമെന്റ് ചീഫ് മുനിസിപ്പൽ എൻജിനീയറുടെയും ടൗൺ പ്ലാനിങ് ലീഗൽ കൺസൾട്ടന്റിന്റെയും അനുഭവപരിചയത്തോടെ നിങ്ങളെ സഹായിക്കാം.

📷 **കെട്ടിട പ്ലാനോ തദ്ദേശ സ്ഥാപനത്തിൽ നിന്നുള്ള ന്യൂനത നോട്ടീസോ ഉണ്ടെങ്കിൽ അറ്റാച്ച് ചെയ്ത് നൽകിയാൽ തത്സമയം വിശദമായി പരിശോധിച്ച് റിപ്പോർട്ട് നൽകാം.**`
      : `Hello! I am VINYASA. How may I help you?

I provide authoritative statutory engineering consultancy strictly grounded in **KMBR 2019 & KPBR 2019**, Fire & Life Safety (**NBC 2016 Part 4**), Kerala Education Rules (**KER Chapter IV**), Coastal Regulation Zone (**CRZ 2019**), Kerala Paddy & Wetland Act, and **K-Smart** online fast-track permitting.

📷 **Upload or capture your building plan or municipal objection notice for instant expert analysis and actionable statutory compliance advice.**`;

    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: welcomeText,
        timestamp: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(mode === 'embedded');

  // Draggable floating window states
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    active: boolean;
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0, active: false });

  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Window drag handlers for movable floating window
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'floating' || isExpanded) return;

    // Do not initiate drag if user interacted with a button, input, or control
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, a, textarea, [data-no-drag="true"]')) {
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    let currentX = 0;
    let currentY = 0;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      currentX = rect.left;
      currentY = rect.top;
    } else if (position) {
      currentX = position.x;
      currentY = position.y;
    } else {
      const defaultWidth = window.innerWidth < 640 ? window.innerWidth * 0.94 : 500;
      currentX = Math.max(16, window.innerWidth - defaultWidth - 16);
      currentY = Math.max(16, window.innerHeight - 620 - 16);
    }

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: currentX,
      initialY: currentY,
      active: true,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return;
      e.preventDefault();

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      const modalWidth = containerRef.current?.offsetWidth || 500;
      const modalHeight = containerRef.current?.offsetHeight || 620;

      const rawX = dragRef.current.initialX + deltaX;
      const rawY = dragRef.current.initialY + deltaY;

      const clampedX = Math.max(8, Math.min(window.innerWidth - modalWidth - 8, rawX));
      const clampedY = Math.max(8, Math.min(window.innerHeight - modalHeight - 8, rawY));

      setPosition({ x: clampedX, y: clampedY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.active || !e.touches[0]) return;

      const deltaX = e.touches[0].clientX - dragRef.current.startX;
      const deltaY = e.touches[0].clientY - dragRef.current.startY;

      const modalWidth = containerRef.current?.offsetWidth || 500;
      const modalHeight = containerRef.current?.offsetHeight || 620;

      const rawX = dragRef.current.initialX + deltaX;
      const rawY = dragRef.current.initialY + deltaY;

      const clampedX = Math.max(8, Math.min(window.innerWidth - modalWidth - 8, rawX));
      const clampedY = Math.max(8, Math.min(window.innerHeight - modalHeight - 8, rawY));

      setPosition({ x: clampedX, y: clampedY });
    };

    const handleDragEnd = () => {
      if (dragRef.current.active) {
        dragRef.current.active = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent && !attachedImage) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      image: attachedImage || undefined,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setAttachedImage(null);
    setLoading(true);

    try {
      const reply = await sendChatMessage(newMessages, projectData, language);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: isMl
          ? `⚠️ **ക്ഷമിക്കുക, മറുപടി നൽകുന്നതിൽ തടസ്സം നേരിട്ടു:** ${err?.message || 'സെർവർ ബന്ധപ്പെടാൻ സാധിച്ചില്ല.'}\n\nദയവായി കുറച്ചു കഴിഞ്ഞു വീണ്ടും ശ്രമിക്കുക.`
          : `⚠️ **Unable to generate response:** ${err?.message || 'Server connection error.'}\n\nPlease try again shortly.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const activeDomains = isMl ? QUICK_DOMAINS_ML : QUICK_DOMAINS_EN;
  const currentDomainData = activeDomains.find((d) => d.id === selectedDomain) || activeDomains[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1600;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setAttachedImage(compressedDataUrl);
        } else {
          setAttachedImage(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isMl ? 'ml-IN' : 'en-US';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleResetChat = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: isMl
          ? `നമസ്കാരം. ഞാൻ വിന്യാസ. എന്ത് സഹായമാണ് ഞാൻ ചെയ്തു തരേണ്ടത്?\n\nകേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ (${jurisdiction}), സെറ്റ്ബാക്ക് കണക്കുകൂട്ടലുകൾ, കെ-സ്മാർട്ട് ഓൺലൈൻ പെർമിറ്റ്, പ്ലാൻ സൂക്ഷ്മപരിശോധന എന്നിവയിലെല്ലാം നിങ്ങളുടെ സംശയങ്ങൾ ചോദിക്കാം.`
          : `Hello! I am VINYASA. How may I help you?\n\nFeel free to ask any question regarding ${jurisdiction} building rules, setback calculations, K-Smart permitting, or plan scrutiny!`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleExportChat = () => {
    const chatText = messages
      .map(
        (m) =>
          `[${new Date(m.timestamp).toLocaleTimeString()}] ${
            m.role === 'user' ? 'User' : 'KMBR/KPBR AI Assistant'
          }:\n${m.content}\n`
      )
      .join('\n---\n\n');

    const blob = new Blob([chatText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `K-BuildScrutiny-AI-Chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Dimmed backdrop for floating mode on mobile/expanded */}
      {mode === 'floating' && isExpanded && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      <div
        ref={containerRef}
        style={
          mode === 'floating' && !isExpanded && position
            ? {
                left: `${position.x}px`,
                top: `${position.y}px`,
                right: 'auto',
                bottom: 'auto',
                margin: 0,
              }
            : undefined
        }
        className={`flex flex-col bg-[#0A0D14] border border-cyan-500/30 text-slate-100 rounded-2xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(0,240,255,0.1)] transition-all ${
          mode === 'floating'
            ? isExpanded
              ? 'fixed inset-4 z-50 md:inset-x-auto md:right-6 md:bottom-6 md:top-16 md:w-[720px] md:h-[84vh]'
              : position
              ? 'fixed z-50 w-[94vw] sm:w-[500px] h-[620px] max-h-[90vh]'
              : 'fixed bottom-4 right-4 z-50 w-[94vw] sm:w-[500px] h-[620px] max-h-[90vh]'
            : 'w-full h-full min-h-[650px]'
        } ${isDragging ? 'select-none opacity-95 ring-2 ring-cyan-400 shadow-[0_20px_60px_rgba(0,240,255,0.35)]' : ''}`}
      >
        {/* Draggable Header */}
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          className={`bg-gradient-to-r from-[#070A12] via-[#0F1420] to-[#070A12] px-4 py-3.5 border-b border-cyan-500/20 flex items-center justify-between gap-2 select-none ${
            mode === 'floating' && !isExpanded
              ? isDragging
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : ''
          }`}
          title={
            mode === 'floating' && !isExpanded
              ? isMl
                ? 'വിൻഡോ ഇഷ്ടമുള്ളിടത്തേക്ക് നീക്കാൻ മുകളിൽ പിടിച്ച് വലിക്കുക'
                : 'Drag header to move window anywhere on screen'
              : undefined
          }
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-300/40 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5 font-['Outfit',sans-serif]">
                  {isMl ? 'വിന്യാസ AI ചട്ട ഉപദേശകൻ' : 'VINYASA AI Rules Advisor'}
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                    KBR 2019-2026 AI
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-cyan-400/80 truncate max-w-[180px] sm:max-w-xs">
                {isMl
                  ? `${jurisdiction} ചട്ടങ്ങൾ, സെറ്റ്ബാക്ക്, പ്ലാൻ അപാകതകൾ`
                  : `${jurisdiction} Rules, Setbacks & Defect Remediation`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Movable drag handle pill indicator in floating mode */}
            {mode === 'floating' && !isExpanded && (
              <div
                className="hidden sm:flex items-center gap-1 text-[10px] text-cyan-400/70 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md cursor-grab active:cursor-grabbing hover:text-cyan-300 transition-colors"
                title={isMl ? 'വിൻഡോ നീക്കാൻ പിടിച്ച് വലിക്കുക' : 'Drag to reposition'}
              >
                <Move className="w-3 h-3 text-cyan-400" />
                <span className="text-[9px] font-semibold">{isMl ? 'നീക്കാം' : 'Move'}</span>
              </div>
            )}

            {projectData && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                <Building2 className="w-3 h-3 text-cyan-400" />
                <span className="truncate max-w-[90px]">{projectData.projectName || 'Project'}</span>
              </span>
            )}

            <button
              id="chat-export-btn"
              onClick={handleExportChat}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="Export Consultation / സേവ് ചെയ്യുക"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              id="chat-reset-btn"
              onClick={handleResetChat}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="Reset Chat / പുനരാരംഭിക്കുക"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Expand/Minimize Control */}
            <button
              id="chat-expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors hidden sm:inline-flex cursor-pointer"
              title={isExpanded ? 'Minimize' : 'Maximize'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Prominent Close Control */}
            {onClose && (
              <button
                id="chat-close-btn"
                onClick={onClose}
                className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white px-2.5 py-1 rounded-lg border border-rose-500/40 text-xs font-bold transition-all ml-1 cursor-pointer shadow-xs"
                title={isMl ? 'ചാറ്റ് ക്ലോസ് ചെയ്യുക (Esc)' : 'Close Chat (Esc)'}
              >
                <X className="w-4 h-4" />
                <span className="text-[11px]">{isMl ? 'ക്ലോസ്' : 'Close'}</span>
              </button>
            )}
          </div>
        </div>

      {/* Project Context Badge */}
      {projectData && (
        <div className="bg-slate-950/60 px-4 py-1.5 border-b border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-emerald-400 font-medium">
              {getFormattedRulesTag(jurisdiction)}
            </span>
            <span>•</span>
            <span>Plot: {projectData.plotAreaSqM} m² ({projectData.plotAreaCents} Cents)</span>
            <span>•</span>
            <span>Road: {projectData.roadAccessWidthM}m</span>
            <span>•</span>
            <span>Height: {projectData.buildingHeightM}m</span>
          </div>
          <span className="text-[10px] text-slate-400 shrink-0">
            {isMl ? 'ലൈവ് പ്രോജക്റ്റ് വിവരങ്ങൾ സിങ്ക് ചെയ്തു' : 'Live Sync'}
          </span>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2 max-w-[88%] sm:max-w-[80%]">
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-[0_4px_15px_rgba(0,240,255,0.25)]'
                    : 'bg-[#0F1422] text-slate-100 border border-slate-800 rounded-tl-none shadow-md'
                }`}
              >
                {/* Image attached by user */}
                {msg.image && (
                  <div className="mb-2.5 rounded-lg overflow-hidden border border-slate-700 max-w-xs">
                    <img
                      src={msg.image}
                      alt="Uploaded blueprint"
                      className="w-full h-auto object-cover max-h-48"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Markdown body for assistant */}
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none text-slate-200">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                {/* Action buttons on assistant response */}
                {msg.role === 'assistant' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[10px]">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSpeak(msg.content)}
                        className="p-1 hover:text-cyan-300 transition-colors"
                        title={isSpeaking ? 'Stop Reading' : 'Read aloud'}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="p-1 hover:text-cyan-300 transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2 max-w-[80%]">
            <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#0F1422] border border-cyan-500/30 rounded-2xl rounded-tl-none px-4 py-3 text-cyan-300 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>{isMl ? 'കേരള ചട്ടങ്ങൾ പരിശോധിച്ച് മറുപടി തയ്യാറാക്കുന്നു...' : 'Analyzing Kerala Building Rules...'}</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Domain Category Selector & Quick Prompts */}
      <div className="bg-[#070A12] border-t border-slate-800/80 px-3 py-2 space-y-2">
        {/* Domain Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {activeDomains.map((dom) => (
            <button
              key={dom.id}
              onClick={() => setSelectedDomain(dom.id)}
              className={`text-[11px] font-medium shrink-0 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedDomain === dom.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.15)] font-bold'
                  : 'bg-[#0D121F] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {dom.label}
            </button>
          ))}
        </div>

        {/* Selected Domain Prompts Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-[10px] text-cyan-400/90 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            {isMl ? 'ചോദ്യങ്ങൾ:' : 'Suggested:'}
          </span>
          {currentDomainData.prompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="text-xs shrink-0 bg-[#0F1524] hover:bg-cyan-950/80 text-slate-300 hover:text-cyan-200 border border-cyan-900/40 hover:border-cyan-500/60 rounded-full px-3 py-1 transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Image Preview & Vision Analysis Action Chips if attached */}
      {attachedImage && (
        <div className="bg-[#070A12] px-3.5 py-2.5 border-t border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-lg border border-cyan-500/50 overflow-hidden shadow-xs shrink-0">
                <img
                  src={attachedImage}
                  alt="Attachment preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                  📷 {isMl ? 'ചിത്രം / നോട്ടീസ് തയ്യാറാണ്' : 'Drawing / Notice Ready for AI Scrutiny'}
                </span>
                <p className="text-[10px] text-slate-400">
                  {isMl
                    ? 'താഴെയുള്ള വിശകലന ഓപ്ഷനുകളിൽ ഒന്നിൽ ക്ലിക്ക് ചെയ്യുക:'
                    : 'Click a preset scrutiny action below or type custom query:'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
              title={isMl ? 'ഫോട്ടോ നീക്കം ചെയ്യുക' : 'Remove photo'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick vision action buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <button
              type="button"
              onClick={() =>
                handleSendMessage(
                  isMl
                    ? 'ഈ പ്ലാൻ സമഗ്രമായി പരിശോധിച്ച് KMBR/KPBR ചട്ടങ്ങൾ പ്രകാരമുള്ള കണ്ടെത്തലുകൾ, അനുവദനീയമായവ, ചട്ടലംഘനങ്ങൾ, ആവശ്യമായ തിരുത്തലുകൾ എന്നിവ നൽകുക.'
                    : 'Analyze this plan thoroughly for KMBR/KPBR compliance, list key findings, compliant items, rule violations, and specific CAD corrections needed.'
                )
              }
              disabled={loading}
              className="text-xs shrink-0 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-lg px-2.5 py-1 font-medium transition-all"
            >
              🔍 {isMl ? 'സമഗ്ര പ്ലാൻ പരിശോധന' : 'Full Plan Scrutiny'}
            </button>

            <button
              type="button"
              onClick={() =>
                handleSendMessage(
                  isMl
                    ? 'ഈ നോട്ടീസിലെ ന്യൂനതകൾ പരിശോധിച്ച് KMBR/KPBR ചട്ട നമ്പറുകൾ ഉദ്ധരിച്ച് തദ്ദേശ സ്ഥാപനത്തിന് നൽകാനുള്ള കൃത്യമായ മറുപടി കത്തും തിരുത്തൽ നിർദ്ദേശങ്ങളും തയാറാക്കുക.'
                    : 'Analyze this LSGD objection notice and draft a professional statutory reply letter citing exact KMBR/KPBR rules and required plan rectifications.'
                )
              }
              disabled={loading}
              className="text-xs shrink-0 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 rounded-lg px-2.5 py-1 font-medium transition-all"
            >
              📑 {isMl ? 'നോട്ടീസ് മറുപടി തയാറാക്കുക' : 'Draft Notice Reply'}
            </button>

            <button
              type="button"
              onClick={() =>
                handleSendMessage(
                  isMl
                    ? 'ഈ ഡ്രോയിംഗിലെ സെറ്റ്ബാക്കുകൾ (Front, Rear, Sides), കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള 7.50 മീറ്റർ അകലം (Rule 47) എന്നിവ പ്രത്യേകം പരിശോധിക്കുക.'
                    : 'Examine setbacks (Front, Rear, Sides) and well-to-septic tank 7.50m clearance (Rule 47) in this blueprint.'
                )
              }
              disabled={loading}
              className="text-xs shrink-0 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 rounded-lg px-2.5 py-1 font-medium transition-all"
            >
              📐 {isMl ? 'സെറ്റ്ബാക്ക് & കിണർ അകലം' : 'Setbacks & Well Buffer'}
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-[#070A12] p-3 border-t border-cyan-500/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <button
            type="button"
            id="chat-attach-file-btn"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-colors"
            title={isMl ? 'പ്ലാൻ ഫയൽ അറ്റാച്ച് ചെയ്യുക' : 'Attach drawing image/PDF'}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="chat-camera-btn"
            onClick={() => cameraInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-colors"
            title={isMl ? 'ക്യാമറ വഴി ഫോട്ടോ എടുക്കുക' : 'Take Blueprint Photo'}
          >
            <Camera className="w-4 h-4" />
          </button>

          <input
            type="text"
            id="chat-input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isMl
                ? 'കെട്ടിട നിർമ്മാണ ചട്ടങ്ങളെക്കുറിച്ച് എന്തും ചോദിക്കുക...'
                : 'Ask anything about KMBR/KPBR rules, setbacks, FAR, permits...'
            }
            disabled={loading}
            className="flex-1 bg-[#0F1422] border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />

          <button
            type="submit"
            id="chat-send-btn"
            disabled={(!input.trim() && !attachedImage) || loading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold p-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
    </>
  );
};
