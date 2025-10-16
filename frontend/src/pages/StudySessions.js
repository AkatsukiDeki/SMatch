// src/pages/StudySessions.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studySessionsAPI } from '../services/api';
import SessionCard from '../components/study-sessions/SessionCard';
import SessionForm from '../components/study-sessions/SessionForm';
import './StudySessions.css';

const StudySessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const [sessionsResponse, mySessionsResponse] = await Promise.all([
        studySessionsAPI.getSessions(),
        studySessionsAPI.getMySessions()
      ]);

      setSessions(sessionsResponse.data);
      setMySessions(mySessionsResponse.data);
    } catch (error) {
      setError('Ошибка загрузки сессий');
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (sessionData) => {
    try {
      await studySessionsAPI.createSession(sessionData);
      setShowForm(false);
      loadSessions();
    } catch (error) {
      setError('Ошибка создания сессии');
      console.error('Error creating session:', error);
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      await studySessionsAPI.joinSession(sessionId);
      loadSessions();
    } catch (error) {
      setError('Ошибка присоединения к сессии');
      console.error('Error joining session:', error);
    }
  };

  const handleLeaveSession = async (sessionId) => {
    try {
      await studySessionsAPI.leaveSession(sessionId);
      loadSessions();
    } catch (error) {
      setError('Ошибка выхода из сессии');
      console.error('Error leaving session:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту сессию?')) {
      try {
        await studySessionsAPI.deleteSession(sessionId);
        loadSessions();
      } catch (error) {
        setError('Ошибка удаления сессии');
        console.error('Error deleting session:', error);
      }
    }
  };

  const getDisplaySessions = () => {
    switch (activeTab) {
      case 'my':
        return mySessions;
      case 'joined':
        return sessions.filter(session =>
          session.participants.some(p => p.user === user?.id)
        );
      default:
        return sessions;
    }
  };

  if (!user) {
    return (
      <div className="study-sessions-page">
        <div className="auth-required">
          <h2>Для просмотра учебных сессий необходимо войти в систему</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="study-sessions-page">
      <div className="page-header">
        <h1>Учебные сессии</h1>
        <button
          className="create-session-btn"
          onClick={() => setShowForm(true)}
        >
          + Создать сессию
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Все сессии
        </button>
        <button
          className={`tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          Мои сессии
        </button>
        <button
          className={`tab ${activeTab === 'joined' ? 'active' : ''}`}
          onClick={() => setActiveTab('joined')}
        >
          Участвую
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Загрузка сессий...</p>
        </div>
      ) : (
        <div className="sessions-container">
          {getDisplaySessions().length === 0 ? (
            <div className="no-sessions">
              <h3>Сессии не найдены</h3>
              <p>
                {activeTab === 'all'
                  ? 'Пока нет доступных учебных сессий'
                  : activeTab === 'my'
                  ? 'Вы еще не создали ни одной сессии'
                  : 'Вы не участвуете ни в одной сессии'
                }
              </p>
              {activeTab === 'my' && (
                <button
                  className="create-session-btn"
                  onClick={() => setShowForm(true)}
                >
                  Создать первую сессию
                </button>
              )}
            </div>
          ) : (
            <div className="sessions-grid">
              {getDisplaySessions().map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  currentUser={user}
                  onJoin={handleJoinSession}
                  onLeave={handleLeaveSession}
                  onDelete={handleDeleteSession}
                />
              ))}
            </div>
          )}
        </div>
      )}

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