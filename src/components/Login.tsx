import * as React from 'react'
import { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import api from '../client/api'

const Login: React.FunctionComponent<{}> = () => {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const onClick = e => {
    api
      .createSession(user, pass)
      .then(api.fetchState)
      .then(res => {
        if (res) setLoggedIn(true)
        else {
          setUser('')
          setUser('')
        }
      })
  }
  return (
    <div>
      {!loggedIn && (
        <div>
          <div>
            Username:
            <input
              value={user}
              type="text"
              onChange={e => setUser(e.target.value)}
            />
          </div>
          <div>
            Password:
            <input
              value={pass}
              type="password"
              onChange={e => setPass(e.target.value)}
            />
          </div>
          <button type="button" onClick={onClick}>
            Login
          </button>
        </div>
      )}
      {loggedIn && <Redirect to="/" />}
    </div>
  )
}

export default Login
