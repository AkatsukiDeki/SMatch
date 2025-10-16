// src/pages/Profile.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Пожалуйста, войдите в систему</div>;
  }

  return (
    <div className="page">
      <h1>Мой профиль</h1>
      <div className="profile-info">
        <p><strong>Имя пользователя:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Имя:</strong> {user.first_name} {user.last_name}</p>
      </div>
    </div>
  );
};

export default Profile;