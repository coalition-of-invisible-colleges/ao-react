import 'core-js/stable'
import 'regenerator-runtime/runtime'
import io from 'socket.io-client'
import * as React from 'react'
import { render } from 'react-dom'
import { AoDriver } from './client/ao-driver'
import App from './App'
import './css/styles.scss'
const socket = io.connect('http://localhost:8003', {
  autoConnect: false
})
const driver = new AoDriver('dctrl', 'dctrl', socket)

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
