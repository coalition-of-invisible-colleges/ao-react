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
import { AoGrid } from './components/grid'
import Card from './components/card'
import aoStore from './client/store'
import api from './client/api'
import { observer } from 'mobx-react'
import Login from './components/Login'

const ProtectedRoute = ({ component: Comp, loggedIn, path, ...rest }) => {
  console.log('logged in?', loggedIn)
  return (
    <Route
      path={path}
      {...rest}
      render={props => {
        return loggedIn ? <Comp {...props} /> : <Redirect to="/login" />
      }}
    />
  )
}

const App = observer(() => {
  const [render, setRender] = useState(false)
  const [theme, setTheme] = useState(1)
  useEffect(() => {
    document.body.className = 'theme-1'
    api.fetchState().then(() => {
      console.log('in fetch', aoStore.state.loggedIn)
      setRender(true)
      if (aoStore.state.loggedIn) {
        api.onLoad()
      }
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
    console.log('state', aoStore.state.loggedIn)
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
                  <Link to="/task/a31033b0-793f-11ea-9597-55c4b88fddef">
                    About
                  </Link>
                </li>
              </ul>
            </nav>

            {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
            <Switch>
              <Route path="/login">
                <Login />
              </Route>
              <ProtectedRoute
                path="/task/:taskID"
                component={Card}
                loggedIn={aoStore.state.loggedIn}
              />
              <ProtectedRoute
                path="/"
                component={AoGrid}
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
