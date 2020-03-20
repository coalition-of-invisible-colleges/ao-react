import _ from 'lodash'
import { currentTime } from '@most/scheduler'
import * as socketIO from 'socket.io'
import uuidV1 from 'uuid/v1'
import cryptoUtils from '../crypto'
import request from 'superagent'
import aoStore from './store'
import modules from '../modules'
function setCurrent(state, b) {
  modules.cash.mutations.setCurrent(state.cash, b)
  modules.tasks.mutations.setCurrent(state.tasks, b)
  modules.sessions.mutations.setCurrent(state.sessions, b)
  modules.ao.mutations.setCurrent(state.ao, b)
  modules.members.mutations.setCurrent(state.members, b)
  modules.resources.mutations.setCurrent(state.resources, b)
  modules.grid.mutations.setCurrent(state.grid, b)
}
export class AoAuth {
  socket: socketIO.Socket
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
  }

  run(sink, scheduler) {
    const send = e => tryEvent(currentTime(scheduler), e, sink)
    const dispose = () => this.socket.emit('disconnect')

    request
      .post('/state')
      .set('Authorization', aoStore.state.token)
      .end((err, res) => {
        if (err || !res.body) {
        } else {
          setCurrent(aoStore.state, res.body)
        }
        console.log('STAATE', aoStore.state)
      })

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
        send(ev)
      })
    })
    return { dispose }
  }
}

function tryEvent(t, x, sink) {
  try {
    sink.event(t, x)
  } catch (e) {
    sink.error(t, e)
  }
}

// function attachSocket(commit, dispatch) {
//   if (!attached) {
//     socket.on('unauthorized', reason => {
//       commit('setConnectionError', 'Unauthorized: ' + JSON.stringify(reason))
//     })

//     socket.on('connect', () => {
//       commit('setConnected', 'connecting')
//       socket.emit('authentication', {
//         session: state.session,
//         token: state.token
//       })
//     })

//     socket.on('authenticated', () => {
//       commit('setConnected', 'connected')
//       commit('setConnectionError', '')
//       socket.on('eventstream', ev => {
//         commit('applyEvent', ev)
//         dispatch('displayEvent', ev)
//       })
//     })
//     socket.on('disconnect', reason => {
//       commit('setConnected', 'disconnected')
//       commit('setConnectionError', 'disconnect: ' + reason)
//     })
//     socket.on('connect_error', error => {
//       commit('setConnectionError', error.message)
//     })

//     socket.on('error', error => {
//       commit('setConnectionError', error.message)
//     })

//     socket.on('connect_timeout', timeout => {
//       commit('setConnectionError', 'Timed out: ' + timeout + 'ms')
//     })

//     socket.on('reconnect_attempt', timeout => {
//       commit('setConnected', 'connecting')
//       commit('setConnectionError', 'reconnect attempt')
//     })

//     socket.on('reconnect', timeout => {
//       commit('setConnected', 'connected')
//       commit('setConnectionError', '')
//     })

//     socket.on('reconnect_error', error => {
//       commit('setConnectionError', error.message)
//     })
//     attached = true
//   }
// }

// request
//   .post('/session')
//   .set('authorization', token)
//   .set('session', session)
//   .set('name', this.name)
//   .end((err, res) => {
//     if (err) {
//       this.pass = ''
//       return (this.err = err.message)
//     }

//     this.pass = ''
//     this.$store.commit('setAuth', {
//       token,
//       session
//     })

//     window.localStorage.setItem('token', token)
//     window.localStorage.setItem('session', session)

//     this.$store.dispatch('loadCurrent')
//   })

// const actions = {
//   connectSocket({ commit, dispatch }) {
//     attachSocket(commit, dispatch)
//   },
//   loadCurrent({ commit, state, dispatch }) {
//     if (state.connected !== 'connected') {
//       socket.connect()
//     }
//     request
//       .post('/tasks/gg')
//       .set('Authorization', state.token)
//       .end((err, res) => {
//         if (err || !res.body) {
//         } else {
//           console.log('got ', res.body.length, 'tasks from tasks endpoint')
//           commit('applyEvent', {
//             type: 'tasks-received',
//             tasks: res.body
//           })
//         }
//       })
//     request
//       .post('/state')
//       .set('Authorization', state.token)
//       .end((err, res) => {
//         if (err || !res.body) {
//         } else {
//           commit('setCurrent', res.body)
//           res.body.sessions.forEach(s => {
//             if (s.session === state.session) {
//               commit('setPanel', [s.ownerId])
//             }
//           })
//         }
//       })
//   }
// }
