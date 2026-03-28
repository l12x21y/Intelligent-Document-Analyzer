
import React from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey }) => {
  return (
    <div>
      <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
        Google Gemini API Key
      </label>
      <input
        id="apiKey"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter your API key here"
        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
      />
    </div>
  );
};

export default ApiKeyInput;
