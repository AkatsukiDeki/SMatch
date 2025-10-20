import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, matchingAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    faculty: '',
    year_of_study: '',
    bio: '',
    university_id: ''
  });
  const [universities, setUniversities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [userSubjects, setUserSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ subject_id: '', level: 'beginner' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        faculty: user.profile?.faculty || '',
        year_of_study: user.profile?.year_of_study || '',
        bio: user.profile?.bio || '',
        university_id: user.profile?.university?.id || ''
      });
    }
    loadUniversities();
    loadSubjects();
    loadUserSubjects();
  }, [user]);

  const loadUniversities = async () => {
    try {
      const response = await authAPI.getUniversities();
      setUniversities(response.data);
    } catch (error) {
      console.error('Error loading universities:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await matchingAPI.getSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadUserSubjects = async () => {
    try {
      const response = await matchingAPI.getUserSubjects();
      setUserSubjects(response.data);
    } catch (error) {
      console.error('Error loading user subjects:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubjectChange = (e) => {
    setNewSubject({
      ...newSubject,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    console.log('🔍 ДИАГНОСТИКА - Начало обновления профиля');
    console.log('📤 Отправляемые данные:', formData);

    try {
      // 1. Отправляем обновление на сервер
      await authAPI.updateProfile(formData);
      console.log('✅ Профиль обновлен на сервере');

      // 2. ОБНОВЛЯЕМ: Используем refreshUser для получения свежих данных
      console.log('🔄 Запрашиваем обновленные данные...');
      await refreshUser();

      setMessage('✅ Профиль успешно обновлен!');

      // 3. Переключаем на вкладку просмотра
      setTimeout(() => {
        setActiveTab('view');
      }, 1500);

    } catch (error) {
      console.error('❌ Ошибка при обновлении профиля:', error);

      let errorMessage = 'Ошибка при обновлении профиля';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = Object.values(error.response.data).flat().join(', ');
        } else {
          errorMessage = error.response.data;
        }
      }

      setMessage('❌ ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.subject_id) {
      setMessage('Выберите предмет');
      return;
    }

    try {
      await matchingAPI.addUserSubject(newSubject);
      setNewSubject({ subject_id: '', level: 'beginner' });
      setMessage('Предмет добавлен!');
      loadUserSubjects();
    } catch (error) {
      setMessage('Ошибка при добавлении предмета');
      console.error('Error adding subject:', error);
    }
  };

  const handleRemoveSubject = async (subjectId) => {
    try {
      await matchingAPI.deleteUserSubject(subjectId);
      setMessage('Предмет удален!');
      loadUserSubjects();
    } catch (error) {
      setMessage('Ошибка при удалении предмета');
      console.error('Error removing subject:', error);
    }
  };

  const getLevelText = (level) => {
    const levels = {
      'beginner': 'Начинающий',
      'intermediate': 'Средний',
      'advanced': 'Продвинутый'
    };
    return levels[level] || level;
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="auth-required">
          <h2>Пожалуйста, войдите в систему</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Мой профиль</h1>
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            📝 Редактировать профиль
          </button>
          <button
            className={`tab ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            📚 Мои предметы
          </button>
          <button
            className={`tab ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            👁️ Просмотр профиля
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('успешно') || message.includes('добавлен') || message.includes('удален') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="profile-edit">
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>Основная информация</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Имя *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Фамилия *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Университет</label>
                <select
                  name="university_id"
                  value={formData.university_id}
                  onChange={handleChange}
                >
                  <option value="">Выберите университет</option>
                  {universities.map(uni => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Факультет *</label>
                  <input
                    type="text"
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                    placeholder="Например, Факультет информатики"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Курс *</label>
                  <select
                    name="year_of_study"
                    value={formData.year_of_study}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Выберите курс</option>
                    <option value={1}>1 курс</option>
                    <option value={2}>2 курс</option>
                    <option value={3}>3 курс</option>
                    <option value={4}>4 курс</option>
                    <option value={5}>5 курс</option>
                    <option value={6}>6 курс</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Дополнительная информация</h3>

              <div className="form-group">
                <label>О себе</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Расскажите о себе, ваших интересах и целях обучения..."
                  maxLength="500"
                />
                <div className="char-count">{formData.bio.length}/500</div>
              </div>
            </div>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="subjects-management">
          <div className="add-subject-form">
            <h3>Добавить предмет</h3>
            <form onSubmit={handleAddSubject} className="subject-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Предмет *</label>
                  <select
                    name="subject_id"
                    value={newSubject.subject_id}
                    onChange={handleSubjectChange}
                    required
                  >
                    <option value="">Выберите предмет</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Уровень *</label>
                  <select
                    name="level"
                    value={newSubject.level}
                    onChange={handleSubjectChange}
                    required
                  >
                    <option value="beginner">Начинающий</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="add-btn">
                ➕ Добавить предмет
              </button>
            </form>
          </div>

          <div className="user-subjects-list">
            <h3>Мои предметы ({userSubjects.length})</h3>
            {userSubjects.length === 0 ? (
              <div className="no-subjects">
                <p>У вас пока нет добавленных предметов</p>
                <p>Добавьте предметы выше, чтобы улучшить рекомендации</p>
              </div>
            ) : (
              <div className="subjects-grid">
                {userSubjects.map(userSubject => (
                  <div key={userSubject.id} className="subject-card">
                    <div className="subject-info">
                      <h4>{userSubject.subject.name}</h4>
                      <span className={`level-badge ${userSubject.level}`}>
                        {getLevelText(userSubject.level)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveSubject(userSubject.subject.id)}
                      className="remove-btn"
                      title="Удалить предмет"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'view' && (
        <div className="profile-view">
          <div className="profile-card">
            <div className="profile-avatar">
              {user.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
            </div>

            <div className="profile-info">
              <h2>{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}</h2>
              <p className="username">@{user.username}</p>

              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Факультет:</span>
                  <span className="value">{user.profile?.faculty || 'Не указан'}</span>
                </div>

                <div className="info-item">
                  <span className="label">Курс:</span>
                  <span className="value">{user.profile?.year_of_study ? `${user.profile.year_of_study} курс` : 'Не указан'}</span>
                </div>

                <div className="info-item">
                  <span className="label">Уровень:</span>
                  <span className="value">{user.profile?.study_level || 'Не указан'}</span>
                </div>

                <div className="info-item">
                  <span className="label">Университет:</span>
                  <span className="value">{user.profile?.university?.name || 'Не указан'}</span>
                </div>
              </div>

              {user.profile?.bio && (
                <div className="bio-section">
                  <h4>О себе:</h4>
                  <p>{user.profile.bio}</p>
                </div>
              )}

              {userSubjects.length > 0 && (
                <div className="subjects-section">
                  <h4>Мои предметы:</h4>
                  <div className="subjects-tags">
                    {userSubjects.map(userSubject => (
                      <span key={userSubject.id} className="subject-tag">
                        {userSubject.subject.name} ({getLevelText(userSubject.level)})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;