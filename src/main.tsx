import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/400-italic.css';
import '@fontsource/stix-two-text/400.css';
import '@fontsource/stix-two-text/500.css';
import '@fontsource/stix-two-text/600.css';
import '@fontsource/stix-two-text/700.css';
import '@fontsource/stix-two-text/400-italic.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App';
import './styles/global.css';
import './styles/elementor-compat.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
