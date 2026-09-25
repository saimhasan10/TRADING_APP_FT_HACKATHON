import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Bot, 
  Send, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const AIAssistantView: React.FC = () => {
  const { queryAI, currentUser, currentAccountMode } = useSimulation();

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{
      question: string;
      answer: string;
      facts: any;
      model?: string;
      timestamp: string;
    }>
  >([
    {
      question: 'Where is my BDT 3,000?',
      answer:
        'Your BDT 3,000 is not lost. It is currently locked in Reserved Balance for pending withdrawal request WD-1007 under compliance review. Under MacroBex accounting rules (Available = Ledger - Reserved), funds remain in your ledger until approved, but cannot be traded or double-withdrawn.',
      facts: {
        scenarioMatched: 'PENDING_WITHDRAWAL_WD1007',
        ledgerBalance: 25000,
        reservedBalance: 3000,
        availableBalance: 22000,
        relevantEntities: ['WD-1007', 'RES-001', 'TKT-101'],
      },
      model: 'MacroBex Deterministic Engine + Gemini 2.5',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const quickPrompts = [
    'Why is my available balance lower than my ledger balance?',
    'Where is my BDT 3,000?',
    'What happened to WD-1007?',
    'Why can’t I trade right now?',
    'What requires review in the duplicate deposit case?',
    'Reconstruct the latest incident.',
  ];

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim() || loading) return;

    setLoading(true);
    setInputQuestion('');

    try {
      const response = await queryAI(questionText.trim());
      setChatHistory((prev) => [
        ...prev,
        {
          question: questionText.trim(),
          answer: response.answer,
          facts: response.deterministicEvidence,
          model: response.isAiSynthesized ? 'Gemini 2.5 Flash' : 'Deterministic Evidence Engine',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">MacroBex AI Assistant</h1>
            <Badge variant="purple" size="sm">GROUNDED EVIDENCE ENGINE</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Grounded intelligence powered by server-side Gemini and deterministic audit logs.
          </p>
        </div>

        <div className="text-xs font-mono text-purple-300 bg-purple-950/40 border border-purple-800/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Zero Hallucination Guarantee</span>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Frequently Asked Simulation Inquiries:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleAsk(prompt)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-left flex items-center gap-1.5 disabled:opacity-50"
            >
              <ChevronRight className="w-3 h-3 text-purple-400" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="space-y-4">
        {chatHistory.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
          >
            {/* User Question */}
            <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0 text-xs font-bold">
                U
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                  <span className="font-semibold text-slate-300">{currentUser.name}</span>
                  <span className="font-mono">{item.timestamp}</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{item.question}</h3>
              </div>
            </div>

            {/* AI Assistant Answer */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 shrink-0">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                    MacroBex Intelligence
                    <Badge variant="purple" size="sm">EVIDENCE VERIFIED</Badge>
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{item.model || 'Grounded Engine'}</span>
                </div>

                {/* Answer text */}
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {item.answer}
                </div>

                {/* Expandable Facts & Reference Entities */}
                {item.facts && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ledger Audit Trace & Entity Grounding:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">Ledger Balance</span>
                        <span className="text-white font-bold">BDT {item.facts.ledgerBalance?.toLocaleString()}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">Reserved Balance</span>
                        <span className="text-amber-400 font-bold">BDT {item.facts.reservedBalance?.toLocaleString()}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">Available Balance</span>
                        <span className="text-cyan-400 font-bold">BDT {item.facts.availableBalance?.toLocaleString()}</span>
                      </div>
                    </div>

                    {item.facts.relevantEntities && item.facts.relevantEntities.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                        <span className="text-slate-500 font-medium">Cross-Referenced Entities:</span>
                        {item.facts.relevantEntities.map((ent: string) => (
                          <span
                            key={ent}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-emerald-400 font-bold"
                          >
                            {ent}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(inputQuestion);
        }}
        className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={loading}
            placeholder="Ask anything about your balances, deposits, reservations, or incident timeline..."
            className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || loading}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-950/40 transition-all shrink-0"
          >
            {loading ? (
              <span>Analyzing...</span>
            ) : (
              <>
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
