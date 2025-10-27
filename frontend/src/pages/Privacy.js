import React from 'react';
import './StaticPages.css';

const Privacy = () => {
  console.log('📍 Privacy component loaded');
  return (
    <div className="static-page">
      <div className="static-container">
        <h1>Конфиденциальность</h1>
        <div className="static-content">
          <div className="privacy-section">
            <h2>Политика конфиденциальности</h2>
            <p>
              Мы серьезно относимся к защите ваших персональных данных.
              Эта политика объясняет, какие данные мы собираем и как их используем.
            </p>
          </div>

          <div className="privacy-section">
            <h3>Какие данные мы собираем</h3>
            <ul>
              <li>Основная информация профиля (имя, университет, факультет)</li>
              <li>Учебные предметы и уровень подготовки</li>
              <li>Сообщения в чатах (хранятся зашифрованными)</li>
              <li>История учебных сессий</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h3>Как мы используем данные</h3>
            <ul>
              <li>Для подбора подходящих партнеров по обучению</li>
              <li>Для улучшения работы платформы</li>
              <li>Для обеспечения безопасности всех пользователей</li>
              <li>Мы НЕ продаем ваши данные третьим лицам</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;