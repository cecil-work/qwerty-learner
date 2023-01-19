import React from 'react'
import { AppStateProvider } from 'store/AppState'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import GalleryPage from './pages/Gallery'
import TypingPage from './pages/Typing'
import { IsDesktop } from 'utils/utils'
import { ChoiceApp } from 'pages/Choice'

export function App() {
  if (IsDesktop()) {
    return <DesktopApp />
  } else {
    return <MobileApp />
  }
}

function MobileApp() {
  return (
    <React.StrictMode>
      <AppStateProvider>
        <Router basename={process.env.REACT_APP_DEPLOY_ENV === 'travis' ? '/qwerty-learner' : ''}>
          <Route path="/">
            <ChoiceApp />
          </Route>
        </Router>
      </AppStateProvider>
    </React.StrictMode>
  )
}

function DesktopApp() {
  return (
    <React.StrictMode>
      <AppStateProvider>
        <Router basename={process.env.REACT_APP_DEPLOY_ENV === 'travis' ? '/qwerty-learner' : ''}>
          <Switch>
            <Route path="/gallery">
              <GalleryPage />
            </Route>
            <Route path="/">
              <TypingPage />
            </Route>
          </Switch>
        </Router>
      </AppStateProvider>
    </React.StrictMode>
  )
}
