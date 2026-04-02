import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import reportWebVitals from './reportWebVitals';

// Suprimir errores de terceros que no afectan la aplicación
window.addEventListener('error', (event) => {
    if (event.error && event.error.message && 
        event.error.message.includes('getRangeAt') && 
        event.error.message.includes('Selection')) {
        event.preventDefault();
        console.debug('Error de terceros suprimido:', event.error.message);
    }
});

window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('getRangeAt')) {
        event.preventDefault();
        console.debug('Promise rejection de terceros suprimida:', event.reason.message);
    }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BrowserRouter>
          <App />
      </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
