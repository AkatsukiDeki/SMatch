import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studySessionsAPI } from '../services/api';
import SessionCard from '../components/study-sessions/SessionCard';
import SessionForm from '../components/study-sessions/SessionForm';
import SessionInvitations from '../components/study-sessions/SessionInvitations';
import SessionCardSkeleton from '../components/study-sessions/SessionCardSkeleton';
import './StudySessions.css';

const StudySessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Загрузка сессий...');

      const [allSessions, mySessionsData] = await Promise.all([
        studySessionsAPI.getSessions(),
        studySessionsAPI.getMySessions()
      ]);

      console.log('✅ Все сессии:', allSessions.data);
      console.log('✅ Мои сессии:', mySessionsData.data);

      setSessions(allSessions.data);
      setMySessions(mySessionsData.data);

    } catch (error) {
      console.error('❌ Ошибка загрузки сессий:', error);
      setError('Не удалось загрузить сессии. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (sessionData) => {
    try {
      await studySessionsAPI.createSession(sessionData);
      setShowForm(false);
      await loadSessions();
    } catch (error) {
      console.error('❌ Ошибка создания сессии:', error);
      alert('Ошибка при создании сессии: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      await studySessionsAPI.joinSession(sessionId);
      await loadSessions();
    } catch (error) {
      console.error('❌ Ошибка присоединения:', error);
      alert('Ошибка при присоединении к сессии: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLeaveSession = async (sessionId) => {
    try {
      await studySessionsAPI.leaveSession(sessionId);
      await loadSessions();
    } catch (error) {
      console.error('❌ Ошибка выхода:', error);
      alert('Ошибка при выходе из сессии: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту сессию?')) {
      try {
        await studySessionsAPI.deleteSession(sessionId);
        await loadSessions();
      } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        alert('Ошибка при удалении сессии: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="study-sessions-page">
        <div className="auth-required">
          <h2>Для просмотра учебных сессий необходимо войти в систему</h2>
        </div>
      </div>
    );
  }

  const displaySessions = activeTab === 'my' ? mySessions : sessions;

  return (
    <div className="study-sessions-page">
      <div className="sessions-header">
        <div className="header-content">
          <h1>📚 Учебные сессии</h1>
          <p>Организуйте и присоединяйтесь к учебным встречам</p>
        </div>
        <button
          className="create-session-btn"
          onClick={() => setShowForm(true)}
          disabled={loading}
          type="button"
        >
          ➕ Создать сессию
        </button>
      </div>

      <div className="sessions-tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
          disabled={loading}
          type="button"
        >
          📚 Все сессии
        </button>
        <button
          className={`tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
          disabled={loading}
          type="button"
        >
          👤 Мои сессии
        </button>
        <button
          className={`tab ${activeTab === 'invitations' ? 'active' : ''}`}
          onClick={() => setActiveTab('invitations')}
          disabled={loading}
          type="button"
        >
          📨 Приглашения
        </button>
      </div>

      <div className="sessions-content">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadSessions}>Попробовать снова</button>
          </div>
        )}

        {activeTab === 'invitations' ? (
          <SessionInvitations />
        ) : (
          <>
            {loading ? (
              <div className="sessions-grid">
                {[...Array(6)].map((_, index) => (
                  <SessionCardSkeleton key={index} />
                ))}
              </div>
            ) : displaySessions.length === 0 ? (
              <div className="no-sessions">
                <div className="no-sessions-icon">
                  {activeTab === 'all' ? '📚' : '👤'}
                </div>
                <h3>
                  {activeTab === 'all'
                    ? 'Пока нет учебных сессий'
                    : 'У вас пока нет сессий'
                  }
                </h3>
                <p>
                  {activeTab === 'all'
                    ? 'Будьте первым, кто создаст учебную сессию!'
                    : 'Вы еще не создали и не присоединились к сессиям'
                  }
                </p>
                {activeTab === 'my' && (
                  <button
                    className="create-session-btn"
                    onClick={() => setShowForm(true)}
                    type="button"
                  >
                    ➕ Создать первую сессию
                  </button>
                )}
              </div>
            ) : (
              <div className="sessions-grid">
                {displaySessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    currentUser={user}
                    onJoin={handleJoinSession}
                    onLeave={handleLeaveSession}
                    onDelete={handleDeleteSession}
                    onInviteSent={loadSessions}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <SessionForm
          onSubmit={handleCreateSession}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default StudySessions;