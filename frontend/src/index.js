// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import './responsive.css';

// Создаем корневой элемент React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Рендерим приложение
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Опционально: Если нужно измерить производительность
// reportWebVitals(console.log);