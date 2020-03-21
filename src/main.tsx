import { keyup, click } from '@most/dom-event'
import _ from 'lodash'
import { tap, runEffects } from '@most/core'
import { newDefaultScheduler } from '@most/scheduler'
import useAoStream from './client/ao-stream'
import api from './client/api'
// import {
//   disposer0,
//   disposer1,
//   disposer2,
//   disposer3
// } from './client/state-hooks'

// import cryptoUtils from '../crypto'
// import request from 'superagent'
function onInput(input: HTMLInputElement, e) {
  if (e.keyCode === 13) {
    event.preventDefault()
    console.log('event', e, '\n', 'element', input.value)
    api.createCard(input.value)
    input.value = ''
  }
}
const input = document.getElementById('card-text')
if (input instanceof HTMLInputElement) {
  const inputStream = keyup(input)

  runEffects(
    tap(e => onInput(input, e), inputStream),
    newDefaultScheduler()
  )
}
// Execute a function when the user releases a key on the keyboard

const logAo = document.getElementById('log')

useAoStream(e => {
  logAo.innerHTML += 'Card created: ' + e.name + '<br />'
})
const disposalEl = document.getElementById('disposal')
const disposalStream = click(disposalEl)
function onDisposal() {
  // disposer0()
  // disposer1()
  // disposer2()
  // disposer3()
}
runEffects(tap(onDisposal, disposalStream), newDefaultScheduler())

// const disposer = observe(aoStore.state.grid, change => {
//   console.log('observe!!', change)
//   if (!change.object) {
//     // ignore attempts to unset the background color
//     return null
//   }
//   console.log('observe!', change.object)
//   // console.log(aoStore.state.tasks.length)
//   document.getElementById('log').innerHTML += 'observe' + '<br />'
// })

// setTimeout(() => console.log('hi'), 300)
// aoStore.state.sessions.push({
//   type: 'session-created',
//   session: 'foobafreferr',
//   ownerId: 'owneferferbrt',
//   timestamp: new Date(505440000)
// })
