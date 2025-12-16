
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { HeroScene, NetworkScene } from './components/QuantumScene';
import { BridgeAnimation, TypeMappingTable, CodeSnippet } from './components/Diagrams';
import { ArrowDown, Menu, X, ExternalLink, Code2, AlertTriangle, Layers, Download, Loader2, Hammer, FileCode, Monitor, Lock, Trash2, Split, Scale, CheckCircle2, XCircle } from 'lucide-react';
import JSZip from 'jszip';
import saveAs from 'file-saver';

const FeatureCard = ({ title, desc, icon, delay }: { title: string, desc: string, icon: React.ReactNode, delay: string }) => {
  return (
    <div className="flex flex-col group animate-fade-in-up p-8 bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 w-full hover:border-nobel-gold/50" style={{ animationDelay: delay }}>
      <div className="mb-4 text-nobel-gold opacity-80 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <h3 className="font-serif text-2xl text-stone-900 mb-3">{title}</h3>
      <div className="w-12 h-0.5 bg-nobel-gold mb-4 opacity-60"></div>
      <p className="text-stone-600 leading-relaxed text-sm">{desc}</p>
    </div>
  );
};

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeBuildTab, setActiveBuildTab] = useState<'cmake' | 'qt' | 'vs'>('cmake');

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

        // 1. Fetch base index.html
        const htmlRes = await fetch('index.html');
        if (!htmlRes.ok) throw new Error('Failed to fetch index.html');
        let html = await htmlRes.text();

        // 2. Define the Master Import Block
        // This replaces all individual imports in the bundled files to avoid duplicates (e.g., 'React' already declared).
        // ADDED: New icons (Lock, Trash2, Split, Scale, CheckCircle2, XCircle) used in the new sections
        const masterImports = `
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Icosahedron, Box, Environment, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowDown, Menu, X, ExternalLink, Code2, AlertTriangle, Layers, Download, Loader2, Check, Copy, Terminal, ArrowRight, ArrowLeftRight, Hammer, FileCode, Monitor, Lock, Trash2, Split, Scale, CheckCircle2, XCircle } from 'lucide-react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
`;

        // 3. Define files to bundle in dependency order
        // types -> components -> main app -> entry point
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

                // --- Robust Code Transformation ---
                
                // 1. Remove ALL import statements (both local and external)
                // We rely on the Master Import Block for externals, and scope sharing for locals.
                // Matches: import ... from '...'; (handling multi-line imports conservatively)
                code = code.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
                
                // 2. Clean up any side-effect imports if any (e.g., import './style.css')
                code = code.replace(/import\s+['"][^'"]+['"];?/g, '');

                // 3. Remove 'export default' 
                code = code.replace(/export\s+default\s+/g, '');

                // 4. Remove 'export' keyword from declarations
                // This makes consts/functions global within the bundled module scope
                code = code.replace(/export\s+(const|function|class|interface|type|enum)/g, '$1');

                combinedCode += `\n\n/* --- Source: ${file} --- */\n${code}\n`;

            } catch (e) {
                console.warn(`Error processing ${file}`, e);
                combinedCode += `\n/* Error loading ${file} */\n`;
            }
        }

        // 4. Inject into HTML
        const babelScript = `<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>`;
        
        // We embed the combined code directly. 
        // Note: We escape backticks or script tags if they existed in the code (simple version here).
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

        // 5. Add Instructions
        zip.file('README.md', `# pybind11 Website Source (bundled)

## 如何运行 (How to Run)

此版本已将所有 TypeScript 源码合并到 \`index.html\` 中，方便查看和调试。

### 步骤 (Steps)
1. 解压文件。
2. 在解压目录打开终端。
3. 启动一个本地服务器 (由于 CORS 限制，直接双击 html 可能无法加载 CDN 资源):
   
   **Python:**
   \`\`\`bash
   python -m http.server
   \`\`\`
   
   **Node.js:**
   \`\`\`bash
   npx serve
   \`\`\`

4. 在浏览器访问 \`http://localhost:8000\` (或 3000)。

### 依赖 (Dependencies)
本网页运行时依赖 React, Three.js 等 CDN 资源，请确保**网络连接正常**。
`);

        // 6. Generate Zip
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "pybind11-website-bundled.zip");

    } catch (err) {
        console.error(err);
        alert("打包下载失败 (Bundling Failed)");
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-stone-800 selection:bg-nobel-gold selection:text-white">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#F9F8F4]/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-br from-[#306998] to-[#FFD43B] rounded-lg flex items-center justify-center text-white font-mono font-bold text-xl shadow-sm">py</div>
            <span className={`font-serif font-bold text-lg tracking-wide transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
              pybind11 <span className="font-sans font-normal text-xs text-stone-500 tracking-normal ml-2">C++ & Python</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-stone-600">
            <a href="#intro" onClick={scrollToSection('intro')} className="hover:text-nobel-gold transition-colors cursor-pointer">简介</a>
            <a href="#usage" onClick={scrollToSection('usage')} className="hover:text-nobel-gold transition-colors cursor-pointer">使用</a>
            <a href="#examples" onClick={scrollToSection('examples')} className="hover:text-nobel-gold transition-colors cursor-pointer">示例</a>
            <a href="#comparison" onClick={scrollToSection('comparison')} className="hover:text-nobel-gold transition-colors cursor-pointer">对比</a>
            <a href="#notes" onClick={scrollToSection('notes')} className="hover:text-nobel-gold transition-colors cursor-pointer">注意事项</a>
            <div className="h-6 w-[1px] bg-stone-300 mx-2"></div>
            <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="hover:text-nobel-gold transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                title="下载网页源码 (Download Source)"
            >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>{isDownloading ? '打包下载' : '下载'}</span>
            </button>
            <a 
              href="https://pybind11.readthedocs.io/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-5 py-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
            >
              文档 <ExternalLink size={14} />
            </a>
          </div>

          <button className="md:hidden text-stone-900 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#F9F8F4] flex flex-col items-center justify-center gap-8 text-xl font-serif animate-fade-in">
            <a href="#intro" onClick={scrollToSection('intro')} className="hover:text-nobel-gold transition-colors cursor-pointer">简介</a>
            <a href="#usage" onClick={scrollToSection('usage')} className="hover:text-nobel-gold transition-colors cursor-pointer">使用方法</a>
            <a href="#examples" onClick={scrollToSection('examples')} className="hover:text-nobel-gold transition-colors cursor-pointer">代码示例</a>
            <a href="#comparison" onClick={scrollToSection('comparison')} className="hover:text-nobel-gold transition-colors cursor-pointer">vs ctypes</a>
            <a href="#notes" onClick={scrollToSection('notes')} className="hover:text-nobel-gold transition-colors cursor-pointer">注意事项</a>
            <button onClick={handleDownload} className="flex items-center gap-2 text-nobel-gold font-bold">
                 <Download size={20} /> 下载源码
            </button>
            <a 
              href="https://pybind11.readthedocs.io/" 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setMenuOpen(false)} 
              className="px-6 py-3 bg-stone-900 text-white rounded-full shadow-lg cursor-pointer"
            >
              查看官方文档
            </a>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroScene />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(249,248,244,0.85)_0%,rgba(249,248,244,0.5)_50%,rgba(249,248,244,0.2)_100%)]" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-block mb-4 px-3 py-1 border border-nobel-gold text-nobel-gold text-xs tracking-[0.2em] uppercase font-bold rounded-full backdrop-blur-sm bg-white/30">
            Open Source • Modern C++
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl font-medium leading-tight md:leading-[0.9] mb-8 text-stone-900 drop-shadow-sm">
            pybind11 <br/><span className="italic font-normal text-stone-600 text-3xl md:text-5xl block mt-4">连接 C++ 与 Python 的艺术</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-stone-700 font-light leading-relaxed mb-12">
            一个轻量级的 Header-only 库，让 C++ 类型在 Python 中触手可及，<br className="hidden md:block"/>亦可让 Python 对象在 C++ 中自由流转。
          </p>
          
          <div className="flex justify-center">
             <a href="#intro" onClick={scrollToSection('intro')} className="group flex flex-col items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer">
                <span>探索功能</span>
                <span className="p-2 border border-stone-300 rounded-full group-hover:border-stone-900 transition-colors bg-white/50">
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
              <div className="inline-block mb-3 text-xs font-bold tracking-widest text-stone-500 uppercase">简介</div>
              <h2 className="font-serif text-4xl mb-6 leading-tight text-stone-900">轻量、高效、现代</h2>
              <div className="w-16 h-1 bg-nobel-gold mb-6"></div>
              <p className="text-lg text-stone-600 leading-relaxed mb-6">
                <strong>pybind11</strong> 是一个轻量级的 C++ 库，主要用于创建 Python 的 C++ 扩展绑定。它的设计目标是尽可能地保持简洁和轻量，仅需包含头文件即可使用。
              </p>
              <p className="text-stone-600 leading-relaxed">
                它借鉴了 <code>Boost.Python</code> 的设计理念，但利用了 C++11 的新特性，去除了 Boost 的庞大依赖和复杂性，成为了现代 C++ 项目首选的绑定工具。
              </p>
            </div>
            <div className="md:col-span-7">
               <BridgeAnimation />
            </div>
          </div>
          
          <div className="container mx-auto px-6 mt-20">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                   title="Header-only" 
                   desc="无需编译庞大的链接库，只需在你的项目中 include 头文件，即可开始编写绑定代码。"
                   icon={<Layers size={28}/>}
                   delay="0s"
                />
                <FeatureCard 
                   title="Type Conversion" 
                   desc="自动处理 STL 容器（如 vector, map）与 Python 列表、字典之间的相互转换。"
                   icon={<Code2 size={28}/>}
                   delay="0.1s"
                />
                <FeatureCard 
                   title="NumPy Support" 
                   desc="原生的 NumPy 数组集成，实现 C++ 与 Python 科学计算栈的零拷贝数据共享。"
                   icon={<Layers size={28}/>}
                   delay="0.2s"
                />
             </div>
          </div>
        </section>

        {/* Usage Section */}
        <section id="usage" className="py-24 bg-stone-900 text-stone-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="w-96 h-96 rounded-full bg-stone-600 blur-[100px] absolute top-[-100px] left-[-100px]"></div>
                <div className="w-96 h-96 rounded-full bg-nobel-gold blur-[100px] absolute bottom-[-100px] right-[-100px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row gap-16 items-start mb-24">
                     <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-800 text-nobel-gold text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-stone-700">
                            快速上手
                        </div>
                        <h2 className="font-serif text-4xl md:text-5xl mb-6 text-white">基础用法</h2>
                        <p className="text-lg text-stone-400 mb-6 leading-relaxed">
                            只需几行代码，即可将 C++ 函数暴露给 Python。使用 <code>PYBIND11_MODULE</code> 宏定义模块入口，像写 Python 一样写 C++。
                        </p>
                        
                        <div className="space-y-4">
                           <div className="flex items-start gap-4">
                              <div className="w-6 h-6 rounded-full bg-nobel-gold text-stone-900 flex items-center justify-center font-bold text-xs mt-1">1</div>
                              <div>
                                <h4 className="font-bold text-stone-200">安装</h4>
                                <p className="text-sm text-stone-500 font-mono mt-1 bg-stone-800/50 p-2 rounded inline-block">pip install pybind11</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-4">
                              <div className="w-6 h-6 rounded-full bg-nobel-gold text-stone-900 flex items-center justify-center font-bold text-xs mt-1">2</div>
                              <div>
                                <h4 className="font-bold text-stone-200">编写 C++</h4>
                                <p className="text-sm text-stone-500 mt-1">包含头文件并定义模块。</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-4">
                              <div className="w-6 h-6 rounded-full bg-nobel-gold text-stone-900 flex items-center justify-center font-bold text-xs mt-1">3</div>
                              <div>
                                <h4 className="font-bold text-stone-200">编译</h4>
                                <p className="text-sm text-stone-500 mt-1">使用 CMake 或 c++ 编译器生成 .so 或 .pyd 文件。</p>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="flex-1 w-full max-w-xl">
                        <CodeSnippet 
                          language="cpp"
                          title="example.cpp"
                          code={`#include <pybind11/pybind11.h>

namespace py = pybind11;

int add(int i, int j) {
    return i + j;
}

// 定义模块 "example"
PYBIND11_MODULE(example, m) {
    m.doc() = "pybind11 example plugin"; // 模块文档字符串

    // 绑定 add 函数
    m.def("add", &add, "A function that adds two numbers",
          py::arg("i"), py::arg("j"));
}`}
                        />
                     </div>
                </div>

                {/* Build Systems Integration */}
                <div className="pt-12 border-t border-stone-800">
                    <div className="flex items-center gap-3 mb-8 justify-center">
                        <Hammer className="text-nobel-gold" />
                        <h3 className="font-serif text-3xl text-white">构建系统支持</h3>
                    </div>
                    <p className="text-center text-stone-400 mb-10 max-w-2xl mx-auto">
                        pybind11 作为一个 header-only 库，支持多种构建系统。除了官方推荐的 CMake，您也可以在 Qt (QMake) 和 Visual Studio 中使用它。
                    </p>

                    <div className="flex justify-center gap-2 md:gap-4 mb-8">
                        <button 
                            onClick={() => setActiveBuildTab('cmake')} 
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeBuildTab === 'cmake' ? 'bg-nobel-gold text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                        >
                            <Code2 size={16} /> CMake (推荐)
                        </button>
                        <button 
                            onClick={() => setActiveBuildTab('qt')} 
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeBuildTab === 'qt' ? 'bg-nobel-gold text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                        >
                            <FileCode size={16} /> Qt (QMake)
                        </button>
                        <button 
                            onClick={() => setActiveBuildTab('vs')} 
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeBuildTab === 'vs' ? 'bg-nobel-gold text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                        >
                            <Monitor size={16} /> Visual Studio
                        </button>
                    </div>

                    <div className="bg-stone-800/50 rounded-xl p-1 border border-stone-700 max-w-4xl mx-auto">
                        {activeBuildTab === 'cmake' && (
                            <div className="p-6">
                                <p className="text-stone-300 mb-4 text-sm">CMake 是构建 pybind11 项目的标准方式，只需将 pybind11 作为子目录引入即可。</p>
                                <CodeSnippet 
                                    language="cmake" 
                                    title="CMakeLists.txt"
                                    code={`cmake_minimum_required(VERSION 3.5)
project(example)

# 添加 pybind11 子目录 (通常是 git submodule 或下载的源码)
add_subdirectory(pybind11)

# 创建模块
pybind11_add_module(example example.cpp)`} 
                                />
                            </div>
                        )}

                        {activeBuildTab === 'qt' && (
                            <div className="p-6">
                                <p className="text-stone-300 mb-4 text-sm">在 Qt Creator 或使用 QMake 构建时，需要在 <code className="text-nobel-accent">.pro</code> 文件中手动添加包含路径和库链接。</p>
                                <CodeSnippet 
                                    language="makefile" 
                                    title="example.pro"
                                    code={`TEMPLATE = lib
CONFIG += dll plugin
TARGET = example

# 启用 C++17 或更高
CONFIG += c++17

# 1. 设置 pybind11 头文件路径
INCLUDEPATH += /usr/local/include/pybind11

# 2. 设置 Python 头文件 (根据您的环境修改路径)
# Linux (示例):
INCLUDEPATH += /usr/include/python3.10
# Windows (示例):
# INCLUDEPATH += C:/Python310/include

# 3. 链接 Python 库
# Linux:
LIBS += -lpython3.10
# Windows:
# LIBS += -LC:/Python310/libs -lpython310

# 4. 设置输出后缀 (Windows为.pyd, Linux/Mac为.so)
win32 {
    TARGET_EXT = .pyd
} else {
    TARGET_EXT = .so
}

SOURCES += example.cpp`} 
                                />
                            </div>
                        )}

                        {activeBuildTab === 'vs' && (
                            <div className="p-8 text-stone-300">
                                <h4 className="text-xl font-bold text-white mb-4">Visual Studio (MSVC) 配置指南</h4>
                                <ol className="space-y-6 list-decimal list-inside text-sm md:text-base">
                                    <li className="pl-2">
                                        <strong className="text-nobel-accent">创建项目:</strong> 新建一个 "空项目 (Empty Project)"，并将源文件扩展名设为 <code className="bg-stone-900 px-1 rounded">.cpp</code>。
                                    </li>
                                    <li className="pl-2">
                                        <strong className="text-nobel-accent">项目属性 (常规):</strong> 
                                        <br/><span className="ml-6 block mt-1 text-stone-400">配置属性 &gt; 常规 &gt; 配置类型: 选择 <strong>动态库 (.dll)</strong></span>
                                        <span className="ml-6 block text-stone-400">配置属性 &gt; 高级 &gt; 目标文件扩展名: 改为 <strong>.pyd</strong></span>
                                    </li>
                                    <li className="pl-2">
                                        <strong className="text-nobel-accent">包含目录 (C/C++):</strong>
                                        <br/><span className="ml-6 block mt-1 text-stone-400">配置属性 &gt; C/C++ &gt; 常规 &gt; 附加包含目录:</span>
                                        <div className="ml-6 mt-2 bg-stone-900 p-2 rounded font-mono text-xs">
                                            C:\path\to\pybind11\include<br/>
                                            C:\path\to\python\include
                                        </div>
                                    </li>
                                    <li className="pl-2">
                                        <strong className="text-nobel-accent">库目录 (链接器):</strong>
                                        <br/><span className="ml-6 block mt-1 text-stone-400">配置属性 &gt; 链接器 &gt; 常规 &gt; 附加库目录:</span>
                                        <div className="ml-6 mt-2 bg-stone-900 p-2 rounded font-mono text-xs">
                                            C:\path\to\python\libs
                                        </div>
                                    </li>
                                    <li className="pl-2">
                                        <strong className="text-nobel-accent">依赖项 (链接器):</strong>
                                        <br/><span className="ml-6 block mt-1 text-stone-400">配置属性 &gt; 链接器 &gt; 输入 &gt; 附加依赖项: 添加 <strong>python3x.lib</strong> (例如 python310.lib)</span>
                                    </li>
                                </ol>
                                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg flex gap-3 text-sm text-yellow-200/80">
                                    <AlertTriangle size={20} className="shrink-0" />
                                    <p>注意：编译生成的 .pyd 文件必须与使用的 Python 解释器版本（Release/Debug，32/64位）完全匹配，否则无法导入。</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </section>

        {/* Examples Section */}
        <section id="examples" className="py-24 bg-[#F9F8F4]">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="font-serif text-4xl md:text-5xl mb-6 text-stone-900">深入示例</h2>
                    <p className="text-lg text-stone-600 leading-relaxed">
                        pybind11 不仅仅支持简单的函数，还能完美处理面向对象编程、STL 容器和自定义类型。
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   {/* Example 1: Classes */}
                   <div>
                      <h3 className="font-serif text-2xl mb-4 text-stone-800">绑定类与结构体</h3>
                      <p className="text-stone-600 mb-4 text-sm">
                        可以轻松绑定 C++ 类，支持构造函数、成员变量、成员函数，甚至是继承和虚函数重载。
                      </p>
                      <CodeSnippet 
                          language="cpp"
                          title="classes.cpp"
                          code={`struct Pet {
    Pet(const std::string &name) : name(name) { }
    void setName(const std::string &name_) { name = name_; }
    const std::string &getName() const { return name; }
    std::string name;
};

PYBIND11_MODULE(example, m) {
    py::class_<Pet>(m, "Pet")
        .def(py::init<const std::string &>())
        .def("setName", &Pet::setName)
        .def("getName", &Pet::getName)
        .def_readwrite("name", &Pet::name);
}`}
                        />
                        <div className="mt-4 p-4 bg-white border border-stone-200 rounded-lg">
                           <div className="text-xs font-bold text-stone-400 mb-2 uppercase">Python Output</div>
                           <pre className="text-sm font-mono text-stone-700">
{`>>> import example
>>> p = example.Pet("Molly")
>>> print(p.getName())
Molly
>>> p.name = "Charly"
>>> print(p.getName())
Charly`}
                           </pre>
                        </div>
                   </div>

                   {/* Example 2: Type Conversion */}
                   <div>
                      <h3 className="font-serif text-2xl mb-4 text-stone-800">STL 类型自动转换</h3>
                      <p className="text-stone-600 mb-4 text-sm">
                        包含 <code>pybind11/stl.h</code> 后，<code>std::vector</code> 会自动转换为 Python List，<code>std::map</code> 转换为 Dict。
                      </p>
                      <TypeMappingTable />
                   </div>
                </div>
            </div>
        </section>

        {/* COMPARISON Section */}
        <section id="comparison" className="py-24 bg-stone-100 border-t border-stone-200">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                     <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-stone-200 text-stone-700 rounded-full text-xs font-bold tracking-widest uppercase">
                        <Scale size={14} />
                        技术选型
                    </div>
                    <h2 className="font-serif text-4xl text-stone-900 mb-4">pybind11 vs ctypes</h2>
                    <p className="text-stone-600">
                        为什么选择编译型的 pybind11 而不是 Python 内置的 ctypes？它们各有优劣，取决于您的项目需求。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* PROS */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle2 className="text-green-600" size={28} />
                            <h3 className="text-2xl font-serif text-stone-900">pybind11 核心优势</h3>
                        </div>

                        {/* Pro 1 */}
                        <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
                            <h4 className="font-bold text-stone-800 mb-2">1. 灵活的 C++ 类与生命周期支持</h4>
                            <p className="text-sm text-stone-600 mb-4">
                                pybind11 允许 Python 代码负责逻辑（管理对象生命周期），C++ 负责算法。这是 ctypes 极难做到的（通常只能处理 C 风格结构体）。
                            </p>
                            <CodeSnippet language="cpp" title="logic_separation.cpp" code={`// C++ 定义算法接口，Python 实现逻辑
class Algorithm {
    public: virtual void compute() = 0;
    virtual ~Algorithm() = default;
};

// ... 绑定代码 ...

/* Python 端:
class MyAlgo(example.Algorithm):
    def compute(self):
        print("Python controlling logic")
        # 即使 C++ 持有 MyAlgo 指针，调用 compute 时
        # 也会正确回调到 Python 代码
*/`} />
                        </div>

                        {/* Pro 2 */}
                        <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
                            <h4 className="font-bold text-stone-800 mb-2">2. C++ 原生访问 Python 对象</h4>
                            <p className="text-sm text-stone-600 mb-4">
                                可以在 C++ 代码中方便地导入 Python 模块、读取变量甚至执行 Python 代码。
                            </p>
                            <CodeSnippet language="cpp" title="access_python.cpp" code={`// C++ 中直接调用 Python
void run_python_logic() {
    py::object sys = py::module::import("sys");
    py::print("Path:", sys.attr("path"));
    
    // 执行简短的 Python 代码
    py::exec("print('Hello from embedded Python')");
}`} />
                        </div>
                    </div>

                    {/* CONS */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-6">
                            <XCircle className="text-red-500" size={28} />
                            <h3 className="text-2xl font-serif text-stone-900">劣势与成本</h3>
                        </div>

                        {/* Con 1 */}
                        <div className="bg-white p-6 rounded-xl border-l-4 border-red-400 shadow-sm">
                            <h4 className="font-bold text-stone-800 mb-2">1. 编译依赖与复杂性</h4>
                            <p className="text-sm text-stone-600 mb-4">
                                ctypes 只需要编译好的 .so/.dll。而 pybind11 需要在编译时包含 Python 和 pybind11 头文件，增加了构建系统的复杂性。
                            </p>
                            <div className="bg-stone-900 text-stone-400 p-3 rounded text-xs font-mono">
                                # ctypes (简单)<br/>
                                <span className="text-stone-300">g++ -shared -fPIC lib.cpp -o lib.so</span><br/><br/>
                                # pybind11 (繁琐)<br/>
                                <span className="text-stone-300">g++ -O3 -shared -fPIC lib.cpp -Ipybind11/include `python3-config --includes` -o example.so</span>
                            </div>
                        </div>

                        {/* Con 2 */}
                        <div className="bg-white p-6 rounded-xl border-l-4 border-red-400 shadow-sm">
                            <h4 className="font-bold text-stone-800 mb-2">2. 生命周期与悬空指针风险</h4>
                            <p className="text-sm text-stone-600 mb-4">
                                由于 C++ 和 Python 共同管理对象，如果策略不当（如使用 reference 但 Python 删除了引用），会导致 C++ 持有悬空指针。
                            </p>
                            <CodeSnippet language="python" title="dangling_pointer.py" code={`# 风险示例
ptr = example.get_unsafe_ref() 
del ptr # Python 释放了对象
# 此时如果 C++ 仍尝试访问该对象 -> Crash`} />
                        </div>

                        {/* Con 3 */}
                        <div className="bg-white p-6 rounded-xl border-l-4 border-red-400 shadow-sm">
                            <h4 className="font-bold text-stone-800 mb-2">3. 绑定代码量与类型固化</h4>
                            <p className="text-sm text-stone-600 mb-4">
                                虽然能自动转换，但 C++ 必须明确指定对应的 Python 类型。如果 Python 传入的类型（如大整数）超出了 C++ 类型（如 int）的范围，会抛出异常。
                            </p>
                            <p className="text-xs text-stone-500 mb-2 italic">开发者必须熟记以下映射表以避免精度丢失：</p>
                            <TypeMappingTable />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Notes / Precautions Section */}
        <section id="notes" className="py-24 bg-white border-t border-stone-200">
             <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                     <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-widest uppercase">
                        <AlertTriangle size={14} />
                        高级开发指南
                    </div>
                    <h2 className="font-serif text-4xl text-stone-900 mb-4">使用中的陷阱与技巧</h2>
                    <p className="text-stone-500">
                        掌握这些关键概念，避免常见的内存泄漏和多线程死锁问题。
                    </p>
                </div>

                <div className="space-y-12">
                    
                    {/* 1. GIL */}
                    <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200">
                        <h3 className="font-serif text-2xl text-stone-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-nobel-gold text-white text-sm font-sans font-bold rounded-lg shadow-sm"><Lock size={16}/></span>
                            GIL (全局解释器锁) 管理
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div>
                                <p className="text-stone-600 mb-4 leading-relaxed">
                                    <strong>问题：</strong> 默认情况下，C++ 扩展函数在运行时会持有 Python GIL。如果 C++ 代码执行耗时操作（如复杂数学计算、IO等待），会阻塞所有其他 Python 线程，导致程序假死。
                                </p>
                                <div className="p-4 bg-white border-l-4 border-red-400 text-stone-700 text-sm mb-4 shadow-sm">
                                    <strong className="block mb-1 text-red-500">❌ 错误示范 (Blocking)：</strong>
                                    直接运行长循环，GUI 无响应，其他后台线程停止工作。
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    <strong>解决方案：</strong> 使用 <code>py::gil_scoped_release</code> RAII 对象。当它被构造时，GIL 被释放；当函数结束或对象销毁时，自动重新获取 GIL 以便安全返回 Python 对象。
                                </p>
                            </div>
                            <CodeSnippet language="cpp" title="long_computation.cpp" code={`void heavy_computation() {
    // 构造时释放 GIL，允许其他 Python 线程并发运行
    py::gil_scoped_release release;

    // ... 执行耗时 10秒 的纯 C++ 计算 ...
    // 注意：在此期间不能调用任何 Python C API
    do_complex_math();

} // 函数结束，release 对象析构，自动重新获取 GIL`} />
                        </div>
                    </div>

                    {/* 2. Object Ownership */}
                    <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200">
                        <h3 className="font-serif text-2xl text-stone-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-nobel-gold text-white text-sm font-sans font-bold rounded-lg shadow-sm"><Trash2 size={16}/></span>
                            对象生命周期与所有权
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div>
                                <p className="text-stone-600 mb-4 leading-relaxed">
                                    <strong>问题：</strong> 当 C++ 返回指针时，Python 不知道它是否应该负责释放该对象的内存。错误的策略会导致<strong>内存泄漏</strong>（没人释放）或<strong>双重释放</strong>（C++ 和 Python 都尝试释放）。
                                </p>
                                <ul className="space-y-3 text-sm text-stone-600">
                                    <li className="flex items-start gap-2">
                                        <span className="font-mono text-xs bg-stone-200 px-1 rounded text-stone-800 mt-0.5">reference</span>
                                        <span><strong>C++ 拥有所有权：</strong> 适用于返回单例、静态变量或内部成员。Python 只是借用，不会调用 delete。</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-mono text-xs bg-stone-200 px-1 rounded text-stone-800 mt-0.5">take_ownership</span>
                                        <span><strong>Python 接管所有权：</strong> 适用于工厂函数返回的 `new` 对象。Python 垃圾回收时会调用 C++ 析构函数。</span>
                                    </li>
                                </ul>
                            </div>
                            <CodeSnippet language="cpp" title="ownership.cpp" code={`// 场景 1: 单例 (C++ 管理内存)
MyObj* get_singleton() { return &global_instance; }

// 场景 2: 工厂 (移交内存给 Python)
MyObj* create_obj() { return new MyObj(); }

PYBIND11_MODULE(example, m) {
    // 使用 reference，防止 Python 销毁静态对象
    m.def("get_singleton", &get_singleton, 
          py::return_value_policy::reference);

    // 使用 take_ownership，让 Python 负责 delete
    m.def("create_obj", &create_obj, 
          py::return_value_policy::take_ownership);
}`} />
                        </div>
                    </div>

                    {/* 3. Virtual Functions */}
                    <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200">
                        <h3 className="font-serif text-2xl text-stone-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-nobel-gold text-white text-sm font-sans font-bold rounded-lg shadow-sm"><Split size={16}/></span>
                            虚函数重载 (Trampolines)
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div>
                                <p className="text-stone-600 mb-4 leading-relaxed">
                                    <strong>问题：</strong> 普通的绑定无法让 Python 类继承 C++ 类并重写虚函数。因为 C++ 虚表 (vtable) 不知道 Python 方法的存在。
                                </p>
                                <p className="text-stone-600 leading-relaxed mb-4">
                                    <strong>解决方案：</strong> 定义一个“跳板类 (Trampoline)”，继承自 C++ 基类。它实现 C++ 虚函数，在其中查找并调用对应的 Python 方法。
                                </p>
                                <div className="text-xs text-stone-500 bg-white p-3 rounded border border-stone-200">
                                    <strong className="text-stone-700">开销提示：</strong> 
                                    每次虚函数调用都需要在 C++ 和 Python 运行时之间切换，有一定的性能损耗。
                                </div>
                            </div>
                            <div className="space-y-2">
                                <CodeSnippet language="cpp" title="trampoline.cpp" code={`class Animal {
public:
    virtual std::string go(int n_times) = 0; // 纯虚函数
    virtual ~Animal() = default;
};

// 跳板类
class PyAnimal : public Animal {
public:
    // 继承基类构造函数
    using Animal::Animal; 

    // 重写虚函数，转发给 Python
    std::string go(int n_times) override {
        PYBIND11_OVERRIDE_PURE(
            std::string, /* 返回类型 */
            Animal,      /* 基类名称 */
            go,          /* 函数名称 */
            n_times      /* 参数 */
        );
    }
};

PYBIND11_MODULE(example, m) {
    // 注意这里注册的是 Animal 和 PyAnimal
    py::class_<Animal, PyAnimal>(m, "Animal")
        .def(py::init<>())
        .def("go", &Animal::go);
}`} />
                            </div>
                        </div>
                    </div>

                </div>
             </div>
        </section>

      </main>

      <footer className="bg-stone-900 text-stone-400 py-16">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
                <div className="text-white font-serif font-bold text-2xl mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-nobel-gold rounded-sm inline-block"></div> pybind11
                </div>
                <p className="text-sm text-stone-500">Seamless operability between C++11 and Python.</p>
            </div>
            <div className="flex gap-6 text-sm">
                <a href="https://github.com/pybind/pybind11" className="hover:text-white transition-colors">GitHub</a>
                <a href="https://pybind11.readthedocs.io/" className="hover:text-white transition-colors">Documentation</a>
                <a href="https://pypi.org/project/pybind11/" className="hover:text-white transition-colors">PyPI</a>
            </div>
        </div>
        <div className="text-center mt-12 text-xs text-stone-600 border-t border-stone-800 pt-8">
            pybind11 is an open source project provided under a BSD-style license. <br/>
            Page design inspired by AlphaQubit research page.
        </div>
      </footer>
    </div>
  );
};

export default App;
