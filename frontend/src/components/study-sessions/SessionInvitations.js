// src/components/study-sessions/SessionInvitations.js
import React, { useState, useEffect } from 'react';
import { studySessionsAPI } from '../../services/api';
import './SessionInvitations.css';

const SessionInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await studySessionsAPI.getInvitations();
      setInvitations(response.data);
    } catch (error) {
      setError('Ошибка загрузки приглашений');
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (invitationId, response) => {
    try {
      await studySessionsAPI.respondToInvitation(invitationId, response);

      // Обновляем локальное состояние
      setInvitations(prev =>
        prev.map(inv =>
          inv.id === invitationId
            ? { ...inv, status: response, responded_at: new Date().toISOString() }
            : inv
        )
      );

      alert(response === 'accepted' ? 'Вы приняли приглашение!' : 'Вы отклонили приглашение');
    } catch (error) {
      console.error('Error responding to invitation:', error);
      alert('Ошибка при обработке приглашения');
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="invitations-loading">
        <div className="spinner"></div>
        <p>Загрузка приглашений...</p>
      </div>
    );
  }

  return (
    <div className="session-invitations">
      <h3>📨 Приглашения на учебные сессии</h3>

      {error && (
        <div className="invitations-error">
          <p>{error}</p>
          <button onClick={loadInvitations}>Попробовать снова</button>
        </div>
      )}

      {invitations.length === 0 ? (
        <div className="no-invitations">
          <p>Пока нет приглашений на учебные сессии</p>
          <small>Когда вам поступят приглашения, они появятся здесь</small>
        </div>
      ) : (
        <div className="invitations-list">
          {invitations.map((invitation) => (
            <div key={invitation.id} className={`invitation-card ${invitation.status}`}>
              <div className="invitation-header">
                <div className="inviter-info">
                  <div className="inviter-avatar">
                    {invitation.inviter?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="inviter-details">
                    <h4>{invitation.inviter?.username} приглашает вас</h4>
                    <span className="invitation-date">
                      {formatDateTime(invitation.created_at)}
                    </span>
                  </div>
                </div>
                <div className={`invitation-status ${invitation.status}`}>
                  {invitation.status === 'pending' && '⏳ Ожидает ответа'}
                  {invitation.status === 'accepted' && '✅ Принято'}
                  {invitation.status === 'declined' && '❌ Отклонено'}
                </div>
              </div>

              <div className="session-details">
                <h5>{invitation.session?.title}</h5>
                <p className="session-description">
                  {invitation.session?.description}
                </p>
                <div className="session-meta">
                  <span>📅 {formatDateTime(invitation.session?.scheduled_time)}</span>
                  <span>⏱️ {invitation.session?.duration_minutes} минут</span>
                  <span>📚 {invitation.session?.subject_name}</span>
                </div>
              </div>

              {invitation.status === 'pending' && (
                <div className="invitation-actions">
                  <button
                    className="btn-accept"
                    onClick={() => handleResponse(invitation.id, 'accepted')}
                  >
                    ✅ Принять
                  </button>
                  <button
                    className="btn-decline"
                    onClick={() => handleResponse(invitation.id, 'declined')}
                  >
                    ❌ Отклонить
                  </button>
                </div>
              )}

              {invitation.status !== 'pending' && (
                <div className="invitation-response">
                  <p>
                    Вы {invitation.status === 'accepted' ? 'приняли' : 'отклонили'} это приглашение
                    {invitation.responded_at && ` ${formatDateTime(invitation.responded_at)}`}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionInvitations;