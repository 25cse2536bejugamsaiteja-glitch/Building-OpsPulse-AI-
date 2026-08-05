import React, { useEffect, useRef } from 'react';
import { Terminal, Brain, Play, CheckCircle2, AlertCircle, Loader2, Sparkles, Code2 } from 'lucide-react';

export default function AgentTerminal({ logs = [], isRunning = false, runId = null, onClear }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isRunning]);

  const stepColors = {
    ANALYZE_STOCK: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    EVALUATE_SUPPLIERS: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    DRAFT_PURCHASE_ORDER: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    SIMULATE_OUTREACH: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/95 overflow-hidden shadow-2xl flex flex-col h-[520px]">
      
      {/* Terminal Window Header */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* MacOS style window control dots */}
          <div className="flex space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>

          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold font-mono tracking-wide text-slate-300">
              OpsPulse Agent Terminal
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {runId && (
            <span className="font-mono text-[11px] text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
              Run ID: <span className="text-cyan-400 font-semibold">{runId}</span>
            </span>
          )}

          {isRunning ? (
            <span className="flex items-center space-x-1.5 text-cyan-400 font-mono text-[11px] bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-md">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Agent Thinking...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[11px] bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>System Ready</span>
            </span>
          )}

          {onClear && (
            <button
              onClick={onClear}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="p-4 font-mono text-xs overflow-y-auto flex-1 space-y-3.5 bg-slate-950">
        {logs.length === 0 && !isRunning && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 py-12">
            <Brain className="w-8 h-8 text-slate-700 animate-pulse" />
            <p className="text-sm font-mono">No active agent logs. Trigger an automated reorder to view real-time reasoning.</p>
          </div>
        )}

        {logs.map((log, idx) => (
          <div key={log.id || idx} className="space-y-1.5 group border-b border-slate-900/60 pb-3 last:border-0">
            {/* Step & Action Bar */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-wider uppercase ${stepColors[log.step] || 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                  {log.step}
                </span>

                <span className="text-slate-400 font-mono">
                  [action: <span className="text-cyan-300 font-semibold">{log.action}</span>]
                </span>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                {log.status === 'COMPLETED' ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> PASS
                  </span>
                ) : log.status === 'IN_PROGRESS' ? (
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> EXECUTING
                  </span>
                ) : (
                  <span className="text-amber-400">{log.status}</span>
                )}
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Agent Thought */}
            {log.thought && (
              <div className="flex items-start space-x-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-slate-300 leading-relaxed font-sans text-[12px]">
                  <span className="text-cyan-400 font-mono font-semibold text-xs mr-1">THOUGHT:</span>
                  {log.thought}
                </div>
              </div>
            )}

            {/* Action Output Payload */}
            {log.output && (
              <div className="pl-4">
                <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-300">
                  <div className="flex items-center space-x-1 text-slate-500 mb-1 text-[10px]">
                    <Code2 className="w-3 h-3 text-amber-400" />
                    <span>Payload Data</span>
                  </div>
                  <pre className="text-cyan-300/90 whitespace-pre-wrap">
                    {typeof log.output === 'object' ? JSON.stringify(log.output, null, 2) : String(log.output)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}

        {isRunning && (
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs pt-2">
            <span className="w-2 h-4 bg-cyan-400 animate-pulse"></span>
            <span>Gemini API constructing structured operational strategy...</span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

    </div>
  );
}
