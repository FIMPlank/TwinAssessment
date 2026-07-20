import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import WorkshopApp from './workshop/WorkshopApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WorkshopApp lang="de" />
  </StrictMode>,
)
