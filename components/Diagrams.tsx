
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Terminal, ArrowRight, ArrowLeftRight } from 'lucide-react';

// Declaration for global Prism object
declare global {
    interface Window {
        Prism: any;
    }
}

// --- BRIDGE ANIMATION ---
export const BridgeAnimation: React.FC = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setPhase(p => (p + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-stone-200 my-8">
      <h3 className="font-serif text-xl mb-4 text-stone-800">互操作性原理</h3>
      <p className="text-sm text-stone-500 mb-6 text-center max-w-md">
        对象在 C++ 与 Python 运行时之间透明传递，底层引用计数自动管理。
      </p>
      
      <div className="relative w-full max-w-lg h-48 bg-[#F5F4F0] rounded-lg border border-stone-200 p-4 flex items-center justify-between overflow-hidden">
         {/* Grid Background */}
         <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
         </div>

         {/* C++ Zone */}
         <div className="z-10 w-24 h-24 bg-stone-800 rounded-lg flex flex-col items-center justify-center text-white shadow-lg border-2 border-stone-600">
            <span className="font-mono text-2xl font-bold text-blue-400">C++</span>
            <span className="text-[10px] text-stone-400 mt-1">Compiled</span>
         </div>

         {/* Bridge Path */}
         <div className="flex-1 h-2 bg-stone-300 mx-4 rounded-full relative">
            {/* The Packet */}
            <motion.div 
                className="absolute top-1/2 -mt-4 w-8 h-8 rounded bg-nobel-gold shadow-md flex items-center justify-center z-20"
                animate={{ 
                    left: phase === 0 ? '0%' : phase === 1 ? '50%' : phase === 2 ? '100%' : '50%',
                    rotate: phase * 90,
                    backgroundColor: phase === 1 || phase === 3 ? '#FFD43B' : '#306998'
                }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
            >
                <div className="w-2 h-2 bg-white rounded-full"></div>
            </motion.div>
         </div>

         {/* Python Zone */}
         <div className="z-10 w-24 h-24 bg-stone-800 rounded-lg flex flex-col items-center justify-center text-white shadow-lg border-2 border-stone-600">
            <span className="font-mono text-2xl font-bold text-yellow-400">Py</span>
            <span className="text-[10px] text-stone-400 mt-1">Interpreted</span>
         </div>
      </div>
      
      <div className="flex gap-8 mt-6 text-xs font-mono text-stone-500">
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div> std::vector
          </div>
          <div className="flex items-center gap-2">
              <ArrowLeftRight size={14}/> Auto-Convert
          </div>
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div> list
          </div>
      </div>
    </div>
  );
};

// --- TYPE MAPPING TABLE ---
export const TypeMappingTable: React.FC = () => {
    const mappings = [
        { cpp: "int, float, double", py: "int, float" },
        { cpp: "std::string, char*", py: "str" },
        { cpp: "std::vector<T>", py: "list" },
        { cpp: "std::map<K, V>", py: "dict" },
        { cpp: "std::tuple<...>", py: "tuple" },
        { cpp: "std::function<...>", py: "Callable" },
    ];

    return (
        <div className="overflow-hidden bg-white border border-stone-200 rounded-xl shadow-sm">
            <div className="grid grid-cols-2 bg-stone-50 border-b border-stone-200 p-3 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <div>C++ Type</div>
                <div>Python Type</div>
            </div>
            {mappings.map((m, i) => (
                <div key={i} className="grid grid-cols-2 p-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                    <div className="font-mono text-sm text-blue-700">{m.cpp}</div>
                    <div className="font-mono text-sm text-yellow-700 flex items-center gap-2">
                        <ArrowRight size={12} className="text-stone-300" /> {m.py}
                    </div>
                </div>
            ))}
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
        <div className="rounded-xl overflow-hidden bg-[#2d2d2d] border border-stone-700 shadow-2xl">
            {(title) && (
                <div className="flex justify-between items-center px-4 py-2 bg-[#252526] border-b border-stone-700">
                    <div className="flex items-center gap-2 text-xs font-sans text-stone-400">
                        <Terminal size={12} />
                        {title}
                    </div>
                    <button 
                        onClick={handleCopy}
                        className="text-stone-400 hover:text-white transition-colors"
                        title="Copy code"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
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
