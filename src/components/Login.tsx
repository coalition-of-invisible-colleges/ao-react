import * as React from 'react'
import { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import api from '../client/api'
import config from '../../configuration'

const Login: React.FunctionComponent<{}> = () => {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const onClick = e => {
    api
      .createSession(user, pass)
      .then(api.fetchState)
      .then(res => {
        if (res) {
          setError('Login successful')
          setLoggedIn(true)
        } else {
          setUser('')
        }
      })
      .catch(err => {
        setError('Login failed.')
      })
  }
  const onKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onClick(e)
    }
  }
  return (
    <div id="login">
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
          <div className="successMessage">{success}</div>
          <div className="errorMessage">{error}</div>
        </form>
      )}
      {loggedIn && <Redirect to="/" />}
      <div className="about">
        <h1>What is the AO?</h1>
        <p>
          AO stands for Autonomous Organization. The Autonomous Organization
          will help you get organized, and organize your online or offline
          community.
        </p>
        <p>Here are some of the AO's main uses:</p>
        <div className="flex">
          <div>
            <h2>Gamified Meme Trading</h2>
            <ul>
              <li>Collect a meme or meme pack with one tap</li>
              <li>Organize memes on shared game boards</li>
            </ul>
          </div>
          <div>
            <h2>Darknet Library</h2>
            <ul>
              <li>Upload memes to share with other members</li>
              <li>AO nodes sync p2p over tor (anonymized onion routing)</li>
              <li>
                Visit this AO at its tor address
                {config.tor && config.tor.hostname && (
                  <React.Fragment>
                    :{' '}
                    <span style={{ wordBreak: 'break-all' }}>
                      {config.tor.hostname}
                    </span>
                  </React.Fragment>
                )}
              </li>
            </ul>
          </div>
          <div>
            <h2>P2P Constitution-Writing</h2>
            <ul>
              <li>Propose a card to everyone in a group</li>
              <li>Sign proposals you agree with to build a shared history</li>
              <li>
                The{' '}
                <a href="https://github.com/coalition-of-invisible-colleges/ao-react/blob/staging/API.md">
                  AO API
                </a>{' '}
                advances standards development for integration of multiple
                open-source projects into a usable product
              </li>
            </ul>
          </div>
          <div>
            <h2>Local Community Crypto</h2>
            <ul>
              <li>Refill member points with bitcoin and lightning</li>
              <li>Complete bounties to earn local community points</li>
              <li>
                Optionally restrict door or resource access to active members
              </li>
            </ul>
          </div>
          <div>
            <h2>Off-the-Grid Praxis Network</h2>
            <ul>
              <li>
                Growing network of AO users building alternative infrastructures
              </li>
              <li>
                User feedback process connects you directly to the AO's
                developers
              </li>
            </ul>
          </div>
          <div>
            <h2>Secure Video Chat</h2>
            <ul>
              <li>
                The AO helps install Jitsi, the only open-source, self-hosted
                secure video chat solution
              </li>
              <li>Easily hop from room to room</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
