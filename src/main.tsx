import { keyup, click } from '@most/dom-event'
import _ from 'lodash'
import { tap, runEffects, mergeArray } from '@most/core'
import { newDefaultScheduler } from '@most/scheduler'
import useAoStream from './client/ao-stream'
import api from './client/api'
import Router, { UrlEvent } from './client/router'
import aoStore from './client/store'
import './assets/grid.css'
console.log(window)
const router = new Router()
const gridContainerEl = document.getElementById('grid-container')
const gridTextEl = document.getElementById('grid-text')
if (gridTextEl instanceof HTMLInputElement) {
  const inputStream = keyup(gridTextEl)

  runEffects(
    tap(e => onGridInput(gridTextEl, e), inputStream),
    newDefaultScheduler()
  )
}

const gridEls = []

function onItemClick(x, y) {
  return function(event) {
    if (gridSel.x && gridSel.y)
      gridEls[gridSel.y][gridSel.x].className = 'grid-item'
    gridSel.x = x
    gridSel.y = y
    gridEls[y][x].className = 'grid-item-selected'
  }
}

const buttonStreams = []
const onLoad = function() {
  for (let j = 0; j < 17; j++) {
    gridEls.push([])
    for (let i = 0; i < 17; i++) {
      const node = document.createElement('div')
      gridContainerEl.appendChild(node)
      gridEls[j][i] = node
      if (aoStore.state.grid[j] && aoStore.state.grid[j][i]) {
        const task = aoStore.hashMap.get(aoStore.state.grid[j][i])
        console.log('i has task', task.name)
        node.innerText = task.name
      }
      node.addEventListener('click', onItemClick(i, j))
      buttonStreams.push(tap(e => onItemClick(i, j), click(node)))
      node.className = 'grid-item'
    }
  }
}
runEffects(mergeArray(buttonStreams), newDefaultScheduler())
const gridLinkEl = document.getElementById('grid-link')
const homeLinkEl = document.getElementById('home-link')

const gridSel = { x: undefined, y: undefined }

router.match('#/grid', function({ oldUrl, newUrl }: UrlEvent, params) {
  console.log('onmatch', params, oldUrl, newUrl)
  console.log('empty length', oldUrl.length)
  input.style.visibility = 'hidden'
  logAo.style.visibility = 'hidden'
  logAo.style.visibility = 'hidden'
  homeLinkEl.style.visibility = 'visible'
  gridLinkEl.style.visibility = 'hidden'
  gridTextEl.style.visibility = 'visible'
  gridContainerEl.style.visibility = 'visible'
})
router.match('#', function({ oldUrl, newUrl }: UrlEvent, params) {
  console.log('onmatch', params, oldUrl, newUrl)
  console.log('empty length', oldUrl.length)
  input.style.visibility = 'visible'
  logAo.style.visibility = 'visible'
  homeLinkEl.style.visibility = 'hidden'
  gridLinkEl.style.visibility = 'visible'
  gridTextEl.style.visibility = 'hidden'
  gridContainerEl.style.visibility = 'hidden'
})
router.match('', function({ oldUrl, newUrl }: UrlEvent, params) {
  console.log('onmatch', params, oldUrl, newUrl)
  console.log('empty length', oldUrl.length)
  input.style.visibility = 'visible'
  logAo.style.visibility = 'visible'
  homeLinkEl.style.visibility = 'hidden'
  gridLinkEl.style.visibility = 'visible'
  gridTextEl.style.visibility = 'hidden'
  gridContainerEl.style.visibility = 'hidden'
})

function onGridInput(input: HTMLInputElement, e) {
  if (e.keyCode === 13) {
    event.preventDefault()
    console.log('event', e, '\n', 'element', input.value)
    api
      .createAndOrAddCardToGrid(gridSel.x, gridSel.y, input.value)
      .then((...args) => {
        console.log('wtf?', gridSel, input.value)
        gridEls[gridSel.y][gridSel.x].className = 'grid-item'
        gridEls[gridSel.y][gridSel.x].innerText = input.value
        console.log('args', args)
        console.log('grid state', aoStore.state.grid)
        input.value = ''
      })
  }
}

// window.history.pushState(“object or string”, “Title”, “/new-url”);

// import {
//   disposer0,
//   disposer1,
//   disposer2,
//   disposer3
// } from './client/state-hooks'

// import cryptoUtils from '../crypto'
// import request from 'superagent'
function onCardInput(input: HTMLInputElement, e) {
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
    tap(e => onCardInput(input, e), inputStream),
    newDefaultScheduler()
  )
}
// Execute a function when the user releases a key on the keyboard

const logAo = document.getElementById('log')

useAoStream(onLoad, e => {
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
