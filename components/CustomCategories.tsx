import React, { useState, useRef } from 'react';
import type { CustomCategory } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { UploadIcon } from './icons/UploadIcon';

// This assumes XLSX is available globally from the CDN script in index.html
declare const XLSX: any;

interface CustomCategoriesProps {
  customCategories: CustomCategory[];
  setCustomCategories: (categories: CustomCategory[]) => void;
}

const CustomCategories: React.FC<CustomCategoriesProps> = ({ customCategories, setCustomCategories }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDef, setNewCategoryDef] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCategory = () => {
    setError(null);
    if (!newCategoryName.trim() || !newCategoryDef.trim()) {
      setError('Both category name and definition are required.');
      return;
    }
    if (customCategories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      setError('This category name already exists.');
      return;
    }
    setCustomCategories([...customCategories, { name: newCategoryName.trim(), definition: newCategoryDef.trim() }]);
    setNewCategoryName('');
    setNewCategoryDef('');
  };

  const handleRemoveCategory = (name: string) => {
    setCustomCategories(customCategories.filter(c => c.name !== name));
  };
  
  const handleXlsxUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const newCategories: CustomCategory[] = [];
        const existingNames = new Set(customCategories.map(c => c.name.toLowerCase()));

        // Skip header row by starting at index 1
        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            const name = row[0] ? String(row[0]).trim() : '';
            const definition = row[1] ? String(row[1]).trim() : '';

            if (name && definition && !existingNames.has(name.toLowerCase())) {
                newCategories.push({ name, definition });
                existingNames.add(name.toLowerCase()); // Add to set to handle duplicates within the file
            }
        }

        if (newCategories.length > 0) {
            setCustomCategories([...customCategories, ...newCategories]);
        } else {
            setError("No valid new categories found in the file. Ensure the file has two columns (Name, Definition) with data starting from the second row.");
        }
      } catch (err) {
        console.error("Error parsing XLSX file:", err);
        setError("Failed to parse the XLSX file. Please check the file format.");
      } finally {
        // Reset file input to allow re-uploading the same file
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
        setError("Error reading the file.");
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="bg-slate-700/50 rounded-lg border border-slate-600">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left font-medium text-slate-300 hover:bg-slate-700 transition"
        aria-expanded={isOpen}
      >
        <span>Custom Analysis Categories (Optional)</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-600 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category Name (e.g., 'Limitations')"
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              value={newCategoryDef}
              onChange={(e) => setNewCategoryDef(e.target.value)}
              placeholder="Definition (e.g., 'Author's stated limitations')"
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleAddCategory}
              className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:bg-slate-500"
              disabled={!newCategoryName.trim() || !newCategoryDef.trim()}
            >
              Add Category
            </button>
             <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx"
                onChange={handleXlsxUpload}
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-slate-600 text-slate-200 font-semibold rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
            >
                <UploadIcon className="w-5 h-5 mr-2" />
                Upload from XLSX
            </button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          
          {customCategories.length > 0 && (
            <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Added Categories:</h4>
                <ul className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {customCategories.map((cat, index) => (
                        <li key={index} className="flex justify-between items-start p-3 bg-slate-800 rounded-md">
                            <div className="flex-1">
                                <p className="font-semibold text-purple-400">{cat.name}</p>
                                <p className="text-sm text-slate-400">{cat.definition}</p>
                            </div>
                            <button onClick={() => handleRemoveCategory(cat.name)} className="ml-4 p-1 text-slate-500 hover:text-red-400 transition">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomCategories;
