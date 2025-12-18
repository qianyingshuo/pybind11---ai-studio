
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Terminal, ArrowRight, Clock, Zap, Cpu, AlertTriangle } from 'lucide-react';

// Declaration for global Prism object
declare global {
    interface Window {
        Prism: any;
    }
}

// --- MEMORY POOL VISUALIZER ---
// Visualizes a "Free List" where allocation is popping from head, deallocation is pushing to head
export const MemoryPoolVisualizer: React.FC = () => {
  const [blocks, setBlocks] = useState([true, true, true, true, false, false]); // true = free, false = used
  const [pointerIndex, setPointerIndex] = useState(0); // Index of the next free block
  const [action, setAction] = useState<"IDLE" | "ALLOC" | "FREE">("IDLE");

  // Simple simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
        // Find next free
        const freeIdx = blocks.findIndex(b => b === true);
        const usedIdx = blocks.findIndex(b => b === false);

        if (Math.random() > 0.4 && freeIdx !== -1) {
             // Allocate
             setAction("ALLOC");
             setPointerIndex(freeIdx);
             setTimeout(() => {
                 setBlocks(prev => {
                     const next = [...prev];
                     next[freeIdx] = false;
                     return next;
                 });
             }, 500);
        } else if (usedIdx !== -1) {
            // Free
            setAction("FREE");
            // Pick a random used block to free
            const usedIndices = blocks.map((b, i) => !b ? i : -1).filter(i => i !== -1);
            const toFree = usedIndices[Math.floor(Math.random() * usedIndices.length)];
            setPointerIndex(toFree);
            setTimeout(() => {
                 setBlocks(prev => {
                     const next = [...prev];
                     next[toFree] = true;
                     return next;
                 });
             }, 500);
        }
    }, 2000);
    return () => clearInterval(interval);
  }, [blocks]);

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 my-8">
      <div className="flex justify-between w-full items-center mb-6">
          <h3 className="font-serif text-xl text-slate-800">Free List 运作机制</h3>
          <div className="text-xs font-mono px-2 py-1 bg-slate-100 rounded text-slate-500">
             Status: {action === "ALLOC" ? "Allocating (Pop)" : action === "FREE" ? "Deallocating (Push)" : "Idle"}
          </div>
      </div>
      
      <div className="flex gap-4 items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 w-full overflow-hidden relative min-h-[120px]">
         {blocks.map((isFree, i) => (
             <motion.div 
                key={i}
                layout
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-sm shadow-sm relative
                    ${isFree ? 'bg-white border-emerald-500 text-emerald-600' : 'bg-slate-800 border-slate-800 text-slate-400'}
                `}
             >
                {isFree ? "FREE" : "USED"}
                {/* Pointer visualization */}
                {isFree && i === blocks.findIndex(b => b) && (
                    <motion.div 
                        layoutId="head-pointer"
                        className="absolute -top-6 text-[10px] text-emerald-600 font-bold uppercase tracking-widest"
                    >
                        Head
                        <div className="w-0.5 h-2 bg-emerald-500 mx-auto mt-0.5"></div>
                    </motion.div>
                )}
             </motion.div>
         ))}
      </div>
      
      <div className="flex gap-8 mt-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-emerald-500 rounded bg-white"></div> 
              <span>空闲块 (Available)</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-800 rounded"></div> 
              <span>已用块 (Occupied)</span>
          </div>
      </div>
      <p className="mt-4 text-sm text-slate-500 text-center max-w-md">
          通过简单的指针操作实现 O(1) 的分配与释放。不需要遍历，没有复杂的堆合并算法。
      </p>
    </div>
  );
};

// --- COMPLEXITY TABLE ---
export const ComplexityTable: React.FC = () => {
    return (
        <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div>特性 (Feature)</div>
                <div>Standard malloc/new</div>
                <div className="text-emerald-600">Memory Pool</div>
            </div>
            
            <div className="grid grid-cols-3 p-4 border-b border-slate-100 items-center">
                <div className="font-bold text-slate-700 text-sm">时间复杂度 (分配)</div>
                <div className="text-sm text-red-500 flex items-center gap-1"><Clock size={14}/> O(n) or variable</div>
                <div className="text-sm text-emerald-600 font-bold flex items-center gap-1"><Zap size={14}/> O(1)</div>
            </div>

            <div className="grid grid-cols-3 p-4 border-b border-slate-100 items-center">
                <div className="font-bold text-slate-700 text-sm">时间复杂度 (释放)</div>
                <div className="text-sm text-red-500 flex items-center gap-1"><Clock size={14}/> O(n) or variable</div>
                <div className="text-sm text-emerald-600 font-bold flex items-center gap-1"><Zap size={14}/> O(1)</div>
            </div>

            <div className="grid grid-cols-3 p-4 border-b border-slate-100 items-center">
                <div className="font-bold text-slate-700 text-sm">碎片化 (Fragmentation)</div>
                <div className="text-sm text-amber-600">外部碎片严重 (High External)</div>
                <div className="text-sm text-emerald-600">几乎为零 (Near Zero)</div>
            </div>

            <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-bold text-slate-700 text-sm">缓存友好性 (Locality)</div>
                <div className="text-sm text-slate-500">随机分布 (Random)</div>
                <div className="text-sm text-emerald-600 font-bold">连续内存 (Contiguous)</div>
            </div>
        </div>
    )
}

// --- CODE SNIPPET ---
export const CodeSnippet: React.FC<{ code: string, language: string, title?: string }> = ({ code, language, title }) => {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (window.Prism && codeRef.current) {
            window.Prism.highlightElement(codeRef.current);
        }
    }, [code, language]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-xl overflow-hidden bg-[#0F172A] border border-slate-700 shadow-2xl">
            {(title) && (
                <div className="flex justify-between items-center px-4 py-2 bg-[#1E293B] border-b border-slate-700">
                    <div className="flex items-center gap-2 text-xs font-sans text-slate-400">
                        <Terminal size={12} />
                        {title}
                    </div>
                    <button 
                        onClick={handleCopy}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy code"
                    >
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                </div>
            )}
            <div className="overflow-x-auto">
                 <pre className="!m-0 !p-6 !bg-transparent text-sm font-mono leading-relaxed">
                    <code ref={codeRef} className={`language-${language}`}>
                        {code}
                    </code>
                 </pre>
            </div>
        </div>
    );
};
