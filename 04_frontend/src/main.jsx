import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimateUIProvider } from '@animate-ui/react/provider'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AnimateUIProvider reducedMotion="user">
      <App />
    </AnimateUIProvider>
  </StrictMode>,
)
