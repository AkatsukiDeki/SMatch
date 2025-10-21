import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({
  error,
  onRetry,
  title = 'Произошла ошибка',
  className = ''
}) => {
  if (!error) return null;

  return (
    <div className={`error-message ${className}`}>
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4>{title}</h4>
        <p>{typeof error === 'string' ? error : error.message || 'Неизвестная ошибка'}</p>
        {onRetry && (
          <button className="retry-btn" onClick={onRetry}>
            Попробовать снова
          </button>
        )}
      </div>
    </div>
  );
};

export const InlineError = ({ error, onRetry }) => (
  <div className="inline-error">
    <span>❌ {error}</span>
    {onRetry && (
      <button className="retry-btn-small" onClick={onRetry}>
        Повторить
      </button>
    )}
  </div>
);

export default ErrorMessage;