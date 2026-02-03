import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { SettingsProvider } from './context/SettingsContext'
import { ToastProvider } from './context/ToastContext'
import { ensureSampleData } from './data/db'
import { Dashboard } from './pages/Dashboard'
import { Generate } from './pages/Generate'
import { Progress } from './pages/Progress'
import { Results } from './pages/Results'
import { Settings } from './pages/Settings'
import { StudySession } from './pages/StudySession'
import { StudySetEditor } from './pages/StudySetEditor'

const App = () => {
  useEffect(() => {
    ensureSampleData()
  }, [])

  return (
    <SettingsProvider>
      <ToastProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sets/:setId/edit" element={<StudySetEditor />} />
            <Route path="/sets/:setId/generate" element={<Generate />} />
            <Route path="/sets/:setId/study" element={<StudySession />} />
            <Route path="/results/:attemptId" element={<Results />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AppLayout>
      </ToastProvider>
    </SettingsProvider>
  )
}

export default App
