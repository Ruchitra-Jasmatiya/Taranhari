import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/theme.css';
import './styles/global.css';
import { applySavedTheme } from './lib/theme.js';

// Apply the saved colour theme (A, B or C) before the first paint
applySavedTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
