import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, ArrowUp, ArrowDown, X, Download, Loader2 } from 'lucide-react';

function App() {
  const [files, setFiles] = useState([]);
  // Default status is 'merged_file'
  const [outputName, setOutputName] = useState('merged_file');
  
  // STATUS STATES
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | downloading | done
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setFiles(newFiles);
  };

  const moveDown = (index) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
    setFiles(newFiles);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length === 0) return alert("Please select files first.");
    
    // LOGIC: If name is empty/whitespace, default to 'merged_file'
    const finalName = outputName.trim() || 'merged_file';

    setStatus('uploading');
    setProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('output_filename', finalName);

    try {
      const response = await axios.post('http://localhost:8000/merge', formData, {
        responseType: 'blob',
        
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
          if (percent === 100) {
            setStatus('processing');
          }
        },

        onDownloadProgress: (progressEvent) => {
          setStatus('downloading');
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Use the computed finalName here for the download
      link.setAttribute('download', `${finalName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setStatus('done');
      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
      }, 2000);

    } catch (error) {
      console.error("Error merging files", error);
      alert("Failed to merge PDFs.");
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex justify-center items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            PDF Merger Tool
          </h1>
          <p className="text-gray-500 mt-2">Merge, Reorder and Rename</p>
        </div>

        {/* Upload Area */}
        <div className="mb-6">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-gray-500 font-semibold">Click to upload PDFs</p>
            </div>
            <input type="file" className="hidden" multiple accept="application/pdf" onChange={handleFileChange} />
          </label>
        </div>

        {/* File List */}
        <div className="space-y-3 mb-8">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-md border border-gray-200">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">PDF</div>
                <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => moveUp(index)} className="p-1 hover:bg-gray-300 rounded disabled:opacity-30" disabled={index === 0}><ArrowUp size={16} /></button>
                <button onClick={() => moveDown(index)} className="p-1 hover:bg-gray-300 rounded disabled:opacity-30" disabled={index === files.length - 1}><ArrowDown size={16} /></button>
                <button onClick={() => removeFile(index)} className="p-1 text-red-500 hover:bg-red-100 rounded"><X size={16} /></button>
              </div>
            </div>
          ))}
          {files.length === 0 && <p className="text-center text-gray-400 text-sm">No files selected yet.</p>}
        </div>

        {/* Settings Area */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">Output Filename</label>
          <input 
            type="text" 
            value={outputName} 
            onChange={(e) => setOutputName(e.target.value)} 
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="merged_file" 
          />
        </div>

        {/* Progress Bar */}
        {status !== 'idle' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex justify-between text-sm font-bold text-blue-800 mb-2">
              <span className="flex items-center gap-2">
                {status === 'processing' && <Loader2 className="animate-spin h-4 w-4" />}
                {status === 'uploading' && "Uploading files..."}
                {status === 'processing' && "Merging PDF (Please wait)..."}
                {status === 'downloading' && "Downloading..."}
                {status === 'done' && "Done!"}
              </span>
              <span>{status === 'processing' ? '' : `${progress}%`}</span>
            </div>
            
            <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
              {status === 'processing' ? (
                <div className="h-full bg-blue-600 animate-pulse w-full origin-left"></div>
              ) : (
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              )}
            </div>
          </div>
        )}

        <button 
          onClick={handleMerge} 
          disabled={files.length === 0 || status !== 'idle'}
          className={`w-full py-3 rounded-lg text-white font-bold flex justify-center items-center gap-2 transition
            ${files.length === 0 || status !== 'idle' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}
          `}
        >
          {status !== 'idle' ? (
            <span>Processing...</span>
          ) : (
            <>
              <Download size={20} /> Merge Files
            </>
          )}
        </button>

      </div>
    </div>
  );
}

export default App;