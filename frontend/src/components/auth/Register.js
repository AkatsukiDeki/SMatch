// src/components/auth/Register.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth(); // Используем register из контекста
  const navigate = useNavigate(); // Для навигации после успешной регистрации

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Проверка пароля
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    try {
      console.log('Отправка данных регистрации:', formData);

      // Используем register из контекста - он сам сохранит токены и установит пользователя
      await register(formData);
      console.log('Регистрация успешна!');

      // Перенаправляем на главную страницу
      navigate('/');

    } catch (error) {
      console.error('Полная ошибка регистрации:', error);
      console.error('Данные ошибки:', error.response?.data);

      let errorMessage = 'Ошибка регистрации';

      if (error.response?.data) {
        // Обработка ошибок валидации от Django
        const data = error.response.data;

        if (data.username) {
          errorMessage = `Логин: ${data.username[0]}`;
        } else if (data.email) {
          errorMessage = `Email: ${data.email[0]}`;
        } else if (data.password) {
          errorMessage = `Пароль: ${data.password[0]}`;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else {
          errorMessage = 'Проверьте введенные данные';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Регистрация в StudyMatch</h2>

        {/* Детальное отображение ошибки */}
        {error && (
          <div className="error-message" style={{ whiteSpace: 'pre-wrap' }}>
            <strong>Ошибка:</strong> {error}
            <br />
            <small>Проверьте консоль браузера для подробностей</small>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Логин *"
            value={formData.username}
            onChange={handleChange}
            required
            minLength="3"
          />
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="first_name"
            placeholder="Имя"
            value={formData.first_name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="last_name"
            placeholder="Фамилия"
            value={formData.last_name}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль *"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;