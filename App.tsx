import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { FileEditor } from './components/FileEditor';
import { CodeBlock } from './components/CodeBlock';
import { TaskType, INITIAL_JSON, INITIAL_PHP_FUNCTIONS, INITIAL_PHP_INDEX } from './constants';
import { generateUpdates, GeneratedCodeResult } from './services/geminiService';
import { Zap, Loader2, AlertCircle } from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is missing");
}

console.log("Gemini key:", import.meta.env.VITE_GEMINI_API_KEY);

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>(TaskType.ADD_FAQ);
  
  // Input States
  const [jsonContent, setJsonContent] = useState<string>(INITIAL_JSON);
  const [functionsContent, setFunctionsContent] = useState<string>(INITIAL_PHP_FUNCTIONS);
  const [indexContent, setIndexContent] = useState<string>(INITIAL_PHP_INDEX);
  const [instructions, setInstructions] = useState<string>('');

  // Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedCodeResult | null>(null);

  const handleGenerate = async () => {
    if (!instructions.trim()) {
      setError("Please provide instructions before generating code.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      const generated = await generateUpdates({
        taskType,
        instructions,
        jsonContent,
        functionsContent,
        indexContent
      });
      setResults(generated);
    } catch (err) {
      const message = (err as any)?.message ?? String(err) ?? "Failed to generate code. Please check your API key and try again.";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      <Sidebar 
        currentTask={taskType} 
        onTaskChange={setTaskType} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-20">
          <div className="md:ml-0 ml-10">
            <h2 className="text-xl font-bold text-slate-800">{taskType}</h2>
            <p className="text-sm text-slate-500">Provide your files and instructions below.</p>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
               <Zap size={14} className="fill-blue-700" />
               Powered by Gemini
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* File Upload Zone */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Source Files</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[300px]">
              <FileEditor 
                label="Data File" 
                fileName="data.json" 
                content={jsonContent} 
                onChange={setJsonContent} 
              />
              <FileEditor 
                label="Functions" 
                fileName="functions.php" 
                content={functionsContent} 
                onChange={setFunctionsContent} 
              />
              <FileEditor 
                label="Index Page" 
                fileName="index.php" 
                content={indexContent} 
                onChange={setIndexContent} 
              />
            </div>
          </section>

          {/* Instructions Input */}
          <section className="space-y-4">
             <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Instructions</h3>
             <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-200">
               <textarea
                 value={instructions}
                 onChange={(e) => setInstructions(e.target.value)}
                 placeholder="E.g., Add a new FAQ item about 'Return Policy' with the answer 'You can return items within 30 days.'..."
                 className="w-full h-32 p-4 text-slate-700 placeholder-slate-400 focus:outline-none resize-none rounded-md"
               />
             </div>
          </section>

          {/* Action Area */}
          <section className="flex flex-col items-center justify-center py-2 sticky bottom-0 bg-gradient-to-t from-slate-100 to-transparent pb-6 z-10">
             {error && (
               <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-md border border-red-200 text-sm">
                 <AlertCircle size={16} />
                 {error}
               </div>
             )}
             
             <button
               onClick={handleGenerate}
               disabled={isProcessing}
               className={`
                 group relative flex items-center justify-center gap-3 px-8 py-4 
                 bg-blue-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:bg-blue-700 
                 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95
                 w-full sm:w-auto min-w-[300px]
               `}
             >
               {isProcessing ? (
                 <>
                   <Loader2 className="animate-spin" />
                   Processing Updates...
                 </>
               ) : (
                 <>
                   <Zap className="fill-white" />
                   Generate Updated Code
                 </>
               )}
             </button>
          </section>

          {/* Results Display */}
          {results && (
            <section className="space-y-6 pt-4 border-t border-slate-300 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">✓</span>
                Generated Results
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                <CodeBlock 
                  title="Updated JSON Code" 
                  language="json"
                  content={results.updatedJson} 
                />
                <CodeBlock 
                  title="Updated PHP Functions" 
                  language="php"
                  content={results.updatedFunctions} 
                />
                <CodeBlock 
                  title="Updated Page Code" 
                  language="php"
                  content={results.updatedIndex} 
                />
              </div>
            </section>
          )}

          {/* Spacer for sticky button at bottom */}
          <div className="h-12"></div>
        </div>
      </main>
    </div>
  );
};

export default App;