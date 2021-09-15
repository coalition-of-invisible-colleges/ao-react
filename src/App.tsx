// import whyDidYouRender from '@welldone-software/why-did-you-render'
// if (process.env.NODE_ENV === 'development') {
//   console.log('enabling whyDidYouRender')
//   whyDidYouRender(React, {
//     include: [/Ao/],
//     trackAllPureComponents: true
//   })
// }

import { hot } from 'react-hot-loader/root'
import * as React from 'react'
import { useState, useEffect, useReducer } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory
} from 'react-router-dom'
import { observer } from 'mobx-react'
import aoStore from './client/store'
import api from './client/api'
import { goUp } from './cards'
import Login from './components/Login'
import AoMember from './components/Member'
import AoCard from './components/Card'
import AoPopupPanel from './components/popupPanel'
// import './css/themes/my_theme.scss' // import custom CSS themes here

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

if (typeof window !== 'undefined') {
  window.onload = () => {
    console.log('We are in a browser window!')
    //     React.render(App(), document.getElementById("content"));
  }
} else {
  console.log('We are not in a browser window :(')
}

const App = observer(() => {
  const [render, setRender] = useState(false)

  const detectGlobalHotkey = event => {
    if (event.key === 'Escape') {
      if (event.shiftKey) {
        aoStore.clearContext()
      }
      goUp()
      console.log('aoStore.currentCard is ', aoStore.currentCard)
      aoStore.setGlobalRedirect(aoStore.currentCard || './')
    }
  }

  useEffect(() => {
    document.body.className = 'theme-1'
    api.fetchState().then(() => {
      setRender(true)
    })
  }, [])

  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
  useEffect(() => {
    forceUpdate()
  }, [aoStore.globalRedirect, aoStore.currentCard])

  return (
    <div onKeyDown={detectGlobalHotkey}>
      {render && (
        <Router>
          <Switch>
            <Route path="/login" component={Login} />
            <ProtectedRoute
              path="/task/:taskId?"
              component={AoCard}
              loggedIn={aoStore.state.loggedIn}
            />
            <ProtectedRoute
              path="/"
              component={AoMember}
              loggedIn={aoStore.state.loggedIn}
              exact={true}
            />
          </Switch>
        </Router>
      )}
      {!render && (
        <div style={{ marginTop: '21%', fontSize: '1.25em' }}>
          Receiving cards from server...
        </div>
      )}
    </div>
  )
})
export default hot(App)
