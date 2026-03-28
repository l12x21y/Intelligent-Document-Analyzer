import React from 'react';
import type { SummaryItem } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface SummaryTableProps {
  data: SummaryItem[];
  fileName: string;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ data, fileName }) => {

  const handleExport = () => {
    const headers = ['Category', 'Summary', 'Evidence'];
    
    const escapeCsvCell = (cell: string) => {
      const str = String(cell).replace(/"/g, '""');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str}"`;
      }
      return str;
    };
    
    const rows = data.map(item => [
      escapeCsvCell(item.category),
      escapeCsvCell(item.summary),
      escapeCsvCell(item.evidence),
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const csvFileName = `${fileName.replace(/\.pdf$/i, '')}_summary.csv`;
    link.setAttribute("download", csvFileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 bg-slate-600 text-slate-200 text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Export as CSV
        </button>
      </div>
      <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-1/4">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-1/2">
                Summary
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-1/2">
                Evidence from Text
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-400 align-top">{item.category}</td>
                <td className="px-6 py-4 text-sm text-slate-300 align-top">
                  {item.category === 'Abstract' && <span className="block text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Translation (Chinese)</span>}
                  {item.summary}
                </td>
                <td className="px-6 py-4 text-sm text-slate-400 italic align-top">
                  {item.category === 'Abstract' && <span className="block text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider not-italic">Original</span>}
                  "{item.evidence}"
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryTable;