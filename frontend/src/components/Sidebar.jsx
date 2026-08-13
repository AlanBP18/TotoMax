import React from 'react';
import { Plus, Search, Trash2, Video, Music, PanelLeftClose } from 'lucide-react';

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  historyItems = [],
  searchQuery,
  onSearchChange,
  onNewDownload,
  onDeleteHistory,
  onSelectHistoryItem
}) {
  const filteredHistory = historyItems.filter((item) =>
    (item.title || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <aside className="sidebar">
      {/* Header with New Download Button & Collapse Icon */}
      <div className="sidebar-header">
        <button type="button" className="btn-new-download" onClick={onNewDownload}>
          <Plus size={18} />
          <span>Nueva descarga</span>
        </button>
        <button 
          type="button" 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(false)}
          title="Cerrar barra lateral"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* Search Input */}
      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar historial..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* History Items Container */}
      <div className="sidebar-history-container">
        <div className="history-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Historial</span>
          <span style={{ fontSize: '10px', color: 'var(--accent-green)', fontWeight: 700 }}>{historyItems.length}/9 MAX</span>
        </div>

        {filteredHistory.length === 0 ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No hay descargas registradas.
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="history-item"
              onClick={() => onSelectHistoryItem && onSelectHistoryItem(item)}
            >
              <div className="history-item-content">
                {item.download_type === 'audio' ? (
                  <Music size={15} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                ) : (
                  <Video size={15} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                )}
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <div className="history-item-title">{item.title}</div>
                  <div className="history-item-sub">
                    <span className="format-badge">{item.format || 'mp4'}</span>
                    <span>{item.quality || 'HD'}</span>
                    {item.mode === 'clip' && <span style={{ color: 'var(--accent-green)' }}>• Recortado</span>}
                  </div>
                </div>
              </div>

              <div className="history-actions">
                <button
                  type="button"
                  className="icon-btn delete"
                  title="Eliminar del historial"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistory(item.id);
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer User Profile & Branded Logo */}
      <div className="sidebar-footer">
        <div className="user-avatar logo-t-avatar" style={{ background: 'transparent', border: 'none', boxShadow: 'none', width: '28px', height: '28px' }}>
          <img src="/logo.png" alt="TotoMax Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
        </div>
        <div className="user-info">
          <span className="user-name">TotoMax Media</span>
        </div>
      </div>
    </aside>
  );
}
