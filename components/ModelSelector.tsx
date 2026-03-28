
import React from 'react';

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, setSelectedModel }) => {
  const models = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
    // In the future, other compatible models can be added here.
  ];

  return (
    <div>
      <label htmlFor="modelSelector" className="block text-sm font-medium text-slate-300 mb-2">
        Select AI Model
      </label>
      <select
        id="modelSelector"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector;
