// src/components/profile/AvatarUpload.js
import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import './AvatarUpload.css';

const AvatarUpload = ({ currentAvatar, onAvatarUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка типа файла
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Поддерживаются только JPG, PNG, GIF и WebP');
      return;
    }

    // Проверка размера
    if (file.size > 5 * 1024 * 1024) {
      setError('Файл должен быть меньше 5MB');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await authAPI.uploadAvatar(formData);

      if (onAvatarUpdate) {
        onAvatarUpdate(response.data);
      }

      console.log('✅ Аватар успешно загружен');
    } catch (error) {
      console.error('❌ Ошибка загрузки аватарки:', error);
      setError(error.response?.data?.error || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Удалить аватар?')) return;

    try {
      await authAPI.deleteAvatar();
      if (onAvatarUpdate) {
        onAvatarUpdate(null);
      }
      console.log('✅ Аватар удален');
    } catch (error) {
      console.error('❌ Ошибка удаления аватарки:', error);
      setError('Ошибка удаления');
    }
  };

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        {currentAvatar?.image_url ? (
          <img
            src={currentAvatar.image_url}
            alt="Аватар"
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            👤
          </div>
        )}
      </div>

      <div className="avatar-actions">
        <label className="upload-btn">
          {loading ? 'Загрузка...' : '📷 Сменить аватар'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={loading}
            style={{ display: 'none' }}
          />
        </label>

        {currentAvatar?.image_url && (
          <button
            className="delete-btn"
            onClick={handleDeleteAvatar}
            disabled={loading}
          >
            🗑️ Удалить
          </button>
        )}
      </div>

      {error && <div className="avatar-error">{error}</div>}
    </div>
  );
};

export default AvatarUpload;