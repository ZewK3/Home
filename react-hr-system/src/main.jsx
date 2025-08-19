import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
// import './styles/base.css'
// import './styles/components.css'
// import './styles/navigation.css'
// import './styles/modals.css'
// import './styles/containers.css'
// import './styles/dash.css'
// import './styles/auth.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
