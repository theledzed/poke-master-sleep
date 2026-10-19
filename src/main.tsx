import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { Analytics } from '@vercel/analytics/react';
import './index.css';

const rootElement = document.getElementById('root')!;

if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <App />
      <Analytics />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
      <Analytics />
    </React.StrictMode>
  );
}
