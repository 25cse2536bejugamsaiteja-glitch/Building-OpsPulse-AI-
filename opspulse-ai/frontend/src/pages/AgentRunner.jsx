import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AgentTerminal from '../components/AgentTerminal';
import { 
  Play, Sparkles, Terminal, CheckCircle2, FileText, 
  Building2, ArrowRight, RefreshCw, AlertTriangle
} from 'lucide-react';

import { DEFAULT_DEMO_INVENTORY } from '../utils/demoData';

export default function AgentRunner() {
  const location = useLocation();
  const navigate = useNavigate();

  const [skuList, setSkuList] = useState(DEFAULT_DEMO_INVENTORY);
  const [selectedSku, setSelectedSku] = useState(location.state?.selectedSku || 'SKU-102');
  const [customTrigger, setCustomTrigger] = useState('Stock level critically low. Reorder required immediately.');
  const [isRunning, setIsRunning] = useState(false);
  const [activeRunId, setActiveRunId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [agentResult, setAgentResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch SKU list
  useEffect(() => {
    api.get('/inventory').then((res) => {
      if (res.data?.success && res.data?.items?.length > 0) {
        setSkuList(res.data.items);
        if (!selectedSku && res.data.items.length > 0) {
          setSelectedSku(res.data.items[0].sku);
        }
      }
    }).catch(err => {
      console.warn('Using default demo SKU list:', err.message);
      setSkuList(DEFAULT_DEMO_INVENTORY);
    });
  }, []);

  // Poll logs when activeRunId is set
  useEffect(() => {
    let interval;
    if (activeRunId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/agent/logs?runId=${activeRunId}`);
          if (res.data.success) {
            setLogs(res.data.logs);
            const isCompleted = res.data.logs.some(l => l.step === 'SIMULATE_OUTREACH' && l.status === 'COMPLETED');
            if (isCompleted) {
              setIsRunning(false);
            }
          }
        } catch (err) {
          console.error('Log polling error:', err);
        }
      }, 800);
    }
    return () => clearInterval(interval);
  }, [activeRunId]);

  const handleExecute = async () => {
    setError('');
    setIsRunning(true);
    setLogs([]);
    setAgentResult(null);

    try {
      const payload = {
        sku: selectedSku,
        trigger: `SKU ${selectedSku}: ${customTrigger}`
      };

      const response = await api.post('/agent/trigger', payload);

      if (response.data.success) {
        setActiveRunId(response.data.runId);
        setAgentResult(response.data);
        // Fetch logs for this run immediately
        const logRes = await api.get(`/agent/logs?runId=${response.data.runId}`);
        if (logRes.data.success) {
          setLogs(logRes.data.logs);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Execution error');
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setLogs([]);
    setActiveRunId(null);
    setAgentResult(null);
  };

  const currentItem = skuList.find(i => i.sku === selectedSku);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cyan-400" />
            <span>Autonomous Agent Console</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Trigger Gemini multi-step reorder planning, supplier evaluation matrix, and PO synthesis
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center space-x-2 transition-colors self-start"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Return to Dashboard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Operational Trigger Config</span>
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Target SKU</label>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              >
                {skuList.map((item) => (
                  <option key={item.id} value={item.sku}>
                    {item.sku} — {item.name} ({item.stock_level} units left)
                  </option>
                ))}
              </select>
            </div>

            {currentItem && (
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-200">{currentItem.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Stock:</span>
                  <span className={`font-bold ${currentItem.stock_level <= currentItem.reorder_point ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {currentItem.stock_level} / target {currentItem.target_stock}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reorder Threshold:</span>
                  <span className="text-amber-400">{currentItem.reorder_point} units</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Operational Directive / Prompt</label>
              <textarea
                rows="3"
                value={customTrigger}
                onChange={(e) => setCustomTrigger(e.target.value)}
                placeholder="Describe stock emergency or constraint..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              ></textarea>
            </div>

            <button
              onClick={handleExecute}
              disabled={isRunning}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Agent Executing Loop...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Autonomous Reorder Loop</span>
                </>
              )}
            </button>

          </div>

          {/* Generated PO Output Summary */}
          {agentResult && agentResult.po && (
            <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> PO GENERATED & DISPATCHED
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">{agentResult.po.po_number}</span>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300 border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Supplier:</span>
                  <span className="text-cyan-300 font-semibold">{agentResult.po.supplier_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Item:</span>
                  <span className="text-slate-200">{agentResult.po.item_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity:</span>
                  <span className="text-slate-200">{agentResult.po.quantity} units</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-800/60">
                  <span className="text-slate-300">Total Commitment:</span>
                  <span className="text-emerald-400">${agentResult.po.total_cost.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      await api.post('/inventory/fulfill', { sku: selectedSku });
                      navigate('/dashboard');
                    } catch (err) {
                      console.error('Fulfill error:', err);
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-90 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-emerald-900/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Receive & Replenish Stock</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Real-time Terminal Panel */}
        <div className="lg:col-span-7">
          <AgentTerminal
            logs={logs}
            isRunning={isRunning}
            runId={activeRunId}
            onClear={handleClear}
          />
        </div>

      </div>

    </div>
  );
}
