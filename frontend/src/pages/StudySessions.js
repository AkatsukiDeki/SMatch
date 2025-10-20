// src/pages/StudySessions.js
import React, { useState } from 'react';
import SessionInvitations from '../components/study-sessions/SessionInvitations'; // Проверьте путь
import './StudySessions.css';

const StudySessions = () => {
  const [activeTab, setActiveTab] = useState('my-sessions');

  return (
    <div className="study-sessions-page">
      <div className="sessions-header">
        <h1>Учебные сессии</h1>
        <p>Организуйте и присоединяйтесь к учебным сессиям</p>
      </div>

      <div className="sessions-tabs">
        <button
          className={`tab ${activeTab === 'my-sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-sessions')}
        >
          📚 Мои сессии
        </button>
        <button
          className={`tab ${activeTab === 'invitations' ? 'active' : ''}`}
          onClick={() => setActiveTab('invitations')}
        >
          📨 Приглашения
        </button>
      </div>

      <div className="sessions-content">
        {activeTab === 'invitations' && <SessionInvitations />}
        {activeTab === 'my-sessions' && (
          <div className="my-sessions">
            <p>Здесь будут ваши учебные сессии</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySessions;