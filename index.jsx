import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Sparkles, ArrowRight, CheckCircle2,
  CircleDashed, Activity, FileText, Users,
  Eye, Paperclip, Mic, Boxes,
  AlertCircle, PenTool, Flag, FileCheck,
  ClipboardCheck, BarChart, Network, Cpu
} from 'lucide-react';

// --- Configuration & Data ---
const WORKFLOW_STAGES = [
  {
    id: 'sow-dev',
    title: 'Scope of Work Development',
    icon: FileText,
    agents: [
      'Intro & General Work',
      'Work Implementation',
      'Personnel & Qualification',
      'Acceptance Criteria',
      'Timelines & Milestones'
    ]
  },
  {
    id: 'bid-slate',
    title: 'Bid Slate Development',
    icon: Users,
    agents: [
      'Situational Analysis',
      'Vendor Evaluation',
      'Risk & Strategy',
      'Bid Slate Reviewer'
    ]
  },
  {
    id: 'tech-eval',
    title: 'Technical Evaluation Development',
    icon: ClipboardCheck,
    agents: [
      'Pre-assessment Criteria',
      'Scoring Matrix Generator'
    ]
  },
  {
    id: 'review',
    title: 'Review Scope Package',
    icon: Eye,
    agents: [
      'SOW Certifier',
      'Bid Slate Certifier',
      'Technical Evaluation Certifier'
    ]
  }
];

const ALL_AGENTS = WORKFLOW_STAGES.flatMap(s => s.agents);

const AGENT_ICONS = {
  'Intro & General Work': PenTool,
  'Work Implementation': Activity,
  'Personnel & Qualification': Users,
  'Acceptance Criteria': FileCheck,
  'Timelines & Milestones': Flag,
  'Situational Analysis': Search,
  'Vendor Evaluation': Users,
  'Risk & Strategy': AlertCircle,
  'Bid Slate Reviewer': CheckCircle2,
  'Pre-assessment Criteria': ClipboardCheck,
  'Scoring Matrix Generator': FileCheck,
  'SOW Certifier': Eye,
  'Bid Slate Certifier': CheckCircle2,
  'Technical Evaluation Certifier': BarChart
};

// --- Animations & Styles ---
const customStyles = `
  @keyframes float-slow {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    33%       { transform: translate(12px, -20px) scale(1.02); }
    66%       { transform: translate(-8px, 8px) scale(0.98); }
  }
  @keyframes float-fast {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    33%       { transform: translate(-15px, -12px) scale(1.04); }
    66%       { transform: translate(15px, 15px) scale(0.96); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.45; filter: blur(20px); }
    50%       { opacity: 0.8;  filter: blur(30px); }
  }
  @keyframes slide-up-fade {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); opacity: 0; }
    50%  { opacity: 0.15; }
    100% { transform: translateY(100%); opacity: 0; }
  }
  @keyframes node-flare-pulse {
    0%, 100% { opacity: 0.25; filter: blur(8px);  transform: scale(1); }
    50%       { opacity: 0.5;  filter: blur(14px); transform: scale(1.04); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.95); opacity: 0.8; }
    50%  { transform: scale(1.2);  opacity: 0.3; }
    100% { transform: scale(1.4);  opacity: 0; }
  }
  @keyframes radar-sweep {
    0%   { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes laser-flow {
    0%   { stroke-dashoffset: 24; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes swarm-bobbing {
    0%, 100% { transform: translateY(0px)  scale(1); }
    50%       { transform: translateY(-4px) scale(1.02); }
  }
  @keyframes emerge {
    from { transform: translateY(18px); opacity: 0; }
    to   { transform: translateY(0px);  opacity: 1; }
  }
  @keyframes ripple-out {
    0%   { transform: translate(-50%,-50%) scale(0.6); opacity: 0.9; }
    100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
  }
  @keyframes float-agent {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-3px); }
  }
  .animate-emerge     { animation: emerge 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
  .animate-ripple     { animation: ripple-out 1s ease-out forwards; }
  .animate-float-agent { animation: float-agent 3s ease-in-out infinite; }
  .animate-float-slow   { animation: float-slow 15s ease-in-out infinite; }
  .animate-float-fast   { animation: float-fast 10s ease-in-out infinite; }
  .animate-pulse-glow   { animation: pulse-glow 4s ease-in-out infinite; }
  .animate-slide-up     { animation: slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-laser-flow   { animation: laser-flow 1.2s linear infinite; }
  .animate-scanline     { animation: scanline 4s linear infinite; }
  .animate-node-flare   { animation: node-flare-pulse 3s ease-in-out infinite; }
  .animate-pulse-ring   { animation: pulse-ring 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite; }
  .animate-radar-sweep  { animation: radar-sweep 6s linear infinite; }
  .animate-swarm-node   { animation: swarm-bobbing 4s ease-in-out infinite; }

  /* 3D Card Flip */
  .perspective-1000  { perspective: 1000px; }
  .preserve-3d       { transform-style: preserve-3d; }
  .backface-hidden   { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  .rotate-y-180      { transform: rotateY(180deg); }

  /* Cosmic background */
  .bg-mesh {
    background-color: #030012;
    background-image:
      radial-gradient(at 50% 10%, hsla(250,100%,74%,0.16) 0px, transparent 60%),
      radial-gradient(at 90%  0%, hsla(189,100%,56%,0.16) 0px, transparent 65%),
      radial-gradient(at  0% 50%, hsla(333,100%,53%,0.12) 0px, transparent 60%);
  }
  .tech-grid {
    background-size: 30px 30px;
    background-image:
      linear-gradient(to right,  rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px);
  }

  ::-webkit-scrollbar       { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.4); }
`;

// --- Stable particle data (computed once, not on every render) ---
const PARTICLE_DATA = Array.from({ length: 15 }, (_, i) => ({
  size:      (((i * 7 + 3) % 5) + 2),
  colorClass: i % 3 === 0 ? 'bg-cyan-400' : i % 3 === 1 ? 'bg-indigo-400' : 'bg-pink-400',
  animClass:  i % 2 === 0 ? 'animate-float-slow' : 'animate-float-fast',
  left:      `${(i * 6.67 + 5) % 100}%`,
  top:       `${(i * 7.14 + 10) % 100}%`,
  opacity:   0.2 + (i % 5) * 0.07,
  delay:     `-${(i * 1.1) % 15}s`,
}));

const AmbientParticles = ({ active }) => (
  <div className={`fixed inset-0 pointer-events-none overflow-hidden transition-opacity duration-1000 ${active ? 'opacity-30' : 'opacity-100'}`}>
    {PARTICLE_DATA.map((p, i) => (
      <div
        key={i}
        className={`absolute rounded-full blur-[0.5px] ${p.colorClass} ${p.animClass} shadow-md shadow-current`}
        style={{
          width: `${p.size}px`, height: `${p.size}px`,
          left: p.left, top: p.top,
          opacity: p.opacity,
          animationDelay: p.delay,
        }}
      />
    ))}
  </div>
);

// --- Water emergence layout ---
// front row: above the waterline (y ~30%), larger nodes
// back row:  below the waterline (y ~68%), smaller/dimmer nodes
// x positions are evenly distributed per row
const getWaterLayout = (agents) => {
  const total = agents.length;
  if (total <= 2) {
    // single front row
    const xs = total === 1 ? [50] : [28, 72];
    return agents.map((_, i) => ({ x: xs[i], y: 32, row: 'front' }));
  }
  if (total === 3) {
    return [
      { x: 20, y: 30, row: 'front' },
      { x: 50, y: 28, row: 'front' },
      { x: 80, y: 30, row: 'front' },
    ];
  }
  if (total === 4) {
    return [
      { x: 25, y: 30, row: 'front' },
      { x: 75, y: 30, row: 'front' },
      { x: 25, y: 68, row: 'back'  },
      { x: 75, y: 68, row: 'back'  },
    ];
  }
  // 5: 3 front + 2 back
  return [
    { x: 17, y: 30, row: 'front' },
    { x: 50, y: 26, row: 'front' },
    { x: 83, y: 30, row: 'front' },
    { x: 30, y: 68, row: 'back'  },
    { x: 70, y: 68, row: 'back'  },
  ];
};

// --- Main App ---
export default function App() {
  const [appState, setAppState]           = useState('idle');
  const [query, setQuery]                 = useState('');
  const [isFocused, setIsFocused]         = useState(false);
  const [hoveredStageId, setHoveredStageId] = useState(null);
  const [targetedAgents, setTargetedAgents] = useState([]);
  const [agentStates, setAgentStates]     = useState({});

  const fetchGeminiWithRetry = async (text, retries = 5) => {
    const apiKey = "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const delays = [1000, 2000, 4000, 8000, 16000];
    const payload = {
      contents: [{ parts: [{ text }] }],
      systemInstruction: {
        parts: [{
          text: `You are a strict AI orchestrator for a procurement system.
          Analyze the user query and determine ONLY the specific agents needed based on these exact rules:
          1. If query is about "Scope of Work" or SOW: Select ONLY agents from the Scope of Work Development phase.
          2. If query is about "Bid Slate", "Vendor Evaluation", "Risk & Strategy", or "Situational Analysis": Select ONLY agents from the Bid Slate Development phase.
          3. If query is about "Technical Evaluation", "Pre-assessment Criteria", "Scoring Matrix Generator", or technical evaluation metrics: Select ONLY agents from the Technical Evaluation Development phase.
          4. If query is about "Review", "Certification", "SOW Certifier", "Bid Slate Certifier", or "Technical Evaluation Certifier": Select ONLY agents from the Review Scope Package phase.
          Available Agents: ${ALL_AGENTS.join(', ')}.
          Return ONLY a JSON object with an array of agent names under the key 'agents'.`
        }]
      },
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: { type: 'OBJECT', properties: { agents: { type: 'ARRAY', items: { type: 'STRING' } } } }
      }
    };
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        return JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text);
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(r => setTimeout(r, delays[i]));
      }
    }
  };

  const fallbackClassifier = (text) => {
    const t = text.toLowerCase();
    if (t.includes('end-to-end') || t.includes('full')) return ALL_AGENTS;
    if (t.includes('review') || t.includes('certif')) return WORKFLOW_STAGES.find(s => s.id === 'review').agents;
    if (t.includes('technical') || t.includes('score') || t.includes('assess') || t.includes('matrix')) return WORKFLOW_STAGES.find(s => s.id === 'tech-eval').agents;
    if (t.includes('bid') || t.includes('vendor') || t.includes('strategy') || t.includes('analysis')) return WORKFLOW_STAGES.find(s => s.id === 'bid-slate').agents;
    return WORKFLOW_STAGES.find(s => s.id === 'sow-dev').agents;
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setAppState('analyzing');
    setTargetedAgents([]);
    setAgentStates({});

    let targets = [];
    try {
      const response = await fetchGeminiWithRetry(query);
      const valid = (response?.agents || []).filter(a => ALL_AGENTS.includes(a));
      const t = query.toLowerCase();
      targets = (t.includes('end-to-end') || t.includes('full')) ? ALL_AGENTS
        : valid.length > 0 ? valid : fallbackClassifier(query);
    } catch {
      targets = fallbackClassifier(query);
    }

    const initialStates = {};
    targets.forEach(a => { initialStates[a] = 'idle'; });
    setTargetedAgents(targets);
    setAgentStates(initialStates);
    setAppState('executing');
  };

  useEffect(() => {
    if (appState !== 'executing' || targetedAgents.length === 0) return;
    let mounted = true;

    const run = async () => {
      const activeStages = WORKFLOW_STAGES.filter(s => s.agents.some(a => targetedAgents.includes(a)));
      for (const stage of activeStages) {
        if (!mounted) break;
        const stageAgents = stage.agents.filter(a => targetedAgents.includes(a));
        setAgentStates(prev => {
          const next = { ...prev };
          stageAgents.forEach(a => { next[a] = 'working'; });
          return next;
        });
        await Promise.all(stageAgents.map(agent => {
          const delay = Math.random() * 1500 + 1500;
          return new Promise(async resolve => {
            await new Promise(r => setTimeout(r, delay));
            if (mounted) {
              setAgentStates(prev => ({ ...prev, [agent]: 'completed' }));
            }
            resolve();
          });
        }));
        await new Promise(r => setTimeout(r, 300));
      }
      if (mounted) {
        setAppState('completed');
      }
    };

    run();
    return () => { mounted = false; };
  }, [appState, targetedAgents]);

  const resetApp = () => {
    setAppState('idle');
    setQuery('');
    setTargetedAgents([]);
    setAgentStates({});
    setHoveredStageId(null);
  };

  const activeStageIds = WORKFLOW_STAGES
    .filter(s => s.agents.some(a => targetedAgents.includes(a)))
    .map(s => s.id);

  return (
    <div className="h-screen max-h-screen bg-mesh text-slate-100 font-sans selection:bg-indigo-500/40 overflow-hidden flex flex-col relative tech-grid">
      <style>{customStyles}</style>

      {/* Neon backdrop blur */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen opacity-50" />

      {/* Scanline */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-1/2 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scanline" />
      </div>

      <AmbientParticles active={appState !== 'idle'} />

      {/* Header */}
      <header className="px-6 py-4 z-50 flex justify-between items-center bg-transparent shrink-0">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={resetApp}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/60 transition-all duration-300">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white select-none">
            Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-white font-extrabold drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">Qure</span>
          </span>
        </div>

        {appState !== 'idle' && (
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/95 border border-indigo-500/30 backdrop-blur-xl text-xs transition-all duration-500 animate-slide-up shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <div className={`w-2 h-2 rounded-full ${appState === 'completed' ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-indigo-400 shadow-[0_0_10px_#6366f1] animate-pulse'}`} />
            <span className="text-indigo-200/90 font-semibold tracking-wider uppercase text-[10px] select-none">
              {appState === 'analyzing' ? 'Classifying Intent' : appState === 'executing' ? 'Orchestrating' : 'Swarm Finished'}
            </span>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-col items-center justify-start flex-1 w-full max-w-6xl mx-auto px-6 overflow-y-auto pb-6">

        {/* Search section */}
        <div className={`w-full max-w-2xl flex flex-col items-center transition-all duration-700 ease-in-out shrink-0 ${appState === 'idle' ? 'mt-10 mb-8' : 'mt-4 mb-4 scale-90'}`}>

          <div className={`text-center space-y-2 transition-all duration-700 ${appState === 'idle' ? 'mb-6 opacity-100 h-auto' : 'mb-0 opacity-0 h-0 overflow-hidden'}`}>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white leading-tight">
              Autonomous <br />
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-500 drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                Procurement
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-md mx-auto font-light leading-relaxed">
              Describe your procurement needs. Our AI agents swarm will autonomously procure!
            </p>
          </div>

          <form
            onSubmit={handleQuerySubmit}
            className={`w-full relative z-20 transition-all duration-500 ${isFocused && appState === 'idle' ? 'scale-[1.01]' : ''}`}
          >
            <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-blue-500 rounded-2xl blur transition duration-500 ${isFocused || appState === 'analyzing' ? 'opacity-65 blur-xl' : 'opacity-15'}`} />
            <div className="relative flex items-center p-1.5 bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
              <button type="button" className={`p-2.5 ml-1 rounded-xl transition-colors duration-300 hover:bg-white/5 ${isFocused ? 'text-indigo-400' : 'text-slate-400'}`}>
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={appState !== 'idle'}
                placeholder="E.g., Write SOW chapters, evaluate vendor bids, and build scorecard parameters..."
                className="flex-1 bg-transparent border-none outline-none py-2.5 px-2 text-sm text-white placeholder-slate-500 font-medium disabled:opacity-70"
              />
              <div className="flex items-center gap-1.5 pr-1">
                {appState === 'idle' && (
                  <button type="button" className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-white/5 rounded-xl transition-colors duration-300">
                    <Mic className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!query.trim() || appState !== 'idle'}
                  className={`group relative p-3 rounded-xl border transition-all duration-300
                    ${appState === 'idle'
                      ? 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed'
                      : 'bg-indigo-500/30 border-indigo-500/50'}`}
                >
                  {appState === 'analyzing' ? <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                   : appState === 'executing' ? <CircleDashed className="w-4 h-4 text-indigo-400 animate-[spin_3s_linear_infinite]" />
                   : appState === 'completed' ? <CheckCircle2 className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]" />
                   : <Sparkles className="w-4 h-4 text-indigo-300 group-hover:text-cyan-300 transition-colors" />}
                </button>
              </div>
            </div>

            {appState === 'analyzing' && (
              <div className="absolute top-full left-0 right-0 mt-3 text-center animate-slide-up">
                <span className="inline-flex items-center gap-2 text-xs text-cyan-300 bg-cyan-950/30 px-4 py-1 rounded-full border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)] font-semibold tracking-wide">
                  <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                  AutoQure initiating agentic swarm
                </span>
              </div>
            )}
          </form>
        </div>

        {/* Pipeline — flip cards */}
        <div className={`w-full transition-all duration-1000 shrink-0 ${appState === 'idle' ? 'opacity-70' : 'opacity-100'}`}>
          <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="relative flex justify-between items-start gap-4 md:gap-6 px-2 md:px-4">

              {/* Connecting line */}
              <div className="absolute left-[12%] right-[12%] h-[1.5px] bg-slate-800/60 top-[40px] -z-10 overflow-hidden rounded-full">
                <div className={`w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-all duration-700 ${
                  appState === 'analyzing' || appState === 'executing'
                    ? 'opacity-100 shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                    : 'opacity-20'
                }`} />
              </div>

              {WORKFLOW_STAGES.map((stage, idx) => {
                const StageIcon = stage.icon;
                const isTargetedStage = activeStageIds.includes(stage.id);
                const isIdle      = appState === 'idle';
                const isAnalyzing = appState === 'analyzing';
                const isStageActive = isTargetedStage && (appState === 'executing' || appState === 'completed');
                const isStageDimmed = !isIdle && !isAnalyzing && !isStageActive;
                const isFlipped = isStageActive || hoveredStageId === stage.id;

                return (
                  <div
                    key={stage.id}
                    className={`relative w-1/4 h-[280px] perspective-1000 transition-all duration-700 ease-in-out
                      ${isStageDimmed ? 'opacity-15 scale-95 grayscale' : 'opacity-100'}
                      ${isStageActive ? 'scale-[1.02]' : ''}`}
                    onMouseEnter={() => setHoveredStageId(stage.id)}
                    onMouseLeave={() => setHoveredStageId(null)}
                  >
                    <div className={`w-full h-full preserve-3d transition-transform duration-700 ease-out ${isFlipped ? 'rotate-y-180' : ''}`}>

                      {/* FRONT */}
                      <div className={`absolute inset-0 backface-hidden flex flex-col items-center justify-center p-4 bg-slate-900/40 hover:bg-slate-900/70 border border-white/10 rounded-2xl shadow-lg transition-all duration-500 backdrop-blur-xl
                        ${isFlipped ? 'opacity-0 pointer-events-none invisible' : 'opacity-100'}`}>

                        <div className="relative mb-5">
                          <div className={`absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-pink-500 rounded-2xl transition-all duration-500 z-0
                            ${isStageActive ? 'opacity-60 blur-lg scale-110' : isIdle ? 'animate-node-flare' : 'opacity-0 blur-none'}`}
                            style={isIdle ? { animationDelay: `-${idx * 0.4}s` } : {}}
                          />
                          <div className={`w-13 h-13 rounded-2xl border backdrop-blur-xl flex items-center justify-center transition-all duration-500 relative z-10
                            ${isStageActive
                              ? 'bg-indigo-950/80 border-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                              : isIdle ? 'bg-slate-950/95 border-white/10'
                              : 'bg-slate-900/50 border-transparent shadow-md'}`}>
                            <StageIcon className={`w-6 h-6 transition-all duration-500
                              ${isStageActive ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                                : isIdle ? 'text-slate-100'
                                : 'text-slate-500'}`} />
                          </div>
                        </div>

                        <span className="text-xs font-bold text-center text-white leading-snug px-1 tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                          {stage.title}
                        </span>
                      </div>

                      {/* BACK — water emergence */}
                      <div className={`absolute inset-0 backface-hidden rotate-y-180 flex flex-col bg-slate-950 border border-indigo-500/35 rounded-2xl shadow-xl overflow-hidden transition-all duration-500
                        ${isFlipped ? 'opacity-100 z-30' : 'opacity-0 pointer-events-none invisible z-0'}`}>

                        {/* Header */}
                        <div className="relative z-20 flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-indigo-500/20 shrink-0">
                          <span className="text-[9px] font-extrabold text-cyan-300 uppercase tracking-widest flex items-center gap-1 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]">
                            <Network className="w-3 h-3 text-cyan-400 animate-pulse shrink-0" />
                            {stage.title}
                          </span>
                          {appState === 'executing' && isStageActive
                            ? <Cpu className="w-3 h-3 text-cyan-300 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
                            : <Cpu className="w-3 h-3 text-indigo-400 shrink-0" />
                          }
                        </div>

                        {/* Agent arena */}
                        <div className="relative flex-1 overflow-hidden">

                          {/* Agent nodes */}
                          {(() => {
                            const layout = getWaterLayout(stage.agents);
                            return stage.agents.map((agent, agentIdx) => {
                              const pos        = layout[agentIdx];
                              const status     = agentStates[agent] || 'idle';
                              const isWorking  = status === 'working';
                              const isComplete = status === 'completed';
                              const isActive   = isWorking || isComplete;
                              const isFront    = pos.row === 'front';
                              const AgentIcon  = AGENT_ICONS[agent] || FileText;

                              // Nodes emerge upward when active: back row rises more to break surface
                              const emergeY = isActive ? (isFront ? -8 : -18) : 0;

                              return (
                                <div
                                  key={agent}
                                  className="absolute z-20 flex flex-col items-center"
                                  style={{
                                    left: `${pos.x}%`,
                                    top:  `${pos.y}%`,
                                    transform: `translate(-50%, calc(-50% + ${emergeY}px))`,
                                    transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
                                    animationDelay: `-${agentIdx * 0.9}s`,
                                  }}
                                >
                                  {/* Ripple ring — appears when working */}
                                  {isWorking && (
                                    <div
                                      className="absolute animate-ripple rounded-full border border-purple-400/60 pointer-events-none"
                                      style={{
                                        width: isFront ? 32 : 26,
                                        height: isFront ? 32 : 26,
                                        top: '50%', left: '50%',
                                      }}
                                    />
                                  )}

                                  {/* Node icon */}
                                  <div
                                    className={`rounded-xl border flex items-center justify-center transition-all duration-500
                                      ${isFront ? 'w-8 h-8' : 'w-6 h-6'}
                                      ${isWorking  ? 'bg-indigo-500/40 border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.6)]'
                                      : isComplete ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                                      : isFront    ? 'bg-slate-900/80 border-slate-600/50'
                                      : 'bg-slate-950/80 border-slate-700/30 opacity-50'}`}
                                    style={isActive ? { animation: `float-agent ${2.5 + agentIdx * 0.3}s ease-in-out infinite` } : {}}
                                  >
                                    <AgentIcon
                                      className={`transition-all duration-300
                                        ${isFront ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'}
                                        ${isComplete ? 'text-cyan-300 drop-shadow-[0_0_6px_#22d3ee]'
                                        : isWorking  ? 'text-purple-200 animate-pulse'
                                        : isFront    ? 'text-slate-400'
                                        : 'text-slate-600'}`}
                                    />
                                  </div>

                                  {/* Label below node */}
                                  <div
                                    className={`mt-1 text-center transition-all duration-500 leading-tight
                                      ${isFront ? 'w-16' : 'w-12'}`}
                                  >
                                    <span
                                      className={`text-[7px] font-semibold break-words
                                        ${isComplete ? 'text-cyan-300'
                                        : isWorking  ? 'text-indigo-200'
                                        : isFront    ? 'text-slate-500'
                                        : 'text-slate-700'}`}
                                    >
                                      {agent}
                                    </span>
                                  </div>
                                </div>
                              );
                            });
                          })()}

                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Completion CTA */}
        {appState === 'completed' && (
          <div className="mt-6 mb-2 animate-slide-up flex flex-col items-center z-30 shrink-0">
            <button className="py-3 px-8 bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 hover:bg-cyan-950/50 hover:border-cyan-400 text-cyan-300 hover:text-white rounded-xl text-xs font-extrabold transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center justify-center gap-2 group hover:-translate-y-0.5 active:scale-95 tracking-wider uppercase">
              Review Generated Swarm Package
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
