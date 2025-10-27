import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/common/Layout';
import NotificationContainer from './components/common/NotificationContainer';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Matching from './pages/Matching';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import StudySessions from './pages/StudySessions';
import './App.css';

// ИМПОРТЫ ДЛЯ СТАТИЧЕСКИХ СТРАНИЦ - ДОБАВИТЬ!
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';

// Отладочные сообщения
console.log('🔍 About component:', typeof About);
console.log('🔍 Contact component:', typeof Contact);
console.log('🔍 Privacy component:', typeof Privacy);

function App() {
  console.log('🚀 App component rendered');

  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <NotificationContainer />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/matching" element={<Matching />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/sessions" element={<StudySessions />} />

              {/* ДОБАВИТЬ МАРШРУТЫ ДЛЯ СТАТИЧЕСКИХ СТРАНИЦ */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />

              <Route path="*" element={
                <div className="not-found">
                  <h2>404 - Страница не найдена</h2>
                  <p>Запрашиваемая страница не существует.</p>
                </div>
              } />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;