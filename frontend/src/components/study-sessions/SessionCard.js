import React, { useState } from 'react';
import { formatDateTime } from '../../utils/helpers';
import SessionInviteModal from './SessionInviteModal';
import './StudySessions.css';

const SessionCard = ({ session, currentUser, onJoin, onLeave, onDelete, onInviteSent }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const isCreator = session.created_by === currentUser.id || session.is_creator;
  const isParticipant = session.participants?.some(p => p.user === currentUser.id) ||
                       session.is_participant;
  const isFull = session.participants_count >= session.max_participants;
  const isPast = new Date(session.scheduled_time) < new Date();

  const handleAction = () => {
    if (isCreator) {
      if (window.confirm('Вы уверены, что хотите удалить эту сессию?')) {
        onDelete(session.id);
      }
    } else if (isParticipant) {
      if (window.confirm('Вы уверены, что хотите покинуть эту сессию?')) {
        onLeave(session.id);
      }
    } else {
      onJoin(session.id);
    }
  };

  const getActionButtonText = () => {
    if (isCreator) return '🗑️ Удалить';
    if (isParticipant) return '🚪 Покинуть';
    if (isFull) return '❌ Мест нет';
    if (isPast) return '⏰ Завершена';
    return '✅ Присоединиться';
  };

  const getButtonClass = () => {
    if (isCreator) return 'delete';
    if (isParticipant) return 'leave';
    if (isFull || isPast) return 'disabled';
    return 'join';
  };

  return (
    <>
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
              {session.participants_count || 0} / {session.max_participants}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">🎓 Организатор</span>
            <span className="detail-value">
              {session.created_by_profile?.username || 'Неизвестно'}
            </span>
          </div>
        </div>

        {session.participants && session.participants.length > 0 && (
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
        )}

        <div className="session-actions">
          <button
            className={`action-btn ${getButtonClass()}`}
            onClick={handleAction}
            disabled={(isFull && !isParticipant && !isCreator) || isPast}
          >
            {getActionButtonText()}
          </button>

          {isCreator && !isPast && (
            <>
              <button
                className="action-btn invite"
                onClick={() => setShowInviteModal(true)}
              >
                📨 Пригласить
              </button>
              <div className="creator-badge">
                👑 Вы организатор
              </div>
            </>
          )}
        </div>
      </div>

      {showInviteModal && (
        <SessionInviteModal
          session={session}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={onInviteSent}
        />
      )}
    </>
  );
};

export default SessionCard;