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
import { renderRoutes } from 'react-router-config'
import routes from './routes'
import AoMember from './components/Member'
import AoGrid from './components/grid'
import AoCard from './components/Card'
import aoStore from './client/store'
import api from './client/api'
import { observer } from 'mobx-react'
import Login from './components/Login'
import AoMembers from './components/Members'
import AoStatus from './components/status'
import AoServerName from './components/serverName'
import AoUsername from './components/username'
import AoPassword from './components/password'
import AoVolume from './components/volume'
import AoSearch from './components/search'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

// const ProtectedRoute = ({ component: Comp, loggedIn, path, ...rest }) => {
//   return (
//     <Route
//       path={path}
//       {...rest}
//       render={props => {
//         console.log
//         return loggedIn ? <Comp {...props} /> : <Redirect to="/login" />
//       }}
//     />
//   )
// }

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

  const MainMenu: React.FunctionComponent<{}> = () => {
    return (
      <div id={'mainMenu'}>
        <AoServerName />
        <AoUsername />
        <AoPassword />
        <AoVolume />
        <div onClick={changeTheme} id={'themer'} className={'action'}>
          Next Theme
        </div>
        <div onClick={onLogout} id="logout" className={'action'}>
          Log Out
        </div>
      </div>
    )
  }

  return (
    <div>
      {render && (
        <Router>
          <nav>
            <Link to="/" id="home">
              Home
            </Link>
            <ProtectedFragment loggedIn={aoStore.state.loggedIn}>
              <Link to="/members" id="members">
                Members
              </Link>
            </ProtectedFragment>
          </nav>
          <ProtectedFragment loggedIn={aoStore.state.loggedIn}>
            <Tippy
              content={<MainMenu />}
              interactive={true}
              trigger={'click'}
              placement={'top-end'}>
              <div id={'mainMenuButton'}>&#x22EE;</div>
            </Tippy>
            <AoSearch />
          </ProtectedFragment>
          <Switch>
            <Route path="/login">
              <Login />
            </Route>
            {renderRoutes(routes, aoStore.state.loggedIn, '/login')}
          </Switch>
        </Router>
      )}
      {!render && <div>Logging in…</div>}
    </div>
  )
})
export default hot(App)
