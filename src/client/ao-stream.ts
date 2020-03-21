import { tap, runEffects } from '@most/core'
import { newDefaultScheduler } from '@most/scheduler'
import * as socketIO from 'socket.io'
import aoStore from './store'
import M from '../mutations'
import { AoAuth } from './auth'

const io: socketIO.Socket = require('socket.io-client')('http://localhost:8003')

function applyEvent(state, ev) {
  M.cashMuts(state.cash, ev)
  M.membersMuts(state.members, ev)
  M.resourcesMuts(state.resources, ev)
  M.sessionsMuts(state.sessions, ev)
  M.tasksMuts(state.tasks, ev)
  M.aoMuts(state.ao, ev)
  M.gridMuts(state.grid, ev)
}

export default function useAoStream(onEvent) {
  const aoStream = new AoAuth('dctrl', 'dctrl', io)
  runEffects(
    tap(function(e) {
      applyEvent(aoStore.state, e)
      onEvent(e)
    }, aoStream),
    newDefaultScheduler()
  )
}
