
import io from 'socket.io-client'
import state from './state'
import connector from   './connector'

console.log("fetching AO data")

let sockets = {}

function watchAos(){
    state.serverState.ao.forEach(n => {
        // XXX TODO
        // sockets[n.address] = io(n.address)
        // sockets[n.address].on('connect', ()=> {
        //
        //     sockets[n.address].emit('authentication', {
        //         session: '',
        //         token: ''
        //     })
        // })
        connector.getState(n.address, n.secret, (err, s) => {
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
