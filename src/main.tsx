import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getTheme } from './lib/storage'
import './index.css'
import App from './App.tsx'

document.documentElement.setAttribute('data-theme', getTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
