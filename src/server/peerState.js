
import io from 'socket.io-client'
import state from './state'
import connector from   './connector'
import evs from './events'

let sockets = {}

function watchAos(){
    state.serverState.ao.forEach(n => {
        connector.getState(n.address, n.secret, (err, s) => {
          if (err || s === 'unauthorized'){
              evs.aoRelayAttempted(n.address, false)
              return
          }
          evs.aoUpdated(n.address, s)
        })
    })
}

export { watchAos }
