import React, { useState } from 'react';
import { Link2, ArrowUpRight, Clipboard, Sparkles } from 'lucide-react';

export default function UrlInput({ urlInput, setUrlInput, onFetchMetadata, isFetching }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onFetchMetadata(urlInput.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
      }
    } catch (err) {
      console.warn('No se pudo acceder al portapapeles directamente:', err);
    }
  };

  return (
    <div className="prompt-container">
      <form onSubmit={handleSubmit} className="prompt-bar">
        <Link2 size={20} style={{ color: '#8e8ea0', flexShrink: 0 }} />
        
        <input
          type="url"
          className="prompt-input"
          placeholder="Pega la URL del video de YouTube o red social aquí..."
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
            title="Pegar enlace del portapapeles"
            style={{ marginRight: '4px' }}
          >
            <Clipboard size={18} />
          </button>
        )}

        <button
          type="submit"
          className="btn-send"
          disabled={!urlInput.trim() || isFetching}
        >
          {isFetching ? (
            <>
              <div className="spinner" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <span>Obtener</span>
              <ArrowUpRight size={18} />
            </>
          )}
        </button>
      </form>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: '#8e8ea0' }}>
        <Sparkles size={14} style={{ color: '#10a37f' }} />
        <span>Soporta YouTube, Vimeo, TikTok, X (Twitter), Facebook e Instagram.</span>
      </div>
    </div>
  );
}
