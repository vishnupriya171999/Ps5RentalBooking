import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './index.css'
import App from './App'
import { initializeSession } from './auth/sessionLifecycle'

const cleanupSession = initializeSession()
if (import.meta.hot) import.meta.hot.dispose(cleanupSession)

const root = document.getElementById('root')
if (!root) throw new Error('Root element is missing')

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)