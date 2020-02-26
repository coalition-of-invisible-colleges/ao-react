
let PORT = process.env.PORT || 8003

const express = require('express')
const dctrlDb = require('./dctrlDb')
const path = require("path")
const socketProtector = require('socketio-auth')
const socketIo = require('socket.io')
const state = require('./state')
const reactions = require('./reactions')
const applyRouter = require('./router')
const { socketAuth } = require('./auth')
const { watchSpot } = require('./exchangeRate')
const Kefir = require('kefir')
const cronStarter = require('./crons')
const lightning = require('./lightning')

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
      lightning.recordEveryInvoice(state.serverState.cash.pay_index)
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
