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
  useHistory,
} from 'react-router-dom'
import { observer } from 'mobx-react'
import aoStore from './client/store'
import api from './client/api'
import { goUp } from './cardTypes'
import Login from './components/Login'
import AoMember from './components/Member'
import AoCard from './components/Card'
import AoPopupPanel from './components/popupPanel'
import config from '../configuration'
// import './css/themes/_florid.scss' // import custom CSS themes here for permanent application to your server

const ProtectedRoute = ({ component: Comp, path, ...rest }) => {
  let loggedIn = aoStore.state.loggedIn

  return (
    <Route
      path={path}
      {...rest}
      render={props => {
        aoStore.state.protectedRouteRedirectPath = props.location.pathname

        return loggedIn ? <Comp {...props} /> : <Redirect to="/login" />
      }}
    />
  )
}

const ProtectedFragment: React.FunctionComponent = ({ children }) => {
  let loggedIn = aoStore.state.loggedIn
  return loggedIn ? <React.Fragment>{children}</React.Fragment> : null
}

if (typeof window !== 'undefined') {
  window.onload = () => {
    console.log('We are in a browser window!')
  }
} else {
  console.log('We are not in a browser window :(')
}

// this is a component that will route to the community hub card
// const communityHubCardRedirectView = observer(( { communityHubTaskID } => <Redirect to={"/task/"+))
const detectGlobalHotkey = event => {
  if (event.target.tagName === "INPUT" || event.target.tagName === "BUTTON"){
    return
  }
  if (event.key === 'Escape') {
    if (event.shiftKey) {
      // empty the context stack
      aoStore.clearContext()
    }
    // shift one card up (fewer) in the context stack
    goUp()

    // this currentCard / current "contextCard" paradigm means that there is one central card in the UI
    //   at a time
    // this card should be the same as the card represented in the address bar, hence the redirect concept
    event.stopPropagation()
  }
}

if (!document.body.classList.contains('initialiseBodyClasses')) {
  if (config?.themes?.length >= 1) {
    document.body.className = config.themes[0]
  }
  document.body.addEventListener('keyup', detectGlobalHotkey)

  document.body.classList.add('initialiseBodyClasses')
}

// this is the root component of the React UI
const App = () => {
  // this reducer seems to count how many times there has been a context change.
  //  it is not clear to me why this is important. Perhpas its is a debugging stat?
  //const [ignored, forceUpdate] = useReducer(x => x + 1, 0)

  return (
    <div id="Apptsx_root_div" onKeyPress={detectGlobalHotkey}>
        <Router>
          <Switch>
            {
              // the login page
            }
            <Route path="/login" component={Login} />
            {
              // this is the primary application route
            }
            <ProtectedRoute path="/task/:taskId?" component={AoCard} />
            <ProtectedRoute path="/" component={AoCard} />
          </Switch>
        </Router>
    </div>
  )
}
export default hot(App)
