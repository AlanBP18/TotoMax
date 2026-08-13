import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';

const LOCAL_STORAGE_KEY = 'totomax_media_history';

// Sample initial history data for immediate UI richness
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
  },
  {
    id: 'hist_2',
    title: 'Lo-Fi Chill Beats for Coding Session',
    url: 'https://youtube.com/watch?v=sample2',
    format: 'mp3',
    quality: '320kbps',
    download_type: 'audio',
    mode: 'clip',
    start_time: '00:05:00',
    end_time: '00:15:00',
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];

export default function App() {
  const [urlInput, setUrlInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [videoData, setVideoData] = useState(null);

  // Download simulation state
  const [downloadStatus, setDownloadStatus] = useState('idle'); // 'idle' | 'downloading' | 'completed' | 'error'
  const [progressData, setProgressData] = useState({ percentage: 0, speed: '14.2 MB/s', eta: '5 seg', downloaded_bytes: '0 MB' });
  const [completedFile, setCompletedFile] = useState(null);

  // History state saved in localStorage (max 9 links)
  const [historyItems, setHistoryItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : DEFAULT_HISTORY;
      return Array.isArray(parsed) ? parsed.slice(0, 9) : DEFAULT_HISTORY.slice(0, 9);
    } catch (e) {
      return DEFAULT_HISTORY.slice(0, 9);
    }
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Save history to localStorage whenever it changes (max 9 links)
  useEffect(() => {
    try {
      const capped = historyItems.slice(0, 9);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(capped));
    } catch (e) {
      console.error('Error al guardar historial en localStorage:', e);
    }
  }, [historyItems]);

  // Simulate Metadata Fetching (with fallback to backend if available)
  const handleFetchMetadata = async (url) => {
    setIsFetching(true);
    setVideoData(null);
    setDownloadStatus('idle');
    setCompletedFile(null);

    // Check if backend API is reachable, else fallback to instant simulation
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch('/api/fetch-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setVideoData(json.data);
        setIsFetching(false);
        return;
      }
    } catch (e) {
      // API unavailable or timed out -> Proceed with realistic client-side simulation
    }

    // Client-side metadata simulation
    setTimeout(() => {
      let simulatedTitle = 'Video multimedia extraído de la URL';
      let durationSec = 345;
      let durationStr = '05:45';
      let thumbUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';

      const ytMatch = url.match(/^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/);
      const ytId = ytMatch && ytMatch[1] && ytMatch[1].length === 11 ? ytMatch[1] : null;

      if (ytId) {
        thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }

      if (url.includes('shorts')) {
        simulatedTitle = 'YouTube Short Animado';
        durationSec = 14;
        durationStr = '00:14';
      } else if (url.includes('youtube') || url.includes('youtu.be')) {
        simulatedTitle = 'Demostración de Conferencia e Inteligencia Artificial 4K';
      } else if (url.includes('vimeo')) {
        simulatedTitle = 'Cortometraje Cinematográfico HD - Documental';
      } else if (url.includes('twitter') || url.includes('x.com')) {
        simulatedTitle = 'Clip viral sobre avances tecnológicos';
      }

      setVideoData({
        url,
        title: simulatedTitle,
        author: ytId ? 'YouTube' : 'Canal Oficial TotoMax',
        duration_seconds: durationSec,
        duration_formatted: durationStr,
        thumbnail: thumbUrl
      });
      setIsFetching(false);
    }, 1200);
  };

  // Simulate Download Progress with setInterval
  const handleStartDownload = (options) => {
    setDownloadStatus('downloading');
    setProgressData({ percentage: 0, speed: '12.8 MB/s', eta: '6 seg', downloaded_bytes: '0 MB / 42.5 MB' });
    setCompletedFile(null);

    let currentPercent = 0;
    const interval = setInterval(() => {
      currentPercent += Math.floor(Math.random() * 15) + 10;
      if (currentPercent >= 100) {
        currentPercent = 100;
        clearInterval(interval);

        const newFile = {
          id: 'hist_' + Date.now(),
          title: options.title || 'Archivo multimedia descargado',
          url: options.url,
          format: options.format,
          quality: options.quality,
          download_type: options.download_type,
          mode: options.mode,
          start_time: options.start_time,
          end_time: options.end_time,
          timestamp: new Date().toISOString(),
          download_url: '#'
        };

        setCompletedFile(newFile);
        setDownloadStatus('completed');

        // Add to history in localStorage (max 9 items)
        setHistoryItems((prev) => [newFile, ...prev].slice(0, 9));
      } else {
        const bytes = ((currentPercent / 100) * 42.5).toFixed(1);
        const remSec = Math.ceil((100 - currentPercent) / 20);
        setProgressData({
          percentage: currentPercent,
          speed: `${(10 + Math.random() * 5).toFixed(1)} MB/s`,
          eta: `${remSec} seg`,
          downloaded_bytes: `${bytes} MB / 42.5 MB`
        });
      }
    }, 400);
  };

  const handleNewDownload = () => {
    setUrlInput('');
    setVideoData(null);
    setDownloadStatus('idle');
    setCompletedFile(null);
  };

  const handleDeleteHistory = (id) => {
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectHistoryItem = (item) => {
    setUrlInput(item.url || '');
    handleFetchMetadata(item.url || 'https://youtube.com');
  };

  return (
    <div className="app-container">
      <Sidebar
        historyItems={historyItems}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewDownload={handleNewDownload}
        onDeleteHistory={handleDeleteHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
      />
      <MainPanel
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        isFetching={isFetching}
        videoData={videoData}
        onFetchMetadata={handleFetchMetadata}
        onStartDownload={handleStartDownload}
        downloadStatus={downloadStatus}
        progressData={progressData}
        completedFile={completedFile}
        onNewDownload={handleNewDownload}
      />
    </div>
  );
}
