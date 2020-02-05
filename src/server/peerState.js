
const io = require( 'socket.io-client')
const state = require( './state')
const connector = require(   './connector')
const evs = require( './events')

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

module.exports = { watchAos }
