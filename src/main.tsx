import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="വിന്യാസ ആപ്പ് ആരംഭിക്കുന്നതിൽ തടസ്സം നേരിട്ടു" fallbackMessage="Application recovered gracefully. Please reload to continue.">
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
