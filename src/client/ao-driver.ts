import * as socketIO from 'socket.io'
import aoStore from './store'
import uuidV1 from 'uuid/v1'
import cryptoUtils from '../crypto'
import request from 'superagent'
import _ from 'lodash'
import modules from '../modules'
import { runInAction } from 'mobx'

function setCurrent(state, b) {
  modules.cash.mutations.setCurrent(state.cash, b)
  modules.tasks.mutations.setCurrent(state.tasks, b)
  modules.sessions.mutations.setCurrent(state.sessions, b)
  modules.ao.mutations.setCurrent(state.ao, b)
  modules.members.mutations.setCurrent(state.members, b)
  modules.resources.mutations.setCurrent(state.resources, b)
  modules.grid.mutations.setCurrent(state.grid, b)
}
export class AoDriver {
  socket: any
  constructor(user, pass, socket) {
    let token = window.localStorage.getItem('token')
    let session = window.localStorage.getItem('session')
    aoStore.state.user = user
    if (token && session) {
      console.log('recovered session')
      aoStore.state.token = token
      aoStore.state.session = session
    } else {
      console.log('new session')
      aoStore.state.session = uuidV1()
      let sessionKey = cryptoUtils.createHash(
        aoStore.state.session + cryptoUtils.createHash(pass)
      )
      aoStore.state.token = cryptoUtils.hmacHex(
        aoStore.state.session,
        sessionKey
      )
      request
        .post('http://localhost:8003/session')
        .set('authorization', aoStore.state.token)
        .set('session', aoStore.state.session)
        .set('name', aoStore.state.user)
        .end((err, res) => {
          if (err) {
            console.log('err', err)
            return (err = err.message)
          }

          window.localStorage.setItem('token', aoStore.state.token)
          window.localStorage.setItem('session', aoStore.state.session)
        })
    }
    // this.event: SocketIO = event
    this.socket = socket

    request
      .post('/state')
      .set('Authorization', aoStore.state.token)
      .end((err, res) => {
        if (err || !res.body) {
        } else {
          // setCurrent(aoStore.state, res.body)
          aoStore.initializeState(res.body)
          this.onLoad()
        }
      })
  }
  onLoad() {
    this.socket.open()
    this.socket.on('connect', () => {
      console.log('connected')
      this.socket.emit('authentication', {
        session: aoStore.state.session,
        token: aoStore.state.token
      })
    })
    this.socket.on('authenticated', () => {
      console.log('authenticated')
      this.socket.on('eventstream', ev => {
        console.log('event', ev)
        aoStore.applyEvent(ev)
      })
    })
  }
}
