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
      setError('');
      console.log('🔄 Загрузка приглашений...');
      const response = await studySessionsAPI.getInvitations();
      console.log('📨 Получены приглашения:', response.data);
      setInvitations(response.data);
    } catch (error) {
      console.error('❌ Ошибка загрузки приглашений:', error);
      setError('Не удалось загрузить приглашения');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (invitationId, response) => {
    try {
      console.log(`📤 Отправка ответа на приглашение: ${response}`);
      await studySessionsAPI.respondToInvitation(invitationId, response);

      // Обновляем локальное состояние
      setInvitations(prev =>
        prev.map(inv =>
          inv.id === invitationId
            ? { ...inv, status: response, responded_at: new Date().toISOString() }
            : inv
        )
      );

      alert(response === 'accepted' ? '🎉 Вы приняли приглашение!' : '❌ Вы отклонили приглашение');

    } catch (error) {
      console.error('❌ Ошибка при обработке приглашения:', error);
      alert('Ошибка при обработке приглашения');
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Дата не указана';
    }
  };

  if (loading) {
    return (
      <div className="invitations-loading">
        <div className="spinner"></div>
        <p>Загрузка приглашений...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invitations-error">
        <p>{error}</p>
        <button onClick={loadInvitations}>🔄 Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className="session-invitations">
      <div className="invitations-header">
        <h3>📨 Приглашения на учебные сессии</h3>
        <button onClick={loadInvitations} className="refresh-btn" title="Обновить">
          🔄
        </button>
      </div>

      <p className="invitations-subtitle">
        Здесь отображаются приглашения, которые вы получили от других пользователей
      </p>

      {invitations.length === 0 ? (
        <div className="no-invitations">
          <div className="no-invitations-icon">📭</div>
          <h4>Пока нет приглашений</h4>
          <p>Когда другие пользователи пришлют вам приглашения на учебные сессии, они появятся здесь.</p>
          <div className="demo-tips">
            <h5>Как получить приглашения?</h5>
            <ul>
              <li>✅ Создайте профиль и добавьте предметы</li>
              <li>✅ Лайкайте других пользователей в разделе "Поиск"</li>
              <li>✅ Дождитесь взаимных лайков</li>
              <li>✅ Другие пользователи смогут пригласить вас на сессии</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="invitations-stats">
          <div className="stats-card">
            <span className="stats-number">{invitations.length}</span>
            <span className="stats-label">всего приглашений</span>
          </div>
          <div className="stats-card">
            <span className="stats-number">
              {invitations.filter(inv => inv.status === 'pending').length}
            </span>
            <span className="stats-label">ожидают ответа</span>
          </div>
        </div>
      )}

      {invitations.length > 0 && (
        <div className="invitations-list">
          {invitations.map((invitation) => (
            <div key={invitation.id} className={`invitation-card ${invitation.status}`}>
              <div className="invitation-header">
                <div className="inviter-info">
                  <div className="inviter-avatar">
                    {invitation.inviter?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="inviter-details">
                    <h4>
                      {invitation.inviter?.first_name && invitation.inviter?.last_name
                        ? `${invitation.inviter.first_name} ${invitation.inviter.last_name}`
                        : invitation.inviter?.username || 'Пользователь'
                      }
                      <span className="inviter-username">@{invitation.inviter?.username}</span>
                    </h4>
                    <p className="inviter-faculty">
                      {invitation.inviter?.profile?.faculty || 'Студент'}
                      {invitation.inviter?.profile?.year_of_study && ` • ${invitation.inviter.profile.year_of_study} курс`}
                    </p>
                    <span className="invitation-date">
                      📅 Приглашение отправлено: {formatDateTime(invitation.created_at)}
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
                <h5>🎯 {invitation.session?.title}</h5>
                <p className="session-description">
                  {invitation.session?.description || 'Описание отсутствует'}
                </p>
                <div className="session-meta">
                  <span>📅 {formatDateTime(invitation.session?.scheduled_time)}</span>
                  <span>⏱️ {invitation.session?.duration_minutes} минут</span>
                  <span>📚 {invitation.session?.subject_name}</span>
                  <span>👥 Организатор: {invitation.session?.created_by}</span>
                </div>
              </div>

              {invitation.status === 'pending' && (
                <div className="invitation-actions">
                  <button
                    className="btn-accept"
                    onClick={() => handleResponse(invitation.id, 'accepted')}
                  >
                    ✅ Принять приглашение
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
                    <strong>
                      {invitation.status === 'accepted' ? '✅ Вы приняли это приглашение' : '❌ Вы отклонили это приглашение'}
                    </strong>
                    {invitation.responded_at && (
                      <span className="response-date">
                        📅 {formatDateTime(invitation.responded_at)}
                      </span>
                    )}
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