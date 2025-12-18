
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { HeroScene } from './components/QuantumScene';
import { MemoryPoolVisualizer, ComplexityTable, CodeSnippet } from './components/Diagrams';
// Added Scale to the lucide-react imports
import { 
  ArrowDown, Menu, X, Download, Loader2, Hammer, 
  Box, Server, Database, Clock, Cpu, Zap, Layers, 
  AlertTriangle, CheckCircle2, XCircle, Info, Flame,
  Target, ShieldAlert, Terminal, Workflow, Scale
} from 'lucide-react';
import JSZip from 'jszip';
import saveAs from 'file-saver';

const FeatureCard = ({ title, desc, icon, delay }: { title: string, desc: string, icon: React.ReactNode, delay: string }) => {
  return (
    <div className="flex flex-col group animate-fade-in-up p-8 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 w-full hover:border-emerald-500/50" style={{ animationDelay: delay }}>
      <div className="mb-4 text-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <h3 className="font-serif text-2xl text-slate-900 mb-3">{title}</h3>
      <div className="w-12 h-0.5 bg-emerald-500 mb-4 opacity-60"></div>
      <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
    </div>
  );
};

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeImplTab, setActiveImplTab] = useState<'basic' | 'bitmap' | 'stack'>('basic');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
        const zip = new JSZip();
        const htmlRes = await fetch('index.html');
        if (!htmlRes.ok) throw new Error('Failed to fetch index.html');
        let html = await htmlRes.text();

        const masterImports = `
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Box, Environment, Stars, Instances, Instance } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Menu, X, ExternalLink, Code2, AlertTriangle, Layers, Download, Loader2, Check, Copy, Terminal, ArrowRight, Clock, Zap, Cpu, Hammer, FileCode, Monitor, Lock, Trash2, Split, Scale, CheckCircle2, XCircle, Server, Database, Bug, BookOpen, Component, Braces, AlertCircle, Info, Flame, Target, ShieldAlert, Workflow } from 'lucide-react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
`;

        const filesToBundle = [
            'types.ts',
            'components/QuantumScene.tsx',
            'components/Diagrams.tsx',
            'App.tsx',
            'index.tsx'
        ];

        let combinedCode = masterImports;

        for (const file of filesToBundle) {
            try {
                const res = await fetch(file);
                if (!res.ok) throw new Error(`Failed to fetch ${file}`);
                let code = await res.text();
                code = code.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
                code = code.replace(/import\s+['"][^'"]+['"];?/g, '');
                code = code.replace(/export\s+default\s+/g, '');
                code = code.replace(/export\s+(const|function|class|interface|type|enum)/g, '$1');
                combinedCode += `\n\n/* --- Source: ${file} --- */\n${code}\n`;
            } catch (e) {
                combinedCode += `\n/* Error loading ${file} */\n`;
            }
        }

        const babelScript = `<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>`;
        const mainScript = `
    <script type="text/babel" data-type="module" data-presets="typescript,react">
${combinedCode}
    </script>`;

        if (html.includes('</body>')) {
            html = html.replace('</body>', `${babelScript}\n${mainScript}\n</body>`);
        } else {
            html += `${babelScript}\n${mainScript}`;
        }

        zip.file('index.html', html);
        zip.file('README.md', `# Memory Pool Website Source\n\nSee index.html for bundled source.`);
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "memory-pool-site.zip");
    } catch (err) {
        alert("打包下载失败");
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 selection:bg-emerald-200 selection:text-slate-900">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#F8FAFC]/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-lg flex items-center justify-center text-white font-mono font-bold text-xl shadow-sm">M</div>
            <span className={`font-serif font-bold text-lg tracking-wide transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
              Memory<span className="text-emerald-600">Pool</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-slate-600">
            <a href="#intro" onClick={scrollToSection('intro')} className="hover:text-emerald-600 transition-colors cursor-pointer">原理</a>
            <a href="#implementation" onClick={scrollToSection('implementation')} className="hover:text-emerald-600 transition-colors cursor-pointer">实现</a>
            <a href="#complex-types" onClick={scrollToSection('complex-types')} className="hover:text-emerald-600 transition-colors cursor-pointer">复杂类型</a>
            <a href="#comparison" onClick={scrollToSection('comparison')} className="hover:text-emerald-600 transition-colors cursor-pointer">对比</a>
            <a href="#scenarios" onClick={scrollToSection('scenarios')} className="hover:text-emerald-600 transition-colors cursor-pointer">场景</a>
            <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>源码</span>
            </button>
          </div>

          <button className="md:hidden text-slate-900 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#F8FAFC] flex flex-col items-center justify-center gap-8 text-xl font-serif animate-fade-in">
            <a href="#intro" onClick={scrollToSection('intro')} className="text-slate-900">核心原理</a>
            <a href="#implementation" onClick={scrollToSection('implementation')} className="text-slate-900">代码实现</a>
            <a href="#complex-types" onClick={scrollToSection('complex-types')} className="text-slate-900">复杂对象管理</a>
            <a href="#comparison" onClick={scrollToSection('comparison')} className="text-slate-900">性能对比</a>
            <button onClick={handleDownload} className="flex items-center gap-2 text-emerald-600 font-bold">
                 <Download size={20} /> 下载源码
            </button>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-900">
        <HeroScene />
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.4)_0%,rgba(15,23,42,0.8)_60%,rgba(15,23,42,1)_100%)]" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-block mb-4 px-3 py-1 border border-emerald-500/50 text-emerald-400 text-xs tracking-[0.2em] uppercase font-bold rounded-full backdrop-blur-sm bg-black/30">
            System Programming • Optimization
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-tight mb-8 text-white drop-shadow-2xl">
            Memory Pool <br/><span className="italic font-normal text-emerald-400 text-3xl md:text-5xl block mt-4">高性能内存管理的艺术</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-light leading-relaxed mb-12">
            告别碎片化与不确定的 Malloc 延迟。<br/>
            通过预分配与固定块策略，实现 <span className="text-white font-mono">O(1)</span> 极致性能。
          </p>
          <div className="flex justify-center">
             <a href="#intro" onClick={scrollToSection('intro')} className="group flex flex-col items-center gap-2 text-sm font-medium text-slate-500 hover:text-white transition-colors cursor-pointer">
                <span>深入探索</span>
                <span className="p-2 border border-slate-700 rounded-full group-hover:border-white transition-colors bg-white/5">
                    <ArrowDown size={16} />
                </span>
             </a>
          </div>
        </div>
      </header>

      <main>
        {/* Introduction */}
        <section id="intro" className="py-24 bg-white">
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5">
              <div className="inline-block mb-3 text-xs font-bold tracking-widest text-emerald-600 uppercase">概念解析</div>
              <h2 className="font-serif text-4xl mb-6 leading-tight text-slate-900">什么是内存池？</h2>
              <div className="w-16 h-1 bg-emerald-500 mb-6"></div>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                <strong>内存池 (Memory Pool)</strong>，也称为定长块分配器，是一种预先向操作系统申请一大块连续内存（Arena/Chunk），然后将其切分为大小相同的固定块（Blocks）进行管理的技术。
              </p>
              <p className="text-slate-600 leading-relaxed">
                它的核心在于绕过通用的 <code>malloc/free</code>，消除外部碎片，并显著减少系统调用的开销，特别适合频繁创建 and 销毁小对象的场景。
              </p>
            </div>
            <div className="md:col-span-7">
               <MemoryPoolVisualizer />
            </div>
          </div>
          
          <div className="container mx-auto px-6 mt-20">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                   title="确定性延迟" 
                   desc="分配和释放的时间复杂度均为 O(1)。在实时系统（如高频交易、嵌入式控制）中至关重要。"
                   icon={<Clock size={28}/>}
                   delay="0s"
                />
                <FeatureCard 
                   title="缓存友好" 
                   desc="对象在内存中连续存放，极大提高了 CPU 缓存命中率 (Cache Locality)，减少 Cache Miss。"
                   icon={<Cpu size={28}/>}
                   delay="0.1s"
                />
                <FeatureCard 
                   title="零碎片化" 
                   desc="通过固定块大小（Fixed-size Blocks），完全消除外部碎片问题，内存利用率极高。"
                   icon={<Layers size={28}/>}
                   delay="0.2s"
                />
             </div>
          </div>
        </section>

        {/* Implementation Section */}
        <section id="implementation" className="py-24 bg-slate-900 text-slate-100 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row gap-16 items-start mb-24">
                     <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-emerald-400 text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-slate-700">
                            核心实现
                        </div>
                        <h2 className="font-serif text-4xl md:text-5xl mb-6 text-white">嵌入式指针 (Embedded Pointer)</h2>
                        <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                            内存池最精妙的设计在于<strong>不需要额外的内存来存储空闲链表</strong>。我们在空闲的内存块中直接存储指向下一个空闲块的指针。
                        </p>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                           当一个块被“分配”出去后，这部分内存由用户写入数据；当它被“释放”回来时，我们再次将其作为指针使用。这就是 union 的妙用。
                        </p>
                     </div>
                     <div className="flex-1 w-full max-w-xl">
                        <CodeSnippet 
                          language="cpp"
                          title="MemoryPool.h"
                          code={`struct Block {
    union {
        Block* next;      // 仅在空闲时作为链表指针
        char data[1];     // 用户数据起始地址
    };
};

class MemoryPool {
    Block* freeHead = nullptr;
public:
    void* allocate() {
        if (!freeHead) refill(); // 扩容
        Block* block = freeHead;
        freeHead = freeHead->next; // Pop from head
        return block;
    }

    void deallocate(void* p) {
        Block* block = (Block*)p;
        block->next = freeHead; // Push to head
        freeHead = block;
    }
};`}
                        />
                     </div>
                </div>

                <div className="pt-12 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-8 justify-center">
                        <Hammer className="text-emerald-400" />
                        <h3 className="font-serif text-3xl text-white">实现策略变体</h3>
                    </div>

                    <div className="flex justify-center gap-2 md:gap-4 mb-8">
                        <button onClick={() => setActiveImplTab('basic')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeImplTab === 'basic' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                            <Workflow size={16} /> 经典链表
                        </button>
                        <button onClick={() => setActiveImplTab('bitmap')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeImplTab === 'bitmap' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                            <Database size={16} /> 位图管理
                        </button>
                        <button onClick={() => setActiveImplTab('stack')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeImplTab === 'stack' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                            <Layers size={16} /> 线性分配
                        </button>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-1 border border-slate-700 max-w-4xl mx-auto">
                        {activeImplTab === 'basic' && (
                            <div className="p-6">
                                <p className="text-slate-300 mb-4 text-sm">最基础的 O(1) 实现。通过头插法维护空闲链表。缺点：长期运行后物理连续性变差，影响 CPU 缓存。</p>
                                <CodeSnippet language="cpp" code={`// FreeHead -> Block1 -> Block2 -> nullptr`} title="Linked_List.cpp" />
                            </div>
                        )}
                        {activeImplTab === 'bitmap' && (
                            <div className="p-6">
                                <p className="text-slate-300 mb-4 text-sm">使用 bitset 记录每个 block 的占用情况。支持快速搜索连续块，常用于操作系统内核和页表管理。</p>
                                <CodeSnippet language="cpp" code={`uint64_t bitmap = 0; // 64个块的占用情况
int alloc() {
    int idx = __builtin_ctzll(~bitmap); // 找第一个0位
    bitmap |= (1ULL << idx);
    return idx;
}`} title="Bitmap_Manager.cpp" />
                            </div>
                        )}
                        {activeImplTab === 'stack' && (
                            <div className="p-6">
                                <p className="text-slate-300 mb-4 text-sm">也叫 Arena 或 Linear Allocator。只能统一释放。极高性能，适合处理单帧内的大量临时对象。</p>
                                <CodeSnippet language="cpp" code={`void* alloc(size_t size) {
    void* p = current_ptr;
    current_ptr += size; // 仅仅是移动指针
    return p;
}
void clear() { current_ptr = start_ptr; }`} title="Linear_Arena.cpp" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>

        {/* Complex Types */}
        <section id="complex-types" className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold tracking-widest uppercase rounded-full mb-4">进阶挑战</div>
                        <h2 className="font-serif text-4xl text-slate-900 mb-6">处理复杂对象 (C++)</h2>
                        <p className="text-slate-600 text-lg">在内存池中分配 C++ 对象时，我们不能直接使用 <code>malloc</code> 得到的指针。我们需要手动触发构造函数与析构函数。</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold">1</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">Placement New</h4>
                                    <p className="text-slate-600 text-sm">在已分配的原始内存上“原地”调用构造函数。语法：<code>new(ptr) T(...)</code></p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold">2</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">Manual Destructor</h4>
                                    <p className="text-slate-600 text-sm">释放前必须显式调用析构函数。语法：<code>ptr->~T()</code></p>
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-800 text-sm flex gap-3">
                                <AlertTriangle size={20} className="flex-shrink-0" />
                                <div><strong>注意对齐：</strong> 对象在内存池中的起始地址必须符合其类型的 Alignment 要求，否则在某些 CPU 上会导致崩溃。</div>
                            </div>
                        </div>
                        <CodeSnippet 
                            language="cpp"
                            title="Advanced_Pool.cpp"
                            code={`template<typename T>
T* create() {
    void* p = pool.allocate();
    // 原地构造 (Placement New)
    return new(p) T();
}

template<typename T>
void destroy(T* p) {
    p->~T(); // 显式析构
    pool.deallocate(p);
}`}
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* Comparison Section */}
        <section id="comparison" className="py-24 bg-slate-50 border-y border-slate-200">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center mb-16">
                    <Scale className="text-emerald-500 mb-4" size={40} />
                    <h2 className="font-serif text-4xl text-slate-900 text-center">Malloc vs Memory Pool</h2>
                </div>
                <div className="max-w-4xl mx-auto">
                    <ComplexityTable />
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                            <h4 className="text-red-700 font-bold flex items-center gap-2 mb-4">
                                <XCircle size={18} /> 标准分配器的痛点
                            </h4>
                            <ul className="space-y-3 text-sm text-red-800/80">
                                <li>• <b>外部碎片：</b> 长期运行导致大块内存不可用。</li>
                                <li>• <b>元数据开销：</b> 每个小块都要额外存 size 等信息。</li>
                                <li>• <b>加锁竞争：</b> 多线程下全局堆分配存在严重锁争用。</li>
                            </ul>
                        </div>
                        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                            <h4 className="text-emerald-700 font-bold flex items-center gap-2 mb-4">
                                <CheckCircle2 size={18} /> 内存池的优势
                            </h4>
                            <ul className="space-y-3 text-sm text-emerald-800/80">
                                <li>• <b>无锁设计：</b> Thread-Local Pool 实现零竞争。</li>
                                <li>• <b>预读友好：</b> 连续访问对数据总线非常友好。</li>
                                <li>• <b>生存期管理：</b> 整个池可以跟随场景一键销毁。</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Use Scenarios & Traps */}
        <section id="scenarios" className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <Target className="text-emerald-600" />
                            <h3 className="font-serif text-3xl">最佳应用场景</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { t: "游戏引擎", d: "粒子系统、子弹对象、短生命周期的 UI 元素。", i: <Zap size={18}/> },
                                { t: "高频交易 (HFT)", d: "纳秒级处理网络包，避免任何不确定的 GC 或分配延迟。", i: <Flame size={18}/> },
                                { t: "网络服务器", d: "为每个连接分配固定大小的 Buffer，防止内存碎片。", i: <Server size={18}/> },
                                { t: "嵌入式开发", d: "在有限内存中提供极其稳定的分配保证。", i: <Info size={18}/> }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-4 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                    <div className="text-emerald-600 mt-1">{item.i}</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{item.t}</h4>
                                        <p className="text-slate-500 text-sm">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert className="text-amber-600" />
                            <h3 className="font-serif text-3xl">常见的陷阱</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-6 bg-slate-900 rounded-xl text-white">
                                <h4 className="font-bold mb-3 flex items-center gap-2">
                                    <AlertTriangle className="text-amber-400" size={16}/> 内部碎片 (Internal Fragmentation)
                                </h4>
                                <p className="text-slate-400 text-sm">
                                    如果你申请的块是 64 字节，但只存 8 字节数据，剩下的 56 字节就是内部碎片. 内存池虽然解决了外部碎片，但配置不当会造成内存浪费.
                                </p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <h4 className="font-bold mb-3 text-slate-800 flex items-center gap-2">
                                    <XCircle className="text-red-500" size={16}/> 内存耗尽风险
                                </h4>
                                <p className="text-slate-600 text-sm">
                                    内存池通常有上限. 如果分配速度超过释放, 且没有后备系统（如 fallback 到 malloc）, 会导致系统崩溃.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 text-slate-500 border-t border-slate-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-emerald-500 font-bold">M</div>
                <div className="text-sm">
                    <p className="text-slate-300 font-bold">Memory Pool Visual Guide</p>
                    <p>© 2025 System Optimization Lab</p>
                </div>
            </div>
            <div className="flex gap-8 text-xs uppercase tracking-widest font-bold">
                <a href="#" className="hover:text-white transition-colors">Documentation</a>
                <a href="#" className="hover:text-white transition-colors">Github</a>
                <a href="#" className="hover:text-white transition-colors">API Reference</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
