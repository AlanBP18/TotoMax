import React from 'react';
import { Link2, ArrowUp, Clipboard, Sparkles, Video, Music } from 'lucide-react';

export default function UrlInput({ 
  urlInput, setUrlInput, 
  videoQuality, setVideoQuality,
  audioFormat, setAudioFormat,
  isAudioOnly, setIsAudioOnly,
  format, setFormat,
  onFetchMetadata, isFetching 
}) {

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onFetchMetadata(urlInput.trim());
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrlInput(text);
        }
      }
    } catch (err) {
      console.warn('No se pudo acceder al portapapeles directamente:', err);
    }
  };

  return (
    <div className="prompt-wrapper">
      {/* Suggestions Grid */}
      {!urlInput && (
        <div className="suggestion-grid" style={{ marginBottom: '24px' }}>
          <div 
            className="suggestion-card" 
            onClick={() => setUrlInput('https://www.youtube.com/watch?v=aqz-KE-wZYw')}
          >
            <span className="suggestion-card-title">Descargar de YouTube 🎥</span>
            <span className="suggestion-card-desc">Inserta un enlace para bajar en alta resolución.</span>
          </div>
          <div 
            className="suggestion-card" 
            onClick={() => { setIsAudioOnly(true); setAudioFormat('mp3'); }}
          >
            <span className="suggestion-card-title">Extraer Audio MP3 🎵</span>
            <span className="suggestion-card-desc">Convierte y extrae el audio de cualquier video.</span>
          </div>
        </div>
      )}

      {/* ChatGPT Style Input Bar */}
      <form onSubmit={handleSubmit} className="prompt-bar-chatgpt">
        <div className="prompt-input-row">
          <Link2 size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          
          <input
            type="url"
            className="prompt-input-chatgpt"
            placeholder="Pega la URL del video o audio aquí..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={isFetching}
            required
          />

          {navigator.clipboard && !urlInput && (
            <button
              type="button"
              className="icon-btn"
              onClick={handlePaste}
              title="Pegar enlace"
            >
              <Clipboard size={16} />
            </button>
          )}

          <button
            type="submit"
            className="btn-send-chatgpt"
            disabled={!urlInput.trim() || isFetching}
            title="Enviar enlace"
          >
            {isFetching ? (
              <div className="spinner" style={{ width: '16px', height: '16px' }} />
            ) : (
              <ArrowUp size={18} />
            )}
          </button>
        </div>

        {/* Options Panel inside prompt area */}
        <div className="options-panel-chatgpt">
          {/* Content Type Selector */}
          <div className="option-group">
            <span className="option-label">Tipo</span>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-btn ${!isAudioOnly ? 'active' : ''}`}
                onClick={() => setIsAudioOnly(false)}
              >
                <Video size={13} />
                <span>Video</span>
              </button>
              <button
                type="button"
                className={`segmented-btn ${isAudioOnly ? 'active' : ''}`}
                onClick={() => setIsAudioOnly(true)}
              >
                <Music size={13} />
                <span>Audio</span>
              </button>
            </div>
          </div>

          {/* Format Selector */}
          <div className="option-group">
            <span className="option-label">Formato</span>
            <select
              className="select-input"
              value={isAudioOnly ? audioFormat : format}
              onChange={(e) => isAudioOnly ? setAudioFormat(e.target.value) : setFormat(e.target.value)}
            >
              {!isAudioOnly ? (
                <>
                  <option value="mp4">MP4</option>
                  <option value="webm">WebM</option>
                  <option value="ogg">Ogg</option>
                </>
              ) : (
                <>
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                  <option value="m4a">M4A (High Quality)</option>
                </>
              )}
            </select>
          </div>

          {/* Resolution Selector */}
          <div className="option-group">
            <span className="option-label">{!isAudioOnly ? 'Resolución' : 'Calidad'}</span>
            <select
              className="select-input"
              value={!isAudioOnly ? videoQuality : 'best'}
              onChange={(e) => !isAudioOnly && setVideoQuality(e.target.value)}
              disabled={isAudioOnly}
            >
              {!isAudioOnly ? (
                <>
                  <option value="max">Original (4K/1080p)</option>
                  <option value="1080">1080p</option>
                  <option value="720">720p</option>
                  <option value="480">480p</option>
                  <option value="360">360p</option>
                </>
              ) : (
                <option value="best">Óptima original</option>
              )}
            </select>
          </div>
        </div>
      </form>
      
      {/* Help text */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <Sparkles size={12} style={{ color: 'var(--accent-green)' }} />
        <span>Soporta YouTube, Vimeo, TikTok, X, Instagram, Facebook y más.</span>
      </div>
    </div>
  );
}
