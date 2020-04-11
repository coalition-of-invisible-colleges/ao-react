import * as socketIO from 'socket.io'
import aoStore from './store'
import uuidV1 from 'uuid/v1'
import cryptoUtils from '../crypto'
import request from 'superagent'
import _ from 'lodash'

export class AoDriver {
  socket: any
  constructor(socket) {
    let token = window.localStorage.getItem('token')
    let session = window.localStorage.getItem('session')
    let user = window.localStorage.getItem('user')
    if (token && session) {
      console.log('recovered session')
      aoStore.state.user = user

      aoStore.state.token = token
      aoStore.state.session = session
    } else {
      console.log('new session')
      let user = 'dctrl'
      let pass = 'dctrl'
      aoStore.state.user = user
      aoStore.state.session = uuidV1()
      let sessionKey = cryptoUtils.createHash(
        aoStore.state.session + cryptoUtils.createHash(pass)
      )
      aoStore.state.token = cryptoUtils.hmacHex(
        aoStore.state.session,
        sessionKey
      )
      request
        .post(config.url + '/session')
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
