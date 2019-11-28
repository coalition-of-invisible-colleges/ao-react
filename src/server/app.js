
let PORT = process.env.PORT || 8003

import express from 'express'
import dctrlDb from './dctrlDb'
import path from "path"
import socketProtector from 'socketio-auth'
import socketIo from 'socket.io'
import state from './state'
import reactions from './reactions'
import applyRouter from './router'
import { socketAuth } from './auth'
import { watchSpot } from './exchangeRate'
import Kefir from 'kefir'
import cronStarter from './crons'
import lightning from './lightning'
import connector from   './connector'

const app = express()
applyRouter(app)
startDctrlAo()

function startDctrlAo(){
  console.log('starting db')
  dctrlDb.startDb( (err, conn) => {

    let start = Date.now()
    state.initialize( err => {
      if (err) return console.log('state initialize failed:', err)
      console.log(Date.now() - start, ' ms to initialize')

      console.log("fetching AO data")
      state.serverState.ao.forEach(n => {
          console.log("getting state for ", n.address)
          connector.getState(n.address, n.secret, (err, s) => {
              console.log("err, state is ", err, s)
              console.log("assigning state")
              state.pubState.ao.forEach(pn => {
                  if(pn.address === n.address) {
                      pn.state = s
                      console.log("public state set for ", pn.address)
                  }

              })
          })
      })

      watchSpot()
      cronStarter()

      lightning.recordEveryInvoice(state.pubState.cash.pay_index)
      lightning.watchOnChain()

      const cleanupHeartbeat = Kefir.interval(12345678, {type: 'cleanup'})
      const evStream = Kefir.merge([dctrlDb.changeFeed, cleanupHeartbeat])

      const serverReactions = evStream.onValue( ev => {
          state.applyEvent(state.serverState, ev)
      })
      .onValue(reactions)

      const server = app.listen(PORT, err => {
        console.log("Listening on port", PORT)

        const io = socketIo(server)

        socketProtector(io, {
            authenticate: socketAuth,
            timeout: 2000,
        })

        const filteredStream = evStream
            .map(state.removeSensitive)

        const fullEvStream = Kefir.merge([filteredStream, dctrlDb.shadowFeed])

        fullEvStream.onValue( ev => {
              state.applyEvent(state.pubState, ev)
              io.emit('eventstream', ev)
              console.log("emitting:", ev)
        })
      })
    })
  })
}
