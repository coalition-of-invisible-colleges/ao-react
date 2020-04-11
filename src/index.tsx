import 'core-js/stable'
import 'regenerator-runtime/runtime'

import * as React from 'react'
import { render } from 'react-dom'
import App from './App'
import './css/styles.scss'
render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
