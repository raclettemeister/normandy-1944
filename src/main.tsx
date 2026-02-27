import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './content/scenarios/act1/index.ts'
import './content/scenarios/act2/index.ts'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
