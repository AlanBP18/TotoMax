import React from 'react';
import { Download, CheckCircle2, FileVideo, HardDrive, Zap, Clock } from 'lucide-react';

export default function ProgressBar({ progressData, downloadStatus, completedFile, onNewDownload }) {
  if (downloadStatus === 'downloading') {
    const percentage = Math.min(100, Math.max(0, Math.round(progressData?.percentage || 0)));
    const speed = progressData?.speed || '12.4 MB/s';
    const eta = progressData?.eta || '4 sec';
    const size = progressData?.downloaded_bytes || `${(percentage * 0.45).toFixed(1)} MB / 45.0 MB`;

    return (
      <div className="progress-card">
        <div className="progress-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileVideo size={20} style={{ color: '#10a37f' }} />
            <span className="progress-title">Procesando y descargando multimedia...</span>
          </div>
          <span className="progress-status">{percentage}%</span>
        </div>

        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
        </div>

        <div className="progress-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} />
            <span>Velocidad: {speed}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HardDrive size={14} />
            <span>Tamaño: {size}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} />
            <span>ETA: {eta}</span>
          </div>
        </div>
      </div>
    );
  }

  if (downloadStatus === 'completed' && completedFile) {
    return (
      <div className="result-card">
        <div className="result-info">
          <div className="result-icon">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="result-text-title">¡Descarga y procesamiento completado!</h4>
            <p className="result-text-sub">
              {completedFile.title || 'Archivo multimedia listo'} ({completedFile.format?.toUpperCase()} - {completedFile.quality})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href={completedFile.download_url || '#'}
            download={completedFile.filename || 'media_file.mp4'}
            onClick={(e) => {
              if (!completedFile.download_url || completedFile.download_url === '#') {
                e.preventDefault();
                alert(`Simulación exitosa: El archivo "${completedFile.title || 'video'}.${completedFile.format || 'mp4'}" ha sido generado.`);
              }
            }}
            className="btn-download-file"
          >
            <Download size={18} />
            <span>Guardar Archivo</span>
          </a>

          <button
            type="button"
            className="page-btn"
            onClick={onNewDownload}
            style={{ padding: '10px 14px' }}
          >
            Otra Descarga
          </button>
        </div>
      </div>
    );
  }

  return null;
}
