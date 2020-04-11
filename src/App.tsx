import { hot } from 'react-hot-loader/root'
import * as React from 'react'
import { useState } from 'react'
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

const App = () => {
  // const [render, setRender] = useState(false)
  // api.fetchState().then(v => {
  //   console.log('state fetched')
  //   setRender(true)
  //   if (aoStore.state.loggedIn) {
  //     api.onLoad()
  //   }
  // })
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/task/a31033b0-793f-11ea-9597-55c4b88fddef">About</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          {/* <ProtectedRoute
              path="/task/:taskID"
              component={Card}
              loggedIn={aoStore.state.loggedIn}
            />
            <ProtectedRoute
              path=""
              component={AoGrid}
              loggedIn={aoStore.state.loggedIn}
            /> */}
          <Route path="/task/:taskId">
            <Card />
          </Route>
          <Route path="/">
            <AoGrid />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
export default hot(App)
