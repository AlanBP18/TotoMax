import React from 'react';
import { CheckCircle2, FileVideo, HardDrive, Zap, Clock, AlertCircle } from 'lucide-react';

export default function ProgressBar({ progressData, downloadStatus, completedFile, onNewDownload }) {
  if (downloadStatus === 'downloading') {
    const percentage = Math.min(100, Math.max(0, Math.round(progressData?.percentage || 0)));
    const speed = progressData?.speed || 'Procesando...';
    const eta = progressData?.eta || '';
    const size = progressData?.downloaded_bytes || `${percentage}%`;

    return (
      <div className="progress-card" style={{ marginTop: '24px' }}>
        <div className="progress-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileVideo size={18} style={{ color: 'var(--accent-green)' }} />
            <span className="progress-title">Procesando y descargando multimedia...</span>
          </div>
          <span className="progress-status">{percentage}%</span>
        </div>

        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
        </div>

        <div className="progress-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={14} style={{ color: 'var(--text-muted)' }} />
            <span>Estado: {speed}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardDrive size={14} style={{ color: 'var(--text-muted)' }} />
            <span>Progreso: {size}</span>
          </div>
          {eta && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} style={{ color: 'var(--text-muted)' }} />
              <span>ETA: {eta}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (downloadStatus === 'error') {
    return (
      <div className="result-card error" style={{ marginTop: '24px' }}>
        <div className="result-info">
          <div className="result-icon">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="result-text-title">Error en el procesamiento</h4>
            <p className="result-text-sub">
              {progressData?.downloaded_bytes || 'No se pudo procesar el fragmento. Intenta con otra URL.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="select-input"
          onClick={onNewDownload}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (downloadStatus === 'completed' && completedFile) {
    return (
      <div className="result-card" style={{ marginTop: '24px' }}>
        <div className="result-info">
          <div className="result-icon">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="result-text-title">¡Completado con éxito!</h4>
            <p className="result-text-sub">
              {completedFile.title || 'Archivo multimedia listo'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
