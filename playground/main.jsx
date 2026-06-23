import React from 'react';
import { createRoot } from 'react-dom/client';
// Compiled live by @tailwindcss/vite — this is the same stylesheet (source)
// that `pnpm build:css` ships to consumers as dist/design-system.css.
import '../styles/design-system.css';
import App from './App.jsx';

// App owns its own router context: a BrowserRouter for the gallery views and a
// standalone data router for the Error404Page preview. Nesting one Router inside
// another is illegal in react-router, so App must be the top-level router host.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
