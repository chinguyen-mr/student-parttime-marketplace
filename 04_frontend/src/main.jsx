import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimateUIProvider } from '@animate-ui/react/provider'
import './index.css'
import App from './App.jsx'
import { installMobileTableLabels } from './utils/mobileTables'

// Điện thoại: gắn nhãn cột cho ô bảng để bảng hiển thị dạng thẻ
installMobileTableLabels()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AnimateUIProvider reducedMotion="user">
      <App />
    </AnimateUIProvider>
  </StrictMode>,
)
