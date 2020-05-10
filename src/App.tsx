import { hot } from 'react-hot-loader/root'
import * as React from 'react'
import { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from 'react-router-dom'
import AoMember from './components/Member'
import AoGrid from './components/grid'
import AoCard from './components/Card'
import aoStore from './client/store'
import api from './client/api'
import { observer } from 'mobx-react'
import Login from './components/Login'
import AoMembers from './components/Members'
import AoStatus from './components/status'
import AoVolume from './components/volume'
import AoSearch from './components/search'

const ProtectedRoute = ({ component: Comp, loggedIn, path, ...rest }) => {
  return (
    <Route
      path={path}
      {...rest}
      render={props => {
        console.log
        return loggedIn ? <Comp {...props} /> : <Redirect to="/login" />
      }}
    />
  )
}

const ProtectedFragment: React.FunctionComponent<{ loggedIn: boolean }> = ({
  children,
  loggedIn
}) => {
  return loggedIn ? <React.Fragment>{children}</React.Fragment> : null
}

const App = observer(() => {
  const [render, setRender] = useState(false)
  const [theme, setTheme] = useState(1)
  useEffect(() => {
    document.body.className = 'theme-1'
    api.fetchState().then(() => {
      setRender(true)
    })
  }, [])
  const changeTheme = () => {
    if (theme == 3) {
      setTheme(1)
      document.body.className = 'theme-1'
    } else {
      const newTheme = theme + 1
      document.body.className = 'theme-' + newTheme
      setTheme(newTheme)
    }
  }
  const onLogout = () => {
    api.logout()
    console.log('logged out', aoStore.state.loggedIn)
  }
  return (
    <div>
      {render && (
        <Router>
          <nav>
            <button type="button" onClick={changeTheme} id="themer">
              Change theme
            </button>
            <button type="button" onClick={onLogout} id="logout">
              Log out
            </button>
            <Link to="/" id="home">
              Home
            </Link>
            <Link to="/members" id="members">
              Members
            </Link>
          </nav>
          <ProtectedFragment loggedIn={aoStore.state.loggedIn}>
            <AoStatus />
            <AoVolume />
            <AoSearch />
          </ProtectedFragment>

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/login">
              <Login />
            </Route>
            <ProtectedRoute
              path="/members"
              component={AoMembers}
              loggedIn={aoStore.state.loggedIn}
            />
            <ProtectedRoute
              path="/task"
              component={AoCard}
              loggedIn={aoStore.state.loggedIn}
            />
            <ProtectedRoute
              path="/grid"
              component={AoGrid}
              loggedIn={aoStore.state.loggedIn}
            />
            <ProtectedRoute
              path="/"
              component={AoMember}
              loggedIn={aoStore.state.loggedIn}
            />
            {/* <Route path="/task/:taskId">
                <Card />
              </Route>
              <Route path="/">
                <AoGrid />
              </Route> */}
          </Switch>
        </Router>
      )}
      {!render && <div>Logging in </div>}
    </div>
  )
})
export default hot(App)
