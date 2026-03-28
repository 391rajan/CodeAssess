import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#0a0a0f', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <App />
    </BrowserRouter>
  </StrictMode>,
)
