import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PokeDetailProvider } from './context/PokeDetailContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PokeDetailProvider>
      <App />
    </PokeDetailProvider>
  </StrictMode>,
);
