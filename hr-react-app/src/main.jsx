import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import CSS in the correct order - global styles first
import './index.css'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
