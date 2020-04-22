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
        }
      })
  }
  const onKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onClick(e)
    }
  }
  return (
    <div>
      {!loggedIn && (
        <form onSubmit={onKeyDown}>
          <div>
            Username:
            <input
              value={user}
              type="text"
              onChange={e => setUser(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <div>
            Password:
            <input
              value={pass}
              type="password"
              onChange={e => setPass(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <button type="button" onClick={onClick}>
            Login
          </button>
        </form>
      )}
      {loggedIn && <Redirect to="/" />}
    </div>
  )
}

export default Login
