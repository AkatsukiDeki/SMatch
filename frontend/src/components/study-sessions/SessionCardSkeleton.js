import React from 'react';
import './SessionCardSkeleton.css';

const SessionCardSkeleton = () => {
  return (
    <div className="session-card-skeleton">
      <div className="skeleton-header">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-tag"></div>
      </div>

      <div className="skeleton-description">
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text" style={{width: '80%'}}></div>
      </div>

      <div className="skeleton-details">
        <div className="skeleton-detail">
          <div className="skeleton skeleton-text" style={{width: '60%'}}></div>
          <div className="skeleton skeleton-text" style={{width: '40%'}}></div>
        </div>
        <div className="skeleton-detail">
          <div className="skeleton skeleton-text" style={{width: '60%'}}></div>
          <div className="skeleton skeleton-text" style={{width: '40%'}}></div>
        </div>
      </div>

      <div className="skeleton-actions">
        <div className="skeleton skeleton-button"></div>
      </div>
    </div>
  );
};

export default SessionCardSkeleton;