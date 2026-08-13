import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="config-card skeleton-container" style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
      <div className="video-info-header" style={{ opacity: 0.7 }}>
        <div 
          className="video-thumbnail-preview skeleton-block" 
          style={{ width: '220px', height: '124px', backgroundColor: '#2a2b32', borderRadius: '8px' }}
        />
        <div className="video-meta-details" style={{ gap: '12px' }}>
          <div style={{ width: '80%', height: '20px', backgroundColor: '#2a2b32', borderRadius: '4px' }} />
          <div style={{ width: '40%', height: '14px', backgroundColor: '#2a2b32', borderRadius: '4px' }} />
          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <div style={{ width: '60px', height: '22px', backgroundColor: '#2a2b32', borderRadius: '4px' }} />
            <div style={{ width: '80px', height: '22px', backgroundColor: '#2a2b32', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        <div style={{ width: '30%', height: '14px', backgroundColor: '#2a2b32', borderRadius: '4px' }} />
        <div style={{ width: '100%', height: '42px', backgroundColor: '#2a2b32', borderRadius: '8px' }} />
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.9; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
