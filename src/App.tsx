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
import AoGrids from './components/Grids'
import AoGrid from './components/grid'
import AoCard from './components/card'
import aoStore from './client/store'
import api from './client/api'
import { observer } from 'mobx-react'
import Login from './components/Login'
import Members from './components/Members'
import AoStatus from './components/status'
import AoVolume from './components/volume'

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
          <div>
            <nav>
              <ul>
                <li>
                  <button type="button" onClick={changeTheme}>
                    Change theme
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onLogout}>
                    Log out
                  </button>
                </li>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/members">Members</Link>
                </li>
              </ul>
            </nav>
            <ProtectedFragment loggedIn={aoStore.state.loggedIn}>
              <AoStatus />
              <AoVolume />
            </ProtectedFragment>

            {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
            <Switch>
              <Route path="/login">
                <Login />
              </Route>
              <ProtectedRoute
                path="/members"
                component={Members}
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
                component={AoGrids}
                loggedIn={aoStore.state.loggedIn}
              />
              {/* <Route path="/task/:taskId">
                <Card />
              </Route>
              <Route path="/">
                <AoGrid />
              </Route> */}
            </Switch>
          </div>
        </Router>
      )}
      {!render && <div>Logging in </div>}
    </div>
  )
})
export default hot(App)
