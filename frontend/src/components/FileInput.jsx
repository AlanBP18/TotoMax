import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

export default function FileInput({ onFileLoaded }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files[0]);
    }
  };

  const handleFiles = (file) => {
    const blobUrl = URL.createObjectURL(file);
    onFileLoaded(file, blobUrl, file.name);
  };

  return (
    <div 
      className={`file-drop-container ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input-hidden').click()}
    >
      <input 
        id="file-input-hidden"
        type="file" 
        accept="video/*,audio/*" 
        onChange={handleFileChange} 
        style={{ display: 'none' }}
      />
      <UploadCloud 
        size={36} 
        style={{ 
          color: isDragging ? 'var(--accent-green)' : 'var(--text-muted)', 
          transition: 'color var(--transition-fast)' 
        }} 
      />
      <h3 className="file-drop-title">Arrastra y suelta tu archivo aquí</h3>
      <p className="file-drop-subtitle">o haz clic para explorar tus archivos locales</p>
      <p className="file-drop-formats">Soporta formatos de audio y video como MP4, MP3, WAV, WebM y M4A</p>
    </div>
  );
}
