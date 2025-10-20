// src/pages/StudySessions.js - УПРОЩАЕМ
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studySessionsAPI } from '../services/api';
import SessionCard from '../components/study-sessions/SessionCard';
import SessionForm from '../components/study-sessions/SessionForm';
import SessionInvitations from '../components/study-sessions/SessionInvitations';
import './StudySessions.css';

const StudySessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const [allSessions, mySessionsData] = await Promise.all([
        studySessionsAPI.getSessions(),
        studySessionsAPI.getMySessions()
      ]);
      setSessions(allSessions.data);
      setMySessions(mySessionsData.data);
    } catch (error) {
      console.error('Ошибка загрузки сессий:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (sessionData) => {
    try {
      await studySessionsAPI.createSession(sessionData);
      setShowForm(false);
      loadSessions(); // Перезагружаем список
    } catch (error) {
      console.error('Ошибка создания сессии:', error);
      alert('Ошибка при создании сессии');
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      await studySessionsAPI.joinSession(sessionId);
      loadSessions(); // Перезагружаем список
      alert('Вы присоединились к сессии!');
    } catch (error) {
      console.error('Ошибка присоединения:', error);
      alert('Ошибка при присоединении к сессии');
    }
  };

  const handleLeaveSession = async (sessionId) => {
    try {
      await studySessionsAPI.leaveSession(sessionId);
      loadSessions();
      alert('Вы покинули сессию');
    } catch (error) {
      console.error('Ошибка выхода:', error);
      alert('Ошибка при выходе из сессии');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту сессию?')) {
      try {
        await studySessionsAPI.deleteSession(sessionId);
        loadSessions();
        alert('Сессия удалена');
      } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка при удалении сессии');
      }
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

  const displaySessions = activeTab === 'my' ? mySessions : sessions;

  return (
    <div className="study-sessions-page">
      <div className="sessions-header">
        <h1>Учебные сессии</h1>
        <p>Организуйте и присоединяйтесь к учебным встречам</p>
        <button
          className="create-session-btn"
          onClick={() => setShowForm(true)}
        >
          ➕ Создать сессию
        </button>
      </div>

      <div className="sessions-tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          📚 Все сессии
        </button>
        <button
          className={`tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          👤 Мои сессии
        </button>
        <button
          className={`tab ${activeTab === 'invitations' ? 'active' : ''}`}
          onClick={() => setActiveTab('invitations')}
        >
          📨 Приглашения
        </button>
      </div>

      <div className="sessions-content">
        {activeTab === 'invitations' ? (
          <SessionInvitations />
        ) : (
          <>
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Загрузка сессий...</p>
              </div>
            ) : displaySessions.length === 0 ? (
              <div className="no-sessions">
                <h3>Пока нет сессий</h3>
                <p>{activeTab === 'all'
                  ? 'Будьте первым, кто создаст учебную сессию!'
                  : 'Вы еще не создали и не присоединились к сессиям'
                }</p>
                {activeTab === 'my' && (
                  <button
                    className="create-session-btn"
                    onClick={() => setShowForm(true)}
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