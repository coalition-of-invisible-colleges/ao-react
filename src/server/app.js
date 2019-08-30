
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

      watchSpot()
      cronStarter()

      console.log("state", state.pubState.cash)

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
        })
      })
    })
  })
}
