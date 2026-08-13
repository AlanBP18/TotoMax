import React, { useState, useRef, useEffect } from 'react';
import FileInput from './FileInput';
import ProgressBar from './ProgressBar';
import { trimAudio, trimVideo } from '../utils/mediaTrimmer';
import { Scissors } from 'lucide-react';

function formatSeconds(totalSec) {
  if (isNaN(totalSec) || totalSec < 0) return '00:00:00';
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = Math.floor(totalSec % 60);
  return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
}

export default function TrimmerTab({ importedBlob, importedFilename, onAddToHistory }) {
  const [file, setFile] = useState(importedBlob || null);
  const [fileUrl, setFileUrl] = useState(importedBlob ? URL.createObjectURL(importedBlob) : null);
  const [filename, setFilename] = useState(importedFilename || '');
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  const [trimStatus, setTrimStatus] = useState('idle'); // 'idle' | 'downloading' (processing) | 'completed' | 'error'
  const [progressData, setProgressData] = useState({ percentage: 0, speed: '', eta: '', downloaded_bytes: '' });
  
  const videoRef = useRef(null);
  
  const [startTimeSec, setStartTimeSec] = useState(0);
  const [endTimeSec, setEndTimeSec] = useState(30);
  const [videoDurationSec, setVideoDurationSec] = useState(1);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeThumb, setActiveThumb] = useState('start');

  useEffect(() => {
    if (importedBlob) {
      setFile(importedBlob);
      const url = URL.createObjectURL(importedBlob);
      setFileUrl(url);
      setFilename(importedFilename || 'media_importada');
      checkIfAudio(importedBlob, importedFilename || '');
    }
  }, [importedBlob, importedFilename]);

  useEffect(() => {
    setTimeout(() => {
      const mainPanel = document.querySelector('.main-panel');
      if (mainPanel) {
        if (fileUrl) {
          mainPanel.scrollTo({
            top: mainPanel.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          mainPanel.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }
    }, 150);
  }, [fileUrl]);

  useEffect(() => {
    if (trimStatus !== 'idle') {
      setTimeout(() => {
        const mainPanel = document.querySelector('.main-panel');
        if (mainPanel) {
          mainPanel.scrollTo({
            top: mainPanel.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  }, [trimStatus]);

  const checkIfAudio = (blob, name = '') => {
    const fileNameLower = (name || filename || '').toLowerCase();
    if (blob && blob.type.startsWith('audio/')) {
      setIsAudioOnly(true);
    } else if (blob && blob.type.startsWith('video/')) {
      setIsAudioOnly(false);
    } else if (fileNameLower.endsWith('.mp3') || fileNameLower.endsWith('.wav') || fileNameLower.endsWith('.m4a')) {
      setIsAudioOnly(true);
    } else {
      setIsAudioOnly(false);
    }
  };

  const handleFileLoaded = (loadedFile, url, name) => {
    setFile(loadedFile);
    setFileUrl(url);
    setFilename(name);
    checkIfAudio(loadedFile, name);
    setTrimStatus('idle');
    setStartTimeSec(0);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setVideoDurationSec(dur || 1);
      setEndTimeSec(dur || 30);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTimeSec(cur);
      if (cur >= endTimeSec) {
        videoRef.current.pause();
        videoRef.current.currentTime = startTimeSec;
      }
    }
  };

  const handleTrimMedia = async () => {
    if (!file) return;
    setTrimStatus('downloading');
    setProgressData({ percentage: 0, speed: 'Iniciando corte...', eta: '', downloaded_bytes: '' });
    
    try {
      let finalBlob;
      let finalExt;
      
      if (isAudioOnly) {
        finalBlob = await trimAudio(file, startTimeSec, endTimeSec, (pct, msg) => {
          setProgressData({ percentage: pct, speed: msg, eta: '', downloaded_bytes: `${Math.round(pct)}%` });
        });
        finalExt = 'wav';
      } else {
        const result = await trimVideo(videoRef.current, startTimeSec, endTimeSec, (pct, msg) => {
          setProgressData({ percentage: pct, speed: msg, eta: '', downloaded_bytes: `${Math.round(pct)}%` });
        });
        finalBlob = result.blob;
        finalExt = result.ext;
      }
      
      setTrimStatus('completed');
      
      const outFilename = `Recorte_${filename.substring(0, filename.lastIndexOf('.')) || filename}.${finalExt}`;
      const url = URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = outFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Add to history
      if (onAddToHistory) {
        onAddToHistory({
          title: outFilename,
          url: '',
          format: finalExt,
          quality: isAudioOnly ? 'Audio' : 'Clip',
          download_type: isAudioOnly ? 'audio' : 'video',
          mode: 'clip'
        });
      }
      
    } catch (err) {
      console.error(err);
      setTrimStatus('error');
      setProgressData({ percentage: 0, speed: 'Error', eta: '', downloaded_bytes: err.message });
    }
  };

  const handleStartChange = (e) => {
    const val = Number(e.target.value);
    if (val < endTimeSec) {
      setStartTimeSec(val);
      if (videoRef.current) videoRef.current.currentTime = val;
    }
  };

  const handleEndChange = (e) => {
    const val = Number(e.target.value);
    if (val > startTimeSec) {
      setEndTimeSec(val);
      if (videoRef.current) videoRef.current.currentTime = val;
    }
  };

  return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div className="hero-section">
        <h1 className="hero-title">Recortador de Medios</h1>
        <p className="hero-subtitle">
          Edita y recorta tus archivos locales al instante. Todo el procesamiento ocurre de forma local y privada en tu navegador.
        </p>
      </div>

      {!fileUrl && (
        <FileInput onFileLoaded={handleFileLoaded} />
      )}

      {fileUrl && (
        <div className="config-card" style={{ position: 'relative' }}>
          
          {/* Real-time capturing overlay */}
          {trimStatus === 'downloading' && !isAudioOnly && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 15, 15, 0.96)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', gap: '20px',
              zIndex: 100, borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center'
            }}>
              <div className="spinner" style={{ width: '40px', height: '40px', color: 'var(--accent-green)' }} />
              <h3 style={{ margin: 0, fontSize: '18px' }}>Procesando y codificando video...</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', maxWidth: '340px', lineHeight: '1.5' }}>
                Por favor, no cambies de pestaña. El video se reproducirá a velocidad normal durante el proceso de codificación.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <h3 className="meta-title" style={{ wordBreak: 'break-all', fontSize: '15px' }}>{filename}</h3>
              <p className="meta-subtitle">{isAudioOnly ? 'Audio local' : 'Video local'} cargado</p>
            </div>
            <button 
              type="button"
              className="icon-btn" 
              onClick={() => {
                setFileUrl(null);
                setFile(null);
              }} 
              disabled={trimStatus === 'downloading'}
              style={{ border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}
            >
              ✕ Cerrar archivo
            </button>
          </div>

          <div className="video-player-container" style={{ position: 'relative' }}>
            <div className="html5-player-wrapper">
              <video
                ref={videoRef}
                src={fileUrl}
                controls={trimStatus !== 'downloading'}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="video-element"
              />
            </div>
          </div>

          {/* Double Range Slider Section (Single Track) */}
          <div className="double-slider-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              <span>Inicio: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{formatSeconds(startTimeSec)}</strong></span>
              <span>Fin: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{formatSeconds(endTimeSec)}</strong></span>
            </div>

            <div className="double-slider-container">
              {/* Timeline Track */}
              <div className="double-slider-track"></div>

              {/* Range highlight */}
              <div 
                className="double-slider-range"
                style={{
                  left: `${(startTimeSec / videoDurationSec) * 100}%`,
                  width: `${((endTimeSec - startTimeSec) / videoDurationSec) * 100}%`
                }}
              ></div>

              {/* Start Thumb Input */}
              <input 
                type="range" 
                min="0" 
                max={videoDurationSec} 
                step="0.1" 
                value={startTimeSec} 
                onChange={handleStartChange}
                disabled={trimStatus === 'downloading'}
                className="double-slider-input"
                style={{ zIndex: activeThumb === 'start' ? 4 : 3 }}
                onMouseDown={() => setActiveThumb('start')}
                onTouchStart={() => setActiveThumb('start')}
              />

              {/* End Thumb Input */}
              <input 
                type="range" 
                min="0" 
                max={videoDurationSec} 
                step="0.1" 
                value={endTimeSec} 
                onChange={handleEndChange}
                disabled={trimStatus === 'downloading'}
                className="double-slider-input"
                style={{ zIndex: activeThumb === 'end' ? 4 : 3 }}
                onMouseDown={() => setActiveThumb('end')}
                onTouchStart={() => setActiveThumb('end')}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Arrastra los extremos para ajustar el rango</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)' }}>
                Duración: <strong style={{ color: 'var(--text-primary)' }}>{(endTimeSec - startTimeSec).toFixed(1)}s</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-send-chatgpt"
            onClick={handleTrimMedia}
            disabled={trimStatus === 'downloading'}
            style={{ 
              width: '100%', 
              height: '46px', 
              borderRadius: 'var(--radius-md)', 
              color: 'var(--bg-sidebar)', 
              backgroundColor: 'var(--text-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginTop: '8px' 
            }}
          >
            <Scissors size={16} />
            <span>Recortar y descargar segmento</span>
          </button>
        </div>
      )}

      {(trimStatus === 'downloading' || trimStatus === 'completed' || trimStatus === 'error') && (
        <ProgressBar
          progressData={progressData}
          downloadStatus={trimStatus}
          onNewDownload={() => setTrimStatus('idle')}
        />
      )}
    </div>
  );
}
