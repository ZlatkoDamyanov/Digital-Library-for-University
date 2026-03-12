/**
 * Главна точка за влизане на React приложението
 * Инициализира и рендерира основния App компонент
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

// Възможност за измерване на производителността чрез Web Vitals
// може да бъде активирана при нужда от по-детайлен мониторинг
