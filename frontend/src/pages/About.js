import React from 'react';
import './StaticPages.css';

const About = () => {
  console.log('📍 About component loaded');
  return (
    <div className="static-page">
      <div className="static-container">
        <h1>О нас</h1>
        <div className="static-content">
          <div className="about-hero">
            <h2>StudyMatch - учиться вместе веселее! 🎯</h2>
            <p>
              Мы создали платформу, которая превращает одинокую учебу в увлекательный
              социальный опыт. Наша миссия - помочь студентам находить единомышленников
              для совместного обучения и достижения академических целей.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Сообщество</h3>
              <p>Присоединяйтесь к сообществу мотивированных студентов</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Подбор</h3>
              <p>Умный алгоритм найдет идеальных партнеров для обучения</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Сессии</h3>
              <p>Организуйте учебные встречи и делитесь знаниями</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;