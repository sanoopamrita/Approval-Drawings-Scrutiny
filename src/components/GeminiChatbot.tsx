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

const QUICK_PROMPTS_ML = [
  'ചെറിയ പ്ലോട്ട് ഇളവുകൾ (Rule 60/62) പ്രകാരം സെറ്റ്ബാക്ക് എത്ര?',
  'കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിൽ എത്ര അകലം വേണം?',
  '150 ച.മീ താഴെയുള്ള വീടിന് കാർ പാർക്കിംഗ് നിർബന്ധമാണോ?',
  'കെ-സ്മാർട്ട് ഓൺലൈൻ പെർമിറ്റിന് എന്തൊക്കെ ഡ്രോയിംഗുകൾ വേണം?',
  'മഴവെള്ള സംഭരണിയുടെ കപ്പാസിറ്റി എങ്ങനെ കണക്കാക്കാം?',
  'റോഡ് വീതിക്കനുസരിച്ച് അനുവദനീയമായ പരമാവധി ഉയരം എത്ര?',
  'എന്റെ പ്ലാനിലെ അപാകതകൾ എങ്ങനെ പെട്ടെന്ന് തിരുത്താം?',
];

const QUICK_PROMPTS_EN = [
  'What are small plot concessions (Rule 60/62) for setbacks & coverage?',
  'Minimum clearance required between drinking well and septic tank?',
  'Is car parking required for residential houses below 150 sq.m?',
  'What drawings & CAD layers are required for K-Smart submission?',
  'How to calculate Rainwater Harvesting (RWH) tank capacity?',
  'Maximum permissible building height based on access road width?',
  'How can I rectify setback violations on my plan for K-Smart?',
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  language,
  jurisdiction,
  projectData,
  mode = 'embedded',
  onClose,
}) => {
  const isMl = language === 'ml';
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const welcomeText = isMl
      ? `നമസ്കാരം! ഞാൻ **വിന്യാസ AI ചട്ട ഉപദേശകൻ (Vinyasa Regulatory Co-Pilot)** ആണ്.\n\nകേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ (**KMBR 2019 & KPBR 2019**) പ്രകാരമുള്ള സെറ്റ്ബാക്കുകൾ, FAR & ഗ്രൗണ്ട് കവറേജ്, കിണർ-സെപ്റ്റിക് ടാങ്ക് അകലങ്ങൾ, ചെറിയ പ്ലോട്ട് ഇളവുകൾ (Rule 60/62), റോഡ് വീതി, കെ-സ്മാർട്ട് (K-Smart) ഡിജിറ്റൽ അനുമതി എന്നിവയിലെല്ലാം കൃത്യമായ ചട്ട നമ്പറുകളോടെ (Rule, Chapter & Table) നിങ്ങളെ സഹായിക്കാം.\n\nതാഴെയുള്ള ചോദ്യങ്ങളിൽ ക്ലിക്ക് ചെയ്യുകയോ അല്ലെങ്കിൽ നിങ്ങളുടെ പ്ലാൻ ഫോട്ടോ/ചോദ്യം അയക്കുകയോ ചെയ്യാം.`
      : `Welcome! I am **വിന്യാസ AI ചട്ട ഉപദേശകൻ (Vinyasa Regulatory Co-Pilot)**.\n\nI provide authoritative compliance guidance strictly grounded in **KMBR 2019 & KPBR 2019** (citing exact Chapters, Rules, and Tables). I can calculate setbacks, verify FAR & ground coverage, check well-to-septic clearances, assess small plot concessions (Rule 60/62), and review K-Smart CAD layers.\n\nAsk any question or upload a plan photo to begin!`;

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

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
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
          ? `സംഭാഷണം പുനരാരംഭിച്ചു. കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ (${jurisdiction}) സംബന്ധിച്ച നിങ്ങളുടെ സംശയങ്ങൾ ചോദിക്കാം.`
          : `Conversation reset. Feel free to ask any question regarding ${jurisdiction} building rules, setback calculations, or plan scrutiny!`,
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

  const activeQuickPrompts = isMl ? QUICK_PROMPTS_ML : QUICK_PROMPTS_EN;

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
        className={`flex flex-col bg-[#0A0D14] border border-cyan-500/30 text-slate-100 rounded-2xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(0,240,255,0.1)] transition-all ${
          mode === 'floating'
            ? isExpanded
              ? 'fixed inset-4 z-50 md:inset-x-auto md:right-6 md:bottom-6 md:top-16 md:w-[720px] md:h-[84vh]'
              : 'fixed bottom-4 right-4 z-50 w-[94vw] sm:w-[500px] h-[620px] max-h-[90vh]'
            : 'w-full h-full min-h-[650px]'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#070A12] via-[#0F1420] to-[#070A12] px-4 py-3.5 border-b border-cyan-500/20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-300/40 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]">
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
              <p className="text-[11px] text-cyan-400/80 truncate max-w-[200px] sm:max-w-xs">
                {isMl
                  ? `${jurisdiction} ചട്ടങ്ങൾ, സെറ്റ്ബാക്ക്, പ്ലാൻ അപാകതകൾ`
                  : `${jurisdiction} Rules, Setbacks & Defect Remediation`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {projectData && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                <Building2 className="w-3 h-3 text-cyan-400" />
                <span className="truncate max-w-[90px]">{projectData.projectName || 'Project'}</span>
              </span>
            )}

            <button
              id="chat-export-btn"
              onClick={handleExportChat}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
              title="Export Consultation / സേവ് ചെയ്യുക"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              id="chat-reset-btn"
              onClick={handleResetChat}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
              title="Reset Chat / പുനരാരംഭിക്കുക"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Expand/Minimize Control */}
            <button
              id="chat-expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors hidden sm:inline-flex"
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

      {/* Quick Prompts Carousel */}
      <div className="bg-[#070A12] border-t border-slate-800/80 px-3 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] text-cyan-400 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {isMl ? 'പ്രധാന സംശയങ്ങൾ:' : 'Quick Questions:'}
          </span>
          {activeQuickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="text-xs shrink-0 bg-[#0F1524] hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-cyan-800/40 hover:border-cyan-500/60 rounded-full px-3 py-1 transition-all whitespace-nowrap disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Image Preview if attached */}
      {attachedImage && (
        <div className="bg-[#070A12] px-4 py-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded border border-slate-700 overflow-hidden">
              <img
                src={attachedImage}
                alt="Attachment preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xs text-slate-300">
              {isMl ? 'പ്ലാൻ ഫോട്ടോ ചേർത്തു' : 'Drawing photo attached'}
            </span>
          </div>
          <button
            onClick={() => setAttachedImage(null)}
            className="text-slate-400 hover:text-rose-400 p-1"
          >
            <X className="w-4 h-4" />
          </button>
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
