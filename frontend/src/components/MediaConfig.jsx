import React, { useState, useEffect, useRef } from 'react';
import { Download, Scissors, Video, Music, Clock, AlertCircle, Play, Pause, Bookmark, RotateCcw } from 'lucide-react';

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[1] && match[1].length === 11) ? match[1] : null;
}

function getVimeoId(url) {
  if (!url) return null;
  const regExp = /(?:vimeo\.com\/|^)(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function formatSeconds(totalSec) {
  if (isNaN(totalSec) || totalSec < 0) return '00:00:00';
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = Math.floor(totalSec % 60);
  return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
}

export default function MediaConfig({ videoData, onStartDownload, downloadStatus }) {
  const [downloadType, setDownloadType] = useState('video'); // 'video' | 'audio'
  const mode = 'clip'; // Always download selected clip fragment
  
  // Format options
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('1080p');

  // Trimming times (HH:MM:SS)
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('00:00:30');
  const [timeError, setTimeError] = useState('');

  // Video player state
  const videoRef = useRef(null);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [videoDurationSec, setVideoDurationSec] = useState(videoData?.duration_seconds || 345);
  const [isPlaying, setIsPlaying] = useState(false);

  const youtubeId = getYouTubeId(videoData?.url);
  const vimeoId = getVimeoId(videoData?.url);

  const [playerTab, setPlayerTab] = useState(() => (youtubeId || vimeoId ? 'embed' : 'video'));

  useEffect(() => {
    if (youtubeId || vimeoId) {
      setPlayerTab('embed');
    } else {
      setPlayerTab('video');
    }
  }, [youtubeId, vimeoId, videoData]);

  useEffect(() => {
    if (videoData?.duration_seconds) {
      const dur = Number(videoData.duration_seconds) || 14;
      setVideoDurationSec(dur);
      setEndTime(videoData.duration_formatted || formatSeconds(dur));
      setStartTime('00:00:00');
    }
  }, [videoData]);

  // Convert HH:MM:SS or MM:SS to seconds
  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':').map(Number);
    if (parts.some(isNaN)) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 1) return parts[0];
    return 0;
  };

  // Validate trimming inputs
  useEffect(() => {
    if (mode === 'clip') {
      const startSec = parseTimeToSeconds(startTime);
      const endSec = parseTimeToSeconds(endTime);

      if (endSec <= startSec) {
        setTimeError('El tiempo final debe ser posterior al tiempo de inicio.');
      } else {
        setTimeError('');
      }
    } else {
      setTimeError('');
    }
  }, [startTime, endTime, mode]);

  // HTML5 Video Player Event Handlers with fragment looping
  const [isPlayingFragment, setIsPlayingFragment] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTimeSec(cur);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setVideoDurationSec(videoRef.current.duration);
      }

      // Loop strictly within fragment when playing fragment or in clip mode
      const sSec = parseTimeToSeconds(startTime);
      const eSec = parseTimeToSeconds(endTime);
      if (eSec > sSec && (isPlayingFragment || mode === 'clip')) {
        if (cur >= eSec || cur < sSec - 0.5) {
          videoRef.current.currentTime = sSec;
        }
      }
    }
  };

  const handleStartSliderChange = (e) => {
    const val = Number(e.target.value);
    const endVal = parseTimeToSeconds(endTime);
    if (val < endVal) {
      setStartTime(formatSeconds(val));
      if (videoRef.current) {
        videoRef.current.currentTime = val;
      }
    }
  };

  const handleEndSliderChange = (e) => {
    const val = Number(e.target.value);
    const startVal = parseTimeToSeconds(startTime);
    if (val > startVal) {
      setEndTime(formatSeconds(val));
      if (videoRef.current) {
        videoRef.current.currentTime = val;
      }
    }
  };

  const handleTogglePlayFragment = () => {
    const startVal = parseTimeToSeconds(startTime);

    if (playerTab === 'embed') {
      setIsPlayingFragment(!isPlayingFragment);
      setIframeKey((prev) => prev + 1);
    } else if (videoRef.current) {
      if (isPlaying && isPlayingFragment) {
        videoRef.current.pause();
        setIsPlaying(false);
        setIsPlayingFragment(false);
      } else {
        videoRef.current.currentTime = startVal;
        videoRef.current.play();
        setIsPlaying(true);
        setIsPlayingFragment(true);
      }
    }
  };

  const handleDownload = () => {
    if (mode === 'clip' && timeError) return;

    onStartDownload({
      url: videoData.url,
      title: videoData.title,
      thumbnail: videoData.thumbnail,
      download_type: downloadType,
      format,
      quality,
      mode,
      start_time: mode === 'clip' ? startTime : null,
      end_time: mode === 'clip' ? endTime : null,
    });
  };

  const filmstripTrackRef = useRef(null);

  const handleTrackDrag = (type, clientX) => {
    if (!filmstripTrackRef.current) return;
    const rect = filmstripTrackRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const relX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = relX / rect.width;
    const dur = Math.max(1, videoDurationSec);
    const targetSec = Math.round(ratio * dur);

    const currentStartSec = parseTimeToSeconds(startTime);
    const currentEndSec = parseTimeToSeconds(endTime);

    if (type === 'start') {
      const clamped = Math.min(targetSec, Math.max(0, currentEndSec - 1));
      setStartTime(formatSeconds(clamped));
      if (videoRef.current) {
        videoRef.current.currentTime = clamped;
      }
    } else if (type === 'end') {
      const clamped = Math.max(targetSec, Math.min(dur, currentStartSec + 1));
      setEndTime(formatSeconds(clamped));
      if (videoRef.current) {
        videoRef.current.currentTime = clamped;
      }
    }
  };

  const handleHandlePointerDown = (type, e) => {
    e.preventDefault();
    e.stopPropagation();

    const onPointerMove = (moveEvt) => {
      handleTrackDrag(type, moveEvt.clientX);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleWindowPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!filmstripTrackRef.current) return;
    const rect = filmstripTrackRef.current.getBoundingClientRect();
    const initialMouseX = e.clientX;
    const initialStart = parseTimeToSeconds(startTime);
    const initialEnd = parseTimeToSeconds(endTime);
    const clipDur = Math.max(1, initialEnd - initialStart);
    const dur = Math.max(1, videoDurationSec);

    const onPointerMove = (moveEvt) => {
      const deltaX = moveEvt.clientX - initialMouseX;
      const deltaRatio = deltaX / rect.width;
      const deltaSec = Math.round(deltaRatio * dur);

      let newStart = initialStart + deltaSec;
      if (newStart < 0) newStart = 0;
      if (newStart + clipDur > dur) newStart = dur - clipDur;

      const newEnd = newStart + clipDur;
      setStartTime(formatSeconds(newStart));
      setEndTime(formatSeconds(newEnd));
      if (videoRef.current) {
        videoRef.current.currentTime = newStart;
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleTrackClick = (e) => {
    if (!filmstripTrackRef.current) return;
    const rect = filmstripTrackRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = relX / rect.width;
    const clickedSec = Math.round(ratio * (videoDurationSec || 14));

    const startSec = parseTimeToSeconds(startTime);
    const endSec = parseTimeToSeconds(endTime);
    const totalDuration = Math.max(1, videoDurationSec);
    const clipPercentStart = Math.min(100, Math.max(0, (startSec / totalDuration) * 100));
    const clipPercentEnd = Math.min(100, Math.max(0, (endSec / totalDuration) * 100));
    const clipWidthPercent = Math.max(0, clipPercentEnd - clipPercentStart);
    const playheadPercent = Math.min(100, Math.max(0, (currentTimeSec / totalDuration) * 100));

    const distToStart = Math.abs(clickedSec - startSec);
    const distToEnd = Math.abs(clickedSec - endSec);

    if (distToStart < distToEnd) {
      if (clickedSec < endSec) {
        setStartTime(formatSeconds(clickedSec));
      }
    } else {
      if (clickedSec > startSec) {
        setEndTime(formatSeconds(clickedSec));
      }
    }
  };

  const startSec = parseTimeToSeconds(startTime);
  const endSec = parseTimeToSeconds(endTime);
  const totalDuration = Math.max(1, videoDurationSec);
  const clipPercentStart = Math.min(100, Math.max(0, (startSec / totalDuration) * 100));
  const clipPercentEnd = Math.min(100, Math.max(0, (endSec / totalDuration) * 100));
  const clipWidthPercent = Math.max(0, clipPercentEnd - clipPercentStart);
  const playheadPercent = Math.min(100, Math.max(0, (currentTimeSec / totalDuration) * 100));

  const embedSrcUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?start=${startSec}&end=${endSec}&autoplay=${isPlayingFragment ? 1 : 0}&enablejsapi=1`
    : `https://player.vimeo.com/video/${vimeoId}`;

  return (
    <div className="config-card">
      {/* Header Info */}
      <div className="video-meta-details">
        <div>
          <h3 className="meta-title">{videoData.title || 'Video multimedia detectado'}</h3>
          <p className="meta-subtitle">{videoData.author || 'Canal / Autor oficial'}</p>
        </div>
        <div className="meta-tags">
          <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            {videoData.duration_formatted || formatSeconds(videoDurationSec)}
          </span>
          <span className="tag" style={{ color: '#10a37f' }}>● Barra de Recorte interactiva</span>
        </div>
      </div>

      {/* In-App Video Player Section */}
      <div className="video-player-container">
        <div className="video-player-header">
          <span>Vista Previa de Fragmento Seleccionado</span>
          {(youtubeId || vimeoId) && (
            <div className="player-toggle-btns">
              <button
                type="button"
                className={`player-tab-btn ${playerTab === 'embed' ? 'active' : ''}`}
                onClick={() => setPlayerTab('embed')}
              >
                Incrustado ({youtubeId ? 'YouTube' : 'Vimeo'})
              </button>
              <button
                type="button"
                className={`player-tab-btn ${playerTab === 'video' ? 'active' : ''}`}
                onClick={() => setPlayerTab('video')}
              >
                Reproductor HTML5 Trimmer
              </button>
            </div>
          )}
        </div>

        {playerTab === 'embed' && (youtubeId || vimeoId) ? (
          <div className="iframe-wrapper">
            <iframe
              key={iframeKey}
              src={embedSrcUrl}
              title="Reproductor en vivo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="html5-player-wrapper">
            <video
              ref={videoRef}
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              controls
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => {
                setIsPlaying(false);
                setIsPlayingFragment(false);
              }}
              className="video-element"
              poster={videoData.thumbnail}
            />
          </div>
        )}

        {/* Apple-Style Interactive Trimmer Bar */}
        <div className="apple-trimmer-bar-container">
          <button
            type="button"
            className={`btn-apple-play ${isPlayingFragment ? 'playing' : ''}`}
            onClick={handleTogglePlayFragment}
            title="Previsualizar solo el fragmento seleccionado"
          >
            {isPlayingFragment ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
          </button>

          {/* Filmstrip Bar Track */}
          <div
            ref={filmstripTrackRef}
            className="filmstrip-track"
            onClick={handleTrackClick}
          >
            {/* Filmstrip Real Frame Thumbnails */}
            <div className="filmstrip-frames">
              <div className="frame-thumb" style={{ backgroundImage: `url(${youtubeId ? `https://img.youtube.com/vi/${youtubeId}/1.jpg` : videoData.thumbnail})` }} />
              <div className="frame-thumb" style={{ backgroundImage: `url(${youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : videoData.thumbnail})` }} />
              <div className="frame-thumb" style={{ backgroundImage: `url(${youtubeId ? `https://img.youtube.com/vi/${youtubeId}/2.jpg` : videoData.thumbnail})` }} />
              <div className="frame-thumb" style={{ backgroundImage: `url(${youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : videoData.thumbnail})` }} />
              <div className="frame-thumb" style={{ backgroundImage: `url(${youtubeId ? `https://img.youtube.com/vi/${youtubeId}/3.jpg` : videoData.thumbnail})` }} />
              <div className="frame-thumb" style={{ backgroundImage: `url(${youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : videoData.thumbnail})` }} />
            </div>

            {/* Selection Highlight Box (Yellow Trimmer Frame) */}
            <div
              className="apple-selection-box"
              style={{
                left: `${clipPercentStart}%`,
                width: `${clipWidthPercent}%`
              }}
              onPointerDown={handleWindowPointerDown}
              title="Arrastra para deslizar la ventana seleccionada"
            >
              <div
                className="trim-handle trim-handle-left"
                title="Arrastrar punto de inicio"
                onPointerDown={(e) => handleHandlePointerDown('start', e)}
              >
                <span>‹</span>
              </div>
              <div
                className="trim-handle trim-handle-right"
                title="Arrastrar punto final"
                onPointerDown={(e) => handleHandlePointerDown('end', e)}
              >
                <span>›</span>
              </div>
            </div>

            {/* Playhead Line */}
            <div
              className="apple-playhead-line"
              style={{ left: `${playheadPercent}%` }}
            />
          </div>

          <div className="trim-badge-info">
            <span>Recorte: <strong>{formatSeconds(startSec)}</strong> ➔ <strong>{formatSeconds(endSec)}</strong></span>
          </div>
        </div>
      </div>

      {/* Download Type Selector (Video vs Audio) */}
      <div className="option-group">
        <label className="option-label">Tipo de Contenido</label>
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-btn ${downloadType === 'video' ? 'active' : ''}`}
            onClick={() => {
              setDownloadType('video');
              setFormat('mp4');
            }}
          >
            <Video size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            Video con Audio
          </button>
          <button
            type="button"
            className={`segmented-btn ${downloadType === 'audio' ? 'active' : ''}`}
            onClick={() => {
              setDownloadType('audio');
              setFormat('mp3');
            }}
          >
            <Music size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            Solo Audio
          </button>
        </div>
      </div>

      {/* Format & Quality Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="option-group">
          <label className="option-label">Formato de Salida</label>
          <select
            className="select-input"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            {downloadType === 'video' ? (
              <>
                <option value="mp4">MP4 (Recomendado)</option>
                <option value="mkv">MKV (Alta calidad)</option>
                <option value="webm">WebM (Optimizado)</option>
              </>
            ) : (
              <>
                <option value="mp3">MP3 (Audio estándar)</option>
                <option value="m4a">M4A (AAC de alta fidelidad)</option>
                <option value="wav">WAV (Audio sin compresión)</option>
              </>
            )}
          </select>
        </div>

        <div className="option-group">
          <label className="option-label">{downloadType === 'video' ? 'Calidad / Resolución' : 'Tasa de Bits'}</label>
          <select
            className="select-input"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
          >
            {downloadType === 'video' ? (
              <>
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD</option>
                <option value="360p">360p Móvil</option>
              </>
            ) : (
              <>
                <option value="320kbps">320 kbps (Máxima)</option>
                <option value="256kbps">256 kbps (Alta)</option>
                <option value="192kbps">192 kbps (Estándar)</option>
                <option value="128kbps">128 kbps (Económica)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        className="btn-send"
        onClick={handleDownload}
        disabled={downloadStatus === 'downloading'}
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: '14px',
          fontSize: '15px',
          marginTop: '8px'
        }}
      >
        <Download size={20} />
        <span>Descargar Fragmento Seleccionado</span>
      </button>
    </div>
  );
}
