// src/components/study-sessions/SessionCard.js
import React from 'react';
import { formatDateTime } from '../../utils/helpers';
import './StudySessions.css';

const SessionCard = ({ session, currentUser, onJoin, onLeave, onDelete }) => {
  const isCreator = session.created_by === currentUser.id;
  const isParticipant = session.participants.some(p => p.user === currentUser.id);
  const isFull = session.participants_count >= session.max_participants;
  const isPast = new Date(session.scheduled_time) < new Date();

  const handleAction = () => {
    if (isCreator) {
      if (window.confirm('Вы уверены, что хотите удалить эту сессию?')) {
        onDelete(session.id);
      }
    } else if (isParticipant) {
      onLeave(session.id);
    } else {
      onJoin(session.id);
    }
  };

  const getActionButtonText = () => {
    if (isCreator) return 'Удалить';
    if (isParticipant) return 'Покинуть';
    if (isFull) return 'Мест нет';
    if (isPast) return 'Завершена';
    return 'Присоединиться';
  };

  return (
    <div className={`session-card ${isPast ? 'past' : ''}`}>
      <div className="session-header">
        <h3 className="session-title">{session.title}</h3>
        <span className="session-subject">{session.subject_name}</span>
      </div>

      <div className="session-description">
        {session.description || 'Описание отсутствует'}
      </div>

      <div className="session-details">
        <div className="detail-item">
          <span className="detail-label">📅 Дата и время</span>
          <span className="detail-value">
            {formatDateTime(session.scheduled_time)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">⏱ Длительность</span>
          <span className="detail-value">{session.duration_minutes} мин.</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">👥 Участники</span>
          <span className="detail-value">
            {session.participants_count} / {session.max_participants}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">🎓 Организатор</span>
          <span className="detail-value">
            {session.created_by_profile?.username || 'Неизвестно'}
          </span>
        </div>
      </div>

      <div className="participants-preview">
        <span className="participants-label">Участники:</span>
        <div className="participants-avatars">
          {session.participants.slice(0, 3).map(participant => (
            <div
              key={participant.id}
              className="participant-avatar"
              title={participant.user_profile?.username}
            >
              {participant.user_profile?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          ))}
          {session.participants_count > 3 && (
            <div className="more-participants">
              +{session.participants_count - 3}
            </div>
          )}
        </div>
      </div>

      <div className="session-actions">
        <button
          className={`action-btn ${
            isCreator ? 'delete' :
            isParticipant ? 'leave' :
            isFull || isPast ? 'disabled' : 'join'
          }`}
          onClick={handleAction}
          disabled={isFull && !isParticipant && !isCreator || isPast}
        >
          {getActionButtonText()}
        </button>
      </div>
    </div>
  );
};

export default SessionCard;