// entry point for server

let PORT = process.env.PORT || 8003

const Kefir = require('kefir')
const express = require('express')
const socketIo = require('socket.io')
const socketProtector = require('socketio-auth')
const config = require('../../configuration')
const dctrlDb = require('./dctrlDb')
const state = require('./state')
const reactions = require('./reactions')
const applyRouter = require('./router')
const { socketAuth } = require('./auth')
const { watchSpot } = require('./exchangeRate')
const rent = require('./rent')
const link = require('./link')
const { scanMemes } = require('./files')
const lightning = require('./lightning')

const app = express()
applyRouter(app)
startDctrlAo()

function startDctrlAo() {
  console.log('starting db')
  let dbPath = config.sqlite3.file
  if (PORT !== 8003) {
    dbPath = dbPath.replace('database', PORT)
  }

  dctrlDb.startDb(dbPath, (err, conn) => {
    let start = Date.now()
    state.initialize(err => {
      if (err) return console.log('state initialize failed:', err)

      watchSpot()
      rent()
      link()
      scanMemes()
      if (config.clightning.enable) {
        lightning.recordEveryInvoice(state.serverState.cash.pay_index)
        lightning.watchOnChain()
      }
      const serverReactions = dctrlDb.changeFeed
        .onValue(ev => {
          state.applyEvent(state.serverState, ev)
        })
        .onValue(reactions)

      const server = app.listen(PORT, err => {
        console.log('Listening on port', PORT)

        const io = socketIo(server)

        socketProtector(io, {
          authenticate: socketAuth,
          timeout: 2000
        })

        const filteredStream = dctrlDb.changeFeed.map(state.removeSensitive)

        const fullEvStream = Kefir.merge([filteredStream, dctrlDb.shadowFeed])

        fullEvStream.onValue(ev => {
          state.applyEvent(state.pubState, ev)
          io.emit('eventstream', ev)
          console.log('emitting:', ev)
        })
      })
    })
  })
}
