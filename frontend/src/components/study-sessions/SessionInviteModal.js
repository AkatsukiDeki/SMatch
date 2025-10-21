const handleSendInvitation = async (user) => {
  try {
    setSending(true);
    console.log(`📤 Отправка приглашения пользователю ${user.username} на сессию ${session.id}`);

    const response = await studySessionsAPI.sendInvitation(session.id, user.id);
    console.log('✅ Ответ от API:', response.data);

    alert(`✅ Приглашение отправлено пользователю ${user.first_name || user.username}!`);
    setSelectedUser(user);

    if (onInviteSent) {
      onInviteSent();
    }

  } catch (error) {
    console.error('❌ Ошибка отправки приглашения:', error);
    const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Ошибка при отправке приглашения';
    alert(`❌ ${errorMessage}`);
  } finally {
    setSending(false);
  }
};
