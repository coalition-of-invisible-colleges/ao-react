
import io from 'socket.io-client'
import state from './state'
import connector from   './connector'
import aoEvs from './events/aoEvs'

let sockets = {}


function watchAos(){
    state.serverState.ao.forEach(n => {
        connector.getState(n.address, n.secret, (err, s) => {
          if (err || s === 'unauthorized'){
              aoEvs.aoRelayAttempted(n.address, false)
              return
          }
          aoEvs.aoUpdated(n.address, s)
        })
    })
}

export { watchAos }
