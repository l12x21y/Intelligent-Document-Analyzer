import React, { useRef } from 'react';
import { PaperClipIcon } from './icons/PaperClipIcon';

interface FileUploadProps {
  onFileChange: (files: File[]) => void;
  selectedFiles: File[];
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, selectedFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    onFileChange(files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Upload PDF Documents
      </label>
      <div
        className="flex justify-center items-center w-full px-6 py-10 border-2 border-dashed border-slate-600 rounded-md cursor-pointer hover:border-purple-500 hover:bg-slate-700/50 transition-colors"
        onClick={handleClick}
      >
        <div className="text-center">
          <PaperClipIcon className="mx-auto h-10 w-10 text-slate-500" />
          <p className="mt-2 text-sm text-slate-400">
            <span className="font-semibold text-purple-400">Click to upload files</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500">PDF files only</p>
          {selectedFiles.length > 0 && (
            <p className="mt-4 text-sm font-medium text-green-400">
              Selected: {selectedFiles.length} file(s)
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FileUpload;