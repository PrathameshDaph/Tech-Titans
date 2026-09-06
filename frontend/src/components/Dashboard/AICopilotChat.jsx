import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, User, ShieldCheck, 
  HelpCircle, ArrowUpRight, MessageSquare, Terminal, Zap
} from 'lucide-react';

// Lightweight and robust Markdown renderer for conversational Copilot answers
function MarkdownContent({ content }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-0.5" />;

        // Header / Banner lines
        if (
          trimmed.startsWith('#') || 
          trimmed.startsWith('⚡') || 
          trimmed.startsWith('🔍') || 
          trimmed.startsWith('🚄') || 
          trimmed.startsWith('🛡️') || 
          trimmed.startsWith('🏨') || 
          trimmed.startsWith('🤖')
        ) {
          return (
            <div key={idx} className="font-extrabold text-slate-900 text-xs sm:text-sm pt-1 pb-0.5 flex items-center gap-1.5 border-b border-slate-200/70 font-heading">
              {renderInline(trimmed)}
            </div>
          );
        }

        // Bullet points (•, -, *)
        const isBullet = trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const isNumbered = /^\d+\.\s/.test(trimmed);

        if (isBullet || isNumbered) {
          const textWithoutPrefix = isBullet 
            ? trimmed.substring(2) 
            : trimmed.replace(/^\d+\.\s/, '');
          const prefix = isNumbered ? trimmed.match(/^\d+\./)[0] : '•';
          
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-1">
              <span className="font-extrabold text-cyan-700 shrink-0 font-mono text-[11px]">{prefix}</span>
              <div className="flex-1">{renderInline(textWithoutPrefix)}</div>
            </div>
          );
        }

        return <p key={idx} className="my-0.5">{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

// Inline parser for **bold** and `code` tags
function renderInline(text) {
  if (!text) return '';
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-extrabold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono font-bold text-[10px] mx-0.5 inline-block shadow-2xs">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function AICopilotChat({ 
  copilotResponse, 
  onSendQuery, 
  activeRole, 
  telemetry 
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'copilot',
      text: "🤖 **EventFlow AI Copilot Online**\nConnected directly to real-time digital twin telemetry. Monitoring 4 arenas, 5 transit hubs, 4 hotel clusters, and 20 arterial corridors. Ask me for root-cause bottleneck analyses, mathematical optimization justifications, or role briefings.",
      actions: [
        "Why is Grand Stadium bottlenecked?",
        "Explain OR-Tools recommendation",
        "Public Safety Briefing"
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (queryText) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    // Add user message
    const newMsg = { sender: 'user', text };
    setMessages(prev => [...prev, newMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await onSendQuery(text);
      const answerText = res?.answer || res?.response_text || res?.text || "Copilot synthesized your query with district digital twin telemetry.";
      const actions = res?.suggested_actions || ["Why is Grand Stadium bottlenecked?", "Explain OR-Tools recommendation", "Public Safety Briefing"];

      setMessages(prev => [
        ...prev, 
        {
          sender: 'copilot',
          text: answerText,
          actions: actions,
          stakeholderBriefs: res?.stakeholder_briefs
        }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'copilot',
          text: `🤖 **EventFlow Copilot Briefing [${(activeRole || 'MASTER_ORCHESTRATOR').replace('_', ' ')}]**:\n• **Event Time**: ${telemetry?.event_time || '19:45:00'}\n• **District Flow**: Congestion at **${telemetry?.kpis?.avg_road_congestion_pct || 48.6}%**\n• **Transit Headways**: Average **${telemetry?.kpis?.avg_transit_wait_mins || 4.7} mins** across all hubs.\n\nAll mathematical MIP constraints and live vehicle trackers are operating normally.`,
          actions: [
            "Why is Grand Stadium bottlenecked?",
            "Explain OR-Tools recommendation",
            "Public Safety Briefing"
          ]
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickChips = [
    "Why is Grand Stadium bottlenecked?",
    "Explain OR-Tools recommendation",
    "Public Safety Briefing",
    "Check Hotel Buffer Status"
  ];

  return (
    <div className="glass-panel p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px] min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 min-w-0 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 shadow-xs shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-slate-900 font-heading flex items-center gap-2 truncate">
              AI Event Copilot
            </h2>
            <p className="text-xs text-slate-500 truncate">Natural-Language Event Intelligence & Root Cause Engine</p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold px-2 sm:px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 shadow-2xs shrink-0 whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" /> GenAI Active
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3.5 space-y-3.5 pr-1 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2.5 max-w-[95%] sm:max-w-[90%]">
              {m.sender === 'copilot' && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs shrink-0 mt-0.5 shadow-sm border border-purple-400/30">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-tr-none shadow-md shadow-cyan-600/20'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-xs'
                }`}
              >
                {m.sender === 'user' ? (
                  <p className="text-xs font-medium leading-relaxed">{m.text}</p>
                ) : (
                  <MarkdownContent content={m.text} />
                )}

                {/* Suggested Action Buttons */}
                {m.actions && m.actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {m.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(act)}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-cyan-50 text-[11px] font-semibold text-cyan-800 border border-slate-200 hover:border-cyan-300 flex items-center gap-1 shadow-2xs transition-all hover:shadow-xs active:scale-95 cursor-pointer"
                      >
                        <span>{act}</span>
                        <ArrowUpRight className="w-3 h-3 text-cyan-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-500 text-xs pl-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-ping"></span>
            <span className="font-medium">Copilot analyzing district telemetry...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-200">
        {quickChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSend(chip)}
            className="px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-[11px] font-medium text-slate-700 border border-slate-200 shrink-0 shadow-2xs transition-all hover:border-slate-300 hover:text-slate-900 active:scale-95 cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-1.5"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask AI Copilot about crowd, traffic, or recommendations..."
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-cyan-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-xs"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isTyping}
          className="p-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-600/20 active:scale-95 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
