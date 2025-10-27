import React from 'react';
import './StaticPages.css';

const Contact = () => {
  console.log('📍 Contact component loaded');
  return (
    <div className="static-page">
      <div className="static-container">
        <h1>Контакты</h1>
        <div className="static-content">
          <div className="contact-info">
            <h2>Свяжитесь с нами</h2>
            <p>
              Есть вопросы или предложения? Мы всегда рады помочь и услышать ваше мнение!
            </p>

            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-icon">📧</div>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p>support@studymatch.com</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">💬</div>
                <div className="contact-details">
                  <h3>Техническая поддержка</h3>
                  <p>Доступна 24/7 в разделе "Помощь"</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">🚀</div>
                <div className="contact-details">
                  <h3>Предложения</h3>
                  <p>Есть идея для улучшения? Напишите нам!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;