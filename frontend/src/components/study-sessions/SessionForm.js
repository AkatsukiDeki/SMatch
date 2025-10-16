// src/components/study-sessions/SessionForm.js
import React, { useState } from 'react';
import './StudySessions.css';

const SessionForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_name: '',
    scheduled_time: '',
    duration_minutes: 60,
    max_participants: 4
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' || name === 'max_participants'
        ? parseInt(value)
        : value
    }));
  };

  // Минимальная дата - текущее время + 1 час
  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 1);
  const minDateTimeString = minDateTime.toISOString().slice(0, 16);

  return (
    <div className="modal-overlay">
      <div className="session-form-modal">
        <h2>Создать учебную сессию</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Название сессии *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Например: Подготовка к экзамену по математике"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Опишите цели и план сессии..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject_name">Предмет *</label>
            <input
              type="text"
              id="subject_name"
              name="subject_name"
              value={formData.subject_name}
              onChange={handleChange}
              required
              placeholder="Например: Математический анализ"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="scheduled_time">Дата и время *</label>
              <input
                type="datetime-local"
                id="scheduled_time"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
                min={minDateTimeString}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration_minutes">Длительность (минуты)</label>
              <select
                id="duration_minutes"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
              >
                <option value={30}>30 минут</option>
                <option value={60}>1 час</option>
                <option value={90}>1.5 часа</option>
                <option value={120}>2 часа</option>
                <option value={180}>3 часа</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="max_participants">Максимум участников</label>
            <select
              id="max_participants"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleChange}
            >
              <option value={2}>2 человека</option>
              <option value={3}>3 человека</option>
              <option value={4}>4 человека</option>
              <option value={5}>5 человек</option>
              <option value={6}>6 человек</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !formData.title || !formData.subject_name || !formData.scheduled_time}
            >
              {loading ? 'Создание...' : 'Создать сессию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionForm;