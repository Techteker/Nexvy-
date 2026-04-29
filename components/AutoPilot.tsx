import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Settings, 
  Database, 
  Cpu, 
  Clock, 
  PieChart, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Play, 
  History,
  TrendingUp,
  Globe,
  RefreshCw,
  Search,
  Filter,
  BarChart2,
  ListRestart
} from 'lucide-react';
import { AutoPilotConfig, AutoPilotLog, AutoPilotStats, Category, NewsItem } from '../types';
import { 
  fetchAutoPilotConfig, 
  saveAutoPilotConfig, 
  fetchAutoPilotLogs, 
  fetchAutoPilotStats, 
  addAutoPilotLog, 
  updateAutoPilotStats,
  saveNews 
} from '../services/firebase';
import { generateAutoPilotNews } from '../services/geminiService';

const DEFAULT_PROMPT = `You are a professional journalist.

Rewrite the news into simple, clear English.

Rules:
- 100–120 words
- Add a catchy headline
- Add a 'Why it matters' section
- Make content unique and engaging
- No copied sentences`;

const AutoPilot: React.FC = () => {
    const [config, setConfig] = useState<AutoPilotConfig>({
        enabled: false,
        dailyPostLimit: 100,
        frequencyMinutes: 15,
        sources: [
            { id: '1', url: 'https://news.google.com/rss', type: 'rss', active: true }
        ],
        aiPrompt: DEFAULT_PROMPT,
        categoryDistribution: {
            Trending: 40,
            Business: 20,
            Tech: 30,
            Local: 10
        },
        autoApprove: false,
        duplicateFilter: true,
        titleSimilarityCheck: true,
        scheduleSlots: { morning: true, afternoon: true, evening: true }
    });

    const [logs, setLogs] = useState<AutoPilotLog[]>([]);
    const [stats, setStats] = useState<AutoPilotStats>({
        todayPosts: 0,
        successCount: 0,
        failedCount: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
    });

    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        const unsubConfig = fetchAutoPilotConfig(setConfig);
        const unsubLogs = fetchAutoPilotLogs(setLogs);
        const unsubStats = fetchAutoPilotStats(setStats);

        return () => {
            unsubConfig();
            unsubLogs();
            unsubStats();
        };
    }, []);

    const handleSaveConfig = async (newConfig: AutoPilotConfig) => {
        setConfig(newConfig);
        await saveAutoPilotConfig(newConfig);
    };

    const handleToggleAuto = () => {
        handleSaveConfig({ ...config, enabled: !config.enabled });
        addAutoPilotLog(!config.enabled ? 'PUBLISH' : 'ERROR', `Auto Pilot mode turned ${!config.enabled ? 'ON' : 'OFF'}`);
    };

    const handleRunTest = async () => {
        if (isTesting) return;
        setIsTesting(true);
        addAutoPilotLog('FETCH', 'Starting manual test run...');
        
        try {
            // Simulation of fetching and generating
            const mockSourceText = "Major breakthrough in quantum computing announced by technology leaders today. The new 1000-qubit processor exceeds all previous benchmarks for speed and error correction.";
            
            const categoryKeys = Object.keys(config.categoryDistribution) as (keyof typeof config.categoryDistribution)[];
            const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
            
            const generated = await generateAutoPilotNews(
                mockSourceText, 
                config.aiPrompt, 
                randomCategory === 'Tech' ? Category.Technology : 
                randomCategory === 'Business' ? Category.Business : Category.General
            );

            if (generated) {
                // Save to DB
                if (config.autoApprove) {
                    await saveNews({ ...generated, status: 'published' }, 'system-autopilot');
                } else {
                    await saveNews({ ...generated, status: 'under_review' }, 'system-autopilot-review');
                }
                
                await addAutoPilotLog('PUBLISH', `Success: Generated "${generated.title}"`, `Category: ${randomCategory}`);
                await updateAutoPilotStats({ 
                    todayPosts: stats.todayPosts + 1,
                    successCount: stats.successCount + 1
                });
            } else {
                throw new Error("AI Generation returned null");
            }
        } catch (err: any) {
            await addAutoPilotLog('ERROR', 'Test run failed', err.message);
            await updateAutoPilotStats({ failedCount: stats.failedCount + 1 });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="space-y-10 group">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[40px] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                    <Zap className="absolute right-[-40px] top-[-40px] w-80 h-80 text-white/10 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                <RefreshCw className={`${config.enabled ? 'animate-spin' : ''}`} size={24} />
                            </div>
                            <div>
                                <h1 className="font-display font-black text-3xl tracking-tighter">Auto Pilot System</h1>
                                <p className="text-white/60 font-bold text-xs uppercase tracking-widest leading-none mt-1">Autonomous Content Engine</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <button 
                                onClick={handleToggleAuto}
                                className={`
                                    px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
                                    ${config.enabled 
                                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                                        : 'bg-white text-blue-700 hover:bg-blue-50'}
                                `}
                            >
                                {config.enabled ? 'Disable Auto Pilot' : 'Enable Auto Pilot'}
                            </button>
                            
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${config.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                                <span className="font-black text-xs uppercase tracking-widest">{config.enabled ? 'Status: Active' : 'Status: Dormant'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[40px] border border-gray-200 dark:border-white/5 flex flex-col justify-between group">
                    <div>
                         <div className="w-12 h-12 bg-emerald-600/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20 mb-1">Generated Today</p>
                        <h3 className="text-4xl font-black tracking-tighter dark:text-white">{stats.todayPosts}</h3>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-emerald-500">Success: {stats.successCount}</span>
                        <span className="text-red-500">Failed: {stats.failedCount}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[40px] border border-gray-200 dark:border-white/5 group">
                    <div className="w-12 h-12 bg-amber-600/10 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                        <Cpu size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20 mb-1">API Throughput</p>
                    <h3 className="text-4xl font-black tracking-tighter dark:text-white">~4.2k</h3>
                    <div className="mt-4 bg-gray-100 dark:bg-white/5 rounded-full h-1.5 w-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '45%' }}
                            className="h-full bg-amber-600" 
                        />
                    </div>
                     <p className="text-[9px] font-bold text-gray-500 mt-3">USAGE EFFICIENCY 45%</p>
                </div>
            </div>

            {/* Main Config Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Limits & Frequency */}
                <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[40px] border border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-10">
                         <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
                            <Settings size={20} />
                        </div>
                        <h3 className="font-display font-black text-xl dark:text-white">Operation Limits</h3>
                    </div>
                    
                    <div className="space-y-8">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 block mb-4 tracking-widest">Daily Post Ceiling</label>
                            <input 
                                type="number" 
                                value={config.dailyPostLimit}
                                onChange={(e) => handleSaveConfig({ ...config, dailyPostLimit: parseInt(e.target.value) || 0 })}
                                className="w-full h-14 bg-gray-50 dark:bg-white/5 rounded-2xl px-6 outline-none dark:text-white font-black text-xl tracking-tight" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 block mb-4 tracking-widest">Broadcast Frequency</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[10, 15, 30].map(freq => (
                                    <button 
                                        key={freq}
                                        onClick={() => handleSaveConfig({ ...config, frequencyMinutes: freq as any })}
                                        className={`
                                            h-12 rounded-xl text-xs font-black transition-all border
                                            ${config.frequencyMinutes === freq 
                                                ? 'bg-blue-600 border-blue-600 text-white' 
                                                : 'border-gray-200 dark:border-white/5 text-gray-400'}
                                        `}
                                    >
                                        {freq} MIN
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Sources */}
                <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[40px] border border-gray-200 dark:border-white/5 flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-fuchsia-600/10 text-fuchsia-600 rounded-xl flex items-center justify-center">
                                <Database size={20} />
                            </div>
                            <h3 className="font-display font-black text-xl dark:text-white">Ingestion Sources</h3>
                        </div>
                        <button className="text-blue-600"><Plus size={20} /></button>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto max-h-48 pr-2 hide-scrollbar">
                        {config.sources.map(source => (
                            <div key={source.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center gap-4 group">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-black">
                                    {source.type.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold dark:text-white truncate">{source.url}</p>
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</p>
                                </div>
                                <button className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                             <div className="flex items-center gap-3">
                                <Globe size={16} className="text-blue-600" />
                                <span className="text-[10px] font-black uppercase text-gray-500">API Global Fetch</span>
                             </div>
                             <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                             </div>
                        </div>
                    </div>
                </div>

                {/* Automation Logic */}
                <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[40px] border border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-10">
                         <div className="w-10 h-10 bg-amber-600/10 text-amber-600 rounded-xl flex items-center justify-center">
                            <Filter size={20} />
                        </div>
                        <h3 className="font-display font-black text-xl dark:text-white">Logic Gates</h3>
                    </div>

                    <div className="space-y-6">
                        {[
                            { id: 'autoApprove', label: 'Auto Approval', desc: 'Publish without human review', icon: CheckCircle2 },
                            { id: 'duplicateFilter', label: 'Anti-Duplicate', desc: 'Skip matching content source', icon: Filter },
                            { id: 'titleSimilarityCheck', label: 'Title Integrity', desc: 'Check for high similarity titles', icon: Search }
                        ].map(toggle => (
                            <div key={toggle.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-[24px] transition-all cursor-pointer" onClick={() => handleSaveConfig({ ...config, [toggle.id]: !(config as any)[toggle.id] })}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${(config as any)[toggle.id] ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                    <toggle.icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-black dark:text-white">{toggle.label}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">{toggle.desc}</p>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${(config as any)[toggle.id] ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                    <motion.div 
                                        animate={{ x: (config as any)[toggle.id] ? 22 : 2 }}
                                        className="absolute top-1 w-3 h-3 bg-white rounded-full" 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* AI Prompt Control */}
                <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[40px] border border-gray-200 dark:border-white/5">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-600/10 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Cpu size={20} />
                            </div>
                            <h3 className="font-display font-black text-xl dark:text-white">Neural Narrative Prompt</h3>
                        </div>
                        <button onClick={() => handleSaveConfig({ ...config, aiPrompt: DEFAULT_PROMPT })} className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                            <ListRestart size={14} /> Reset
                        </button>
                    </div>

                    <textarea 
                        value={config.aiPrompt}
                        onChange={(e) => handleSaveConfig({ ...config, aiPrompt: e.target.value })}
                        className="w-full h-80 bg-gray-50 dark:bg-white/5 rounded-3xl p-8 outline-none dark:text-white font-mono text-sm leading-relaxed border-2 border-transparent focus:border-indigo-600/20 resize-none"
                    />

                    <div className="mt-8 flex gap-4">
                         <button 
                            onClick={handleRunTest}
                            disabled={isTesting}
                            className={`
                                flex-1 flex items-center justify-center gap-3 h-16 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all
                                ${isTesting ? 'bg-gray-200 dark:bg-white/5 text-gray-400' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.02]'}
                            `}
                         >
                            {isTesting ? (
                                <>
                                    <RefreshCw className="animate-spin" size={18} /> Processing...
                                </>
                            ) : (
                                <>
                                    <Play size={18} /> Run Auto Pilot Now
                                </>
                            )}
                         </button>
                    </div>
                </div>

                {/* Category Distribution + Scheduler */}
                <div className="space-y-10">
                    <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[40px] border border-gray-200 dark:border-white/5">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 bg-fuchsia-600/10 text-fuchsia-600 rounded-xl flex items-center justify-center">
                                <PieChart size={20} />
                            </div>
                            <h3 className="font-display font-black text-xl dark:text-white">Category Distribution (%)</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            {Object.entries(config.categoryDistribution).map(([cat, val]) => (
                                <div key={cat}>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{cat}</span>
                                        <span className="text-sm font-black dark:text-white">{val}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${val}%` }}
                                            className="h-full bg-fuchsia-600" 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[40px] border border-gray-200 dark:border-white/5">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 bg-emerald-600/10 text-emerald-600 rounded-xl flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <h3 className="font-display font-black text-xl dark:text-white">Time Slot Scheduler</h3>
                        </div>

                        <div className="flex gap-4">
                             {['morning', 'afternoon', 'evening'].map(slot => (
                                 <button 
                                    key={slot}
                                    onClick={() => handleSaveConfig({ ...config, scheduleSlots: { ...config.scheduleSlots, [slot]: !(config.scheduleSlots as any)[slot] } })}
                                    className={`
                                        flex-1 py-8 rounded-3xl flex flex-col items-center justify-center gap-4 border transition-all
                                        ${(config.scheduleSlots as any)[slot] 
                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-600/20' 
                                            : 'border-gray-200 dark:border-white/5 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}
                                    `}
                                 >
                                    <div className={`p-4 rounded-2xl ${(config.scheduleSlots as any)[slot] ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/5'}`}>
                                        <Clock size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{slot}</span>
                                 </button>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Logs */}
            <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[40px] border border-gray-200 dark:border-white/5 overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
                            <History size={20} />
                        </div>
                        <h3 className="font-display font-black text-xl dark:text-white">System Signal Logs</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest leading-none">Live Monitoring</span>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-black p-8 rounded-3xl max-h-[400px] overflow-y-auto font-mono text-sm leading-relaxed hide-scrollbar border border-gray-100 dark:border-white/5">
                    {logs.map((log, i) => (
                        <div key={log.id} className="mb-4 pb-4 border-b border-gray-200 dark:border-white/5 last:border-0">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="text-[10px] text-gray-400">[{new Date(log.timestamp?.toDate ? log.timestamp.toDate() : Date.now()).toLocaleTimeString()}]</span>
                                <span className={`
                                    px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                                    ${log.action === 'FETCH' ? 'bg-blue-600 text-white' : 
                                      log.action === 'GENERATE' ? 'bg-fuchsia-600 text-white' :
                                      log.action === 'PUBLISH' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}
                                `}>
                                    {log.action}
                                </span>
                                <span className="font-bold dark:text-white/80">{log.message}</span>
                            </div>
                            {log.details && (
                                <p className="text-xs text-gray-500 dark:text-white/40 pl-24">{log.details}</p>
                            )}
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                             Establishing signal connection...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AutoPilot;
