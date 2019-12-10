
import io from 'socket.io-client'
import state from './state'
import connector from   './connector'
import aoEvs from './events/aoEvs'

let sockets = {}

function watchAos(){
    state.serverState.ao.forEach(n => {
        connector.getState(n.address, n.secret, (err, s) => {
          if (err){
              console.log("getState error: " , {err})
              aoEvs.aoRelayAttempted(n.address, false)
          }

          state.pubState.ao.forEach(pn => {
            if(pn.address === n.address) {
              pn.state = s
              console.log("public state set for ", pn.address)
            }
          })
        })
    })
}

export { watchAos }
