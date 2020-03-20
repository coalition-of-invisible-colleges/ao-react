var attached = false
const io = require('socket.io-client')
const socket = io()
function attachSocket(commit, dispatch) {
  if (!attached) {
    socket.on('unauthorized', reason => {
      commit('setConnectionError', 'Unauthorized: ' + JSON.stringify(reason))
    })

    socket.on('connect', () => {
      commit('setConnected', 'connecting')
      socket.emit('authentication', {
        session: state.session,
        token: state.token
      })
    })

    socket.on('authenticated', () => {
      commit('setConnected', 'connected')
      commit('setConnectionError', '')
      socket.on('eventstream', ev => {
        commit('applyEvent', ev)
        dispatch('displayEvent', ev)
      })
    })
    socket.on('disconnect', reason => {
      commit('setConnected', 'disconnected')
      commit('setConnectionError', 'disconnect: ' + reason)
    })
    socket.on('connect_error', error => {
      commit('setConnectionError', error.message)
    })

    socket.on('error', error => {
      commit('setConnectionError', error.message)
    })

    socket.on('connect_timeout', timeout => {
      commit('setConnectionError', 'Timed out: ' + timeout + 'ms')
    })

    socket.on('reconnect_attempt', timeout => {
      commit('setConnected', 'connecting')
      commit('setConnectionError', 'reconnect attempt')
    })

    socket.on('reconnect', timeout => {
      commit('setConnected', 'connected')
      commit('setConnectionError', '')
    })

    socket.on('reconnect_error', error => {
      commit('setConnectionError', error.message)
    })
    attached = true
  }
}

request
  .post('/session')
  .set('authorization', token)
  .set('session', session)
  .set('name', this.name)
  .end((err, res) => {
    if (err) {
      this.pass = ''
      return (this.err = err.message)
    }

    this.pass = ''
    this.$store.commit('setAuth', {
      token,
      session
    })

    window.localStorage.setItem('token', token)
    window.localStorage.setItem('session', session)

    this.$store.dispatch('loadCurrent')
  })

const actions = {
  connectSocket({ commit, dispatch }) {
    attachSocket(commit, dispatch)
  },
  loadCurrent({ commit, state, dispatch }) {
    if (state.connected !== 'connected') {
      socket.connect()
    }
    request
      .post('/tasks/gg')
      .set('Authorization', state.token)
      .end((err, res) => {
        if (err || !res.body) {
        } else {
          console.log('got ', res.body.length, 'tasks from tasks endpoint')
          commit('applyEvent', {
            type: 'tasks-received',
            tasks: res.body
          })
        }
      })
    request
      .post('/state')
      .set('Authorization', state.token)
      .end((err, res) => {
        if (err || !res.body) {
        } else {
          commit('setCurrent', res.body)
          res.body.sessions.forEach(s => {
            if (s.session === state.session) {
              commit('setPanel', [s.ownerId])
            }
          })
        }
      })
  }
}
