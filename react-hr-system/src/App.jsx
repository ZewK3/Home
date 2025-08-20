import { AuthProvider } from './context/AuthContext.jsx'
import { AppRouter } from './router/index.jsx'
import './styles/layout.css'
import './styles/examples.css'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
