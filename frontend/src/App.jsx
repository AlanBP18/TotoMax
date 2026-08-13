import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';

const LOCAL_STORAGE_KEY = 'totomax_media_history';

const DEFAULT_HISTORY = [
  {
    id: 'hist_1',
    title: 'OpenAI DevDay Keynote 2024 Highlights',
    url: 'https://youtube.com/watch?v=sample1',
    format: 'mp4',
    quality: '1080p',
    download_type: 'video',
    mode: 'full',
    timestamp: new Date().toISOString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('downloader');
  const [urlInput, setUrlInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });

  // History state
  const [historyItems, setHistoryItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : DEFAULT_HISTORY;
      return Array.isArray(parsed) ? parsed.slice(0, 9) : DEFAULT_HISTORY;
    } catch (e) {
      return DEFAULT_HISTORY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(historyItems.slice(0, 9)));
    } catch (e) {
      console.error(e);
    }
  }, [historyItems]);

  const handleAddToHistory = (item) => {
    const newItem = {
      id: 'hist_' + Date.now(),
      title: item.title,
      url: item.url,
      format: item.format,
      quality: item.quality,
      download_type: item.download_type,
      mode: item.mode || 'full',
      timestamp: new Date().toISOString()
    };
    setHistoryItems(prev => [newItem, ...prev].slice(0, 9));
  };

  const handleDeleteHistory = (id) => {
    setHistoryItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSelectHistoryItem = (item) => {
    setUrlInput(item.url || '');
    setActiveTab('downloader');
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`app-container ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        historyItems={historyItems}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewDownload={() => {
          setUrlInput('');
          setActiveTab('downloader');
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }}
        onDeleteHistory={handleDeleteHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
      />
      <MainPanel 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        onAddToHistory={handleAddToHistory}
      />
    </div>
  );
}
