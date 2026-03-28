import React, { useState, useCallback } from 'react';
import { analyzeDocument } from './services/geminiService';
import { extractTextFromPDF } from './services/pdfService';
import type { AnalysisResult, CustomCategory } from './types';
import ApiKeyInput from './components/ApiKeyInput';
import FileUpload from './components/FileUpload';
import SummaryTable from './components/SummaryTable';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import ModelSelector from './components/ModelSelector';
import CustomCategories from './components/CustomCategories';
import { SparklesIcon } from './components/icons/SparklesIcon';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);

  const handleFileChange = (files: File[]) => {
    setSelectedFiles(files);
    setAnalysisResults([]);
    setError(null);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setError('Please upload at least one PDF file first.');
      return;
    }
    if (!apiKey) {
      setError('Please enter your Google Gemini API key.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResults([]);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setLoadingMessage(`Analyzing "${file.name}" (${i + 1} of ${selectedFiles.length})...`);
      
      try {
        const fileReader = new FileReader();
        const fileReadPromise = new Promise<Uint8Array>((resolve, reject) => {
          fileReader.onload = (e) => {
            if (e.target?.result) {
              resolve(new Uint8Array(e.target.result as ArrayBuffer));
            } else {
              reject(new Error('Failed to read file.'));
            }
          };
          fileReader.onerror = () => reject(new Error('Error reading the file.'));
          fileReader.readAsArrayBuffer(file);
        });

        const pdfData = await fileReadPromise;
        const text = await extractTextFromPDF(pdfData);
        const result = await analyzeDocument(apiKey, selectedModel, text, customCategories);
        
        setAnalysisResults(prev => [...prev, { fileName: file.name, data: result }]);

      } catch (err: any) {
        setAnalysisResults(prev => [...prev, { fileName: file.name, error: err.message }]);
      }
    }

    setIsLoading(false);
    setLoadingMessage('');
  }, [apiKey, selectedFiles, selectedModel, customCategories]);


  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Intelligent Document Analyzer
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Upload research papers to automatically extract topics, methodologies, and conclusions.
          </p>
        </header>

        <main className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700">
          <div className="space-y-6">
            <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
            <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
            <CustomCategories customCategories={customCategories} setCustomCategories={setCustomCategories} />
            <FileUpload onFileChange={handleFileChange} selectedFiles={selectedFiles} />
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleAnalyzeClick}
              disabled={isLoading || selectedFiles.length === 0 || !apiKey}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              {selectedFiles.length > 1 ? 'Analyze Documents' : 'Analyze Document'}
            </button>
          </div>
        </main>
        
        <div className="mt-8 w-full max-w-4xl mx-auto space-y-8">
          {isLoading && <Loader message={loadingMessage} />}
          {error && !isLoading && analysisResults.length === 0 && <ErrorMessage message={error} />}
          
          {!isLoading && analysisResults.map((result) => (
             <div key={result.fileName} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-700">
                <h2 className="text-xl font-bold text-cyan-400 mb-4 truncate" title={result.fileName}>
                  {result.fileName}
                </h2>
                {result.error && <ErrorMessage message={result.error} />}
                {result.data && <SummaryTable data={result.data} fileName={result.fileName}/>}
             </div>
          ))}
        </div>
        
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;