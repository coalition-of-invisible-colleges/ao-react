import 'core-js/stable'
import 'regenerator-runtime/runtime'
import io from 'socket.io-client'
import * as React from 'react'
import { render } from 'react-dom'
import { AoDriver } from './client/ao-driver'
import App from './App'
import './css/styles.scss'
import configuration from '../client-configuration'

const socket = io.connect(
  configuration.socketUrl ? configuration.socketUrl : '/',
  {
    autoConnect: false
  }
)
const driver = new AoDriver(socket)

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
