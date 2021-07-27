// script to connect this AO to another AO
// this script spins up our local AO's database,
// attempts to connect to the other AO specified in the command line,
// and if successful, adds the new AO to the database (as an event)

let PORT = process.env.PORT || 8003

import Kefir from 'kefir'
import express from 'express'
import { Server } from 'socket.io'
import socketProtector from 'socketio-auth'
import config from '../configuration.js'
import dctrlDb from '../src/server/dctrlDb.js'
import state from '../src/server/state.js'
import reactions from '../src/server/reactions.js'
import applyRouter from '../src/server/router.js'
import { socketAuth } from '../src/server/auth.js'
import { postEvent } from '../src/server/connector.js'
import { buildResCallback } from '../src/server/utils.js'
// const link = require('./link')
// const cleanup = require('../src/server/cleanup')

const app = express()
applyRouter(app)
startDctrlAo()

function startDctrlAo() {
  console.log('starting AO database...')
  let dbPath = config.sqlite3.file
  if (PORT !== 8003) {
    dbPath = dbPath.replace('database', PORT)
  }

  dctrlDb.startDb(dbPath, (err, conn) => {
    let start = Date.now()
    state.initialize(err => {
      if (err) return console.log('state initialize failed:', err)

      // link()

      const serverReactions = dctrlDb.changeFeed
        .onValue(ev => {
          state.applyEvent(state.serverState, ev)
        })
        .onValue(reactions)

      const server = app.listen(PORT, err => {
        console.log('Listening on port', PORT)

        // const ioServer = new Server(server)
        // const ioServer = new Server(server, {
        //   cors: {
        //     origin: [
        //       'http://127.0.0.1:3000',
        //       'http://localhost:3000',
        //       'http://localhost:8003',
        //       'http://0.0.0.0:3000',
        //     ],
        //     methods: ['GET', 'POST'],
        //   },
        // })

        // socketProtector(ioServer, {
        //   authenticate: socketAuth,
        //   timeout: 2000,
        // })

        // const filteredStream = dctrlDb.changeFeed.map(state.removeSensitive)

        // const fullEvStream = Kefir.merge([filteredStream, dctrlDb.shadowFeed])

        // fullEvStream.onValue(ev => {
        //   state.applyEvent(state.pubState, ev)
        //   io.emit('eventstream', ev)
        //   console.log('emitting:', ev)
        // })

        // Test connection
        console.log('\nAbout to attempt connecting to AO...')
        const address = process.argv[2]
        const secret = process.argv[3]
        console.log('AO tor hostname (1st cmd arg):', address)
        console.log('AO access key (2nd cmd arg):', secret)
        if (address && secret) {
          postEvent(
            address,
            secret,
            {
              type: 'ao-inbound-connected',
              address: config.tor.hostname,
              secret: secret,
            },
            subscriptionResponse => {
              if (!subscriptionResponse) {
                //.lastInsertRowid) { // deprecated response property?
                console.log('ao-connect response: ', subscriptionResponse)
                process.exit(1)
              }
              console.log(
                'Subscription successful, saving connection to database'
              )
              let newEvent = {
                type: 'ao-outbound-connected',
                address,
                secret,
              }
              dctrlDb.insertEvent(newEvent, (event, result) => {
                console.log(
                  'Saved new connection to database. Result is',
                  result
                )
                process.exit(0)
              })
            }
          )
          // const event = {
          //   type: 'ao-outbound-connected',
          //   address,
          //   secret
          // }
          console.log('Attempting to trigger event')
          // dctrlDb.triggerShadow(event)
          // io.emit('eventstream', event)
          // const res = {
          //   status: function(results) {
          //     console.log('status: ', results)
          //   },
          //   json: function(results) {
          //     console.log('json: ', results)
          //   }
          // }
          // app._router.handle({ url: '/', method: 'POST', body: event }, res)
          console.log('Triggered event')
        }
        // Save connection
        // process.exit(0)
      })
    })
  })
}
