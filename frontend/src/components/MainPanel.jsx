import React from 'react';
import { ShieldCheck } from 'lucide-react';
import UrlInput from './UrlInput';
import MediaConfig from './MediaConfig';
import ProgressBar from './ProgressBar';
import SkeletonLoader from './SkeletonLoader';

export default function MainPanel({
  urlInput,
  setUrlInput,
  isFetching,
  videoData,
  onFetchMetadata,
  onStartDownload,
  downloadStatus,
  progressData,
  completedFile,
  onNewDownload
}) {
  return (
    <main className="main-panel">
      {/* Header */}
      <header className="main-header">
        <div className="brand-title">
          <img src="/logo.png" alt="TotoMax Logo" style={{ height: '28px', objectFit: 'contain' }} />
          <span>TotoMax Media Downloader</span>
          <span className="brand-badge">SPA Netlify</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c5c5d2' }}>
          <ShieldCheck size={16} style={{ color: '#10a37f' }} />
          <span>Cliente Estático</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="main-content">
        {/* Hero Section if idle */}
        {!videoData && !isFetching && (
          <div className="hero-section">
            <div className="hero-icon" style={{ background: 'transparent', border: 'none' }}>
              <img src="/logo.png" alt="TotoMax Logo" style={{ height: '48px', objectFit: 'contain' }} />
            </div>
            <h1 className="hero-title">¿Qué enlace deseas descargar o recortar hoy?</h1>
            <p className="hero-subtitle">
              Pega cualquier URL de video o audio para extraer metadatos, seleccionar resoluciones o recortar fragmentos específicos con precisión.
            </p>
          </div>
        )}

        {/* ChatGPT Style URL Input Bar */}
        <UrlInput
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          onFetchMetadata={onFetchMetadata}
          isFetching={isFetching}
        />

        {/* Metadata Skeleton Loader */}
        {isFetching && <SkeletonLoader />}

        {/* Metadata Config Card */}
        {videoData && downloadStatus === 'idle' && (
          <MediaConfig
            videoData={videoData}
            onStartDownload={onStartDownload}
            downloadStatus={downloadStatus}
          />
        )}

        {/* Real-time Progress Bar or Completion Status */}
        {(downloadStatus === 'downloading' || downloadStatus === 'completed') && (
          <ProgressBar
            progressData={progressData}
            downloadStatus={downloadStatus}
            completedFile={completedFile}
            onNewDownload={onNewDownload}
          />
        )}
      </div>
    </main>
  );
}
