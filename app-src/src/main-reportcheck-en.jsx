import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import ReportCheckApp from './reportcheck/ReportCheckApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReportCheckApp lang="en" />
  </StrictMode>,
)
