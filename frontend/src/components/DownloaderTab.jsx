import React, { useState } from 'react';
import UrlInput from './UrlInput';
import ProgressBar from './ProgressBar';
import { fetchCobaltDownloadUrl, downloadBlobFromUrl } from '../utils/cobaltApi';

export default function DownloaderTab({ onSendToTrimmer, urlInput, setUrlInput, onAddToHistory }) {
  // Format options
  const [videoQuality, setVideoQuality] = useState('1080');
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [format, setFormat] = useState('mp4');

  const [isFetching, setIsFetching] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('idle'); // 'idle' | 'downloading' | 'completed' | 'error'
  const [progressData, setProgressData] = useState({ percentage: 0, speed: '', eta: '', downloaded_bytes: '' });
  
  const [completedBlob, setCompletedBlob] = useState(null);
  const [completedBlobUrl, setCompletedBlobUrl] = useState(null);
  const [completedFilename, setCompletedFilename] = useState('');

  const handleStartDownload = async (url) => {
    setIsFetching(true);
    setDownloadStatus('downloading');
    setCompletedBlob(null);
    setCompletedBlobUrl(null);
    setProgressData({ percentage: 0, speed: 'Obteniendo enlace directo...', eta: '', downloaded_bytes: '' });

    try {
      const directUrl = await fetchCobaltDownloadUrl({
        url,
        videoQuality,
        audioFormat,
        isAudioOnly,
        format
      });

      const blob = await downloadBlobFromUrl(directUrl, (percent, msg) => {
        setProgressData({
          percentage: percent,
          speed: msg,
          eta: 'Procesando...',
          downloaded_bytes: `${Math.round(percent)}%`
        });
      });

      const ext = isAudioOnly ? audioFormat.replace('best', 'm4a') : format;
      const title = url.split('/').pop().substring(0, 15) || 'media';
      const filename = `TotoMax_${title}.${ext}`;
      
      const blobUrl = URL.createObjectURL(blob);
      setCompletedBlob(blob);
      setCompletedBlobUrl(blobUrl);
      setCompletedFilename(filename);

      setDownloadStatus('completed');
      setProgressData({ percentage: 100, speed: 'Completado', eta: '0 seg', downloaded_bytes: 'Listo' });

      // ponytail: add item to history
      if (onAddToHistory) {
        onAddToHistory({
          title: filename,
          url: url,
          format: ext,
          quality: isAudioOnly ? 'Audio' : `${videoQuality}p`,
          download_type: isAudioOnly ? 'audio' : 'video'
        });
      }

    } catch (err) {
      console.error(err);
      setDownloadStatus('error');
      setProgressData({ percentage: 0, speed: 'Error', eta: '', downloaded_bytes: err.message });
    } finally {
      setIsFetching(false);
    }
  };

  const handleNewDownload = () => {
    setUrlInput('');
    setDownloadStatus('idle');
    setCompletedBlob(null);
    setCompletedBlobUrl(null);
  };

  const handleSaveToDisk = () => {
    if (!completedBlobUrl) return;
    const link = document.createElement('a');
    link.href = completedBlobUrl;
    link.download = completedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="hero-section">
        <h1 className="hero-title">Descarga medios de cualquier red social</h1>
        <p className="hero-subtitle">
          Usa la API de Cobalt para descargar sin intermediarios, a máxima velocidad.
        </p>
      </div>

      <UrlInput
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        videoQuality={videoQuality}
        setVideoQuality={setVideoQuality}
        audioFormat={audioFormat}
        setAudioFormat={setAudioFormat}
        isAudioOnly={isAudioOnly}
        setIsAudioOnly={setIsAudioOnly}
        format={format}
        setFormat={setFormat}
        onFetchMetadata={handleStartDownload}
        isFetching={isFetching}
      />

      {(downloadStatus === 'downloading' || downloadStatus === 'completed' || downloadStatus === 'error') && (
        <div style={{ marginTop: '16px' }}>
            <ProgressBar
              progressData={progressData}
              downloadStatus={downloadStatus}
              completedFile={completedBlob ? { title: completedFilename } : null}
              onNewDownload={handleNewDownload}
            />

            {downloadStatus === 'completed' && completedBlob && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={handleSaveToDisk}>
                  Guardar en Disco Local
                </button>
                <button className="btn-secondary" onClick={() => onSendToTrimmer(completedBlob, completedFilename)}>
                  Enviar a Recortador ➔
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
