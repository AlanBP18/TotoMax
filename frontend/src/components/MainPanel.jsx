import React, { useState } from 'react';
import DownloaderTab from './DownloaderTab';
import TrimmerTab from './TrimmerTab';
import { Download, Scissors, ShieldCheck, PanelLeft } from 'lucide-react';

export default function MainPanel({ 
  sidebarOpen,
  setSidebarOpen,
  activeTab, 
  setActiveTab,
  urlInput,
  setUrlInput,
  onAddToHistory
}) {
  const [importedBlob, setImportedBlob] = useState(null);
  const [importedFilename, setImportedFilename] = useState('');

  const handleSendToTrimmer = (blob, filename) => {
    setImportedBlob(blob);
    setImportedFilename(filename);
    setActiveTab('trimmer');
  };

  return (
    <main className="main-panel">
      {/* Header */}
      <header className="main-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {!sidebarOpen && (
            <button 
              type="button" 
              className="sidebar-toggle" 
              onClick={() => setSidebarOpen(true)}
              title="Mostrar barra lateral"
              style={{ marginRight: '12px' }}
            >
              <PanelLeft size={18} />
            </button>
          )}
          <div className="brand-title">
            <img src="/logo.png" alt="TotoMax Logo" style={{ height: '24px', objectFit: 'contain' }} />
            <span>TotoMax Media</span>
            <span className="brand-badge">Client API</span>
          </div>
        </div>
        
        {/* Tabs Navigation (Pill Selector) */}
        <div className="tabs-pill-container">
          <button
            type="button"
            className={`tab-pill ${activeTab === 'downloader' ? 'active' : ''}`}
            onClick={() => setActiveTab('downloader')}
          >
            <Download size={14} />
            <span>Descargar URL</span>
          </button>
          <button
            type="button"
            className={`tab-pill ${activeTab === 'trimmer' ? 'active' : ''}`}
            onClick={() => setActiveTab('trimmer')}
          >
            <Scissors size={14} />
            <span>Recortar Medios</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={14} style={{ color: 'var(--accent-green)' }} />
          <span>Local Safe</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="main-content">
        {activeTab === 'downloader' ? (
          <DownloaderTab 
            onSendToTrimmer={handleSendToTrimmer}
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            onAddToHistory={onAddToHistory}
          />
        ) : (
          <TrimmerTab 
            importedBlob={importedBlob} 
            importedFilename={importedFilename} 
            onAddToHistory={onAddToHistory}
          />
        )}
      </div>
    </main>
  );
}
