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

  // if (!loggedIn && path !== "/login")
  // {
  //   aoStore.state.protectedRouteRedirectPath = path;
  //   // window.localStorage.setItem("AO: ProtectedRouteRedirectPath", path)
  //   console.log("AO: components/App.tsx: ProtectedRoute: ", { path })
  // }

  return (
    <Route
      path={path}
      {...rest}
      render={props => {
        aoStore.state.protectedRouteRedirectPath = props.location.pathname
        // console.log('AO: App.tsx: ProtectedRoute: ', {
        // props,
        //   protectedRouteRedirectPath: props.location.pathname,
        // })

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
    //     React.render(App(), document.getElementById("content"));
  }
} else {
  console.log('We are not in a browser window :(')
}

// this is a component that will route to the community hub card
// const communityHubCardRedirectView = observer(( { communityHubTaskID } => <Redirect to={"/task/"+))
const detectGlobalHotkey = event => {
  // console.log("AO: App.tsx: detectGlobalHotkey: ", {"event": event.toString()} )
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
    // console.log(
    //   'AO: App.tsx: detectGlobalHotKey: aoStore.currentCard is ',
    //   aoStore.currentCard
    // )
    // aoStore.setGlobalRedirect(aoStore.currentCard || './');
    event.stopPropagation()
  }
}

// console.log('AO: App.tsx: body.classList', {
//   classList: document.body.classList,
// })

if (!document.body.classList.contains('initialiseBodyClasses')) {
  if (config?.themes?.length >= 1) {
    document.body.className = config.themes[0]
  }
  document.body.addEventListener('keyup', detectGlobalHotkey)

  document.body.classList.add('initialiseBodyClasses')
}

// this is the root component of the React UI
const App = () => {
  // this state variable is used to render the page once the server side database state has been
  //   fetched.
  // const [render, setRender] = useState(false)

  // this is a UI function for trapping user interaction at the root of the HTML DOM

  // load the initial state from the server, and then render the UI
  // useEffect(() => {
  //   document.body.className = 'theme-1'
  //   api.fetchState().then(() => {

  //     let initialStateComplete =
  //         () =>
  //         {
  //           setRender(true)
  //           console.log("AO: components/App.tsx: useEffect: setRender(true) ")
  //         }

  //     let communityCard =
  //         aoStore.getTaskByName_async
  //         ( "community hub",
  //           (communityCard) =>
  //           {
  //             if (
  //                 !communityCard ||
  //                 !communityCard.hasOwnProperty('taskId') ||
  //                 !communityCard.taskId
  //             ) {
  //                 console.log("AO: components/App.tsx: initialising page, creating community hub card on server")

  //                 api.createCard('community hub').then(result => {
  //                     const newTaskId = JSON.parse(result.text).event.taskId

  //                     console.log("AO: components/App.tsx: initialising page, community hub card created: ", { newTaskId });

  //                     aoStore.setCurrentCard(newTaskId)
  //                     // setHubId(newTaskId)
  //                     initialStateComplete();
  //                 })
  //             } else {
  //                 console.log("AO: components/App.tsx: initialising page, community hub card found in client state: ", { "taskId": communityCard.taskId });

  //                 aoStore.setCurrentCard(communityCard.taskId)
  //                 // setHubId(communityCard.taskId)
  //                 initialStateComplete();
  //             }
  //           }
  //         )
  //   })
  // }, [])

  // this reducer seems to count how many times there has been a context change.
  //   it is not clear to me why this is important. Perhpas its is a debugging stat?
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
  // useEffect
  //     ( () =>
  //       {
  //         aoStore.setGlobalRedirect(null)
  //         forceUpdate()
  //       },
  //       [ aoStore.globalRedirect,
  //         aoStore.currentCard
  //       ]
  //     );

  // const showMouseMove = (event) => console.log("mousemove", event);22

  return (
    <div id="Apptsx_root_div" onKeyDown={detectGlobalHotkey}>
      {}
      {
        // document.getElementById("Apptsx_root_div").addEventListener("keydown", detectGlobalHotkey)
        // value render is false on initial page load.
        // !render &&
        // (
        //   <div style={{ marginTop: '21%', fontSize: '1.25em' }}>
        //     Receiving cards from server...
        //   </div>
        // )
      }

      {
        // value render is set to true when the initial state has been loaded from the server
        // render && (
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

            {
              // the AoMember "component" simply renders the AoCard component [primary root above]
              // , after ensuring that there is a "Community Hub" card.
            }
            {
              // <ProtectedRoute
              //   path="/"
              //   component={AoMember}
              //   loggedIn={aoStore.state.loggedIn}
              //   exact={true}
              // />
            }
          </Switch>
        </Router>
        // )
      }
    </div>
  )
}
export default hot(App)
