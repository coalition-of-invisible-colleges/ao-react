// entry point for server

let PORT = process.env.PORT || 8003

console.log('AO: Listening on PORT: ', PORT)

import Kefir from 'kefir'
import express from 'express'
import { Server } from 'socket.io'
import socketProtector from 'socketio-auth'
import config from '../../configuration.js'
import { startDb, changeFeed, shadowFeed, insertEvent } from './dctrlDb.js'
import state from './state.js'
import reactions from './reactions.js'
import applyRouter from './router.js'
import { socketAuth } from './auth.js'
import { watchSpot } from './exchangeRate.js'
import rent from './rent.js'
import link from './link.js'
import cleanup from './cleanup.js'
import todo from './todo.js'
import { scanMemes } from './files.js'
import lightning from './lightning.js'

const app = express()
applyRouter(app)
startDctrlAo()

function startDctrlAo() {
  console.log('starting AO database...')
  let dbPath = config.sqlite3.file
  if (PORT !== 8003) {
    dbPath = dbPath.replace('database', PORT)
  }
  startDb(dbPath, (err, conn) => {
    let start = Date.now()
    state.initialize(err => {
      if (err) return console.log('state initialize failed:', err)
      watchSpot()
      rent()
      link()
      scanMemes()
      todo()
      if (config.clightning.enable) {
        lightning.recordEveryInvoice(state.serverState.cash.pay_index)
        lightning.watchOnChain()
      }
      const serverReactions = changeFeed
        .onValue(ev => {
          state.applyEvent(state.serverState, ev)
        })
        .onValue(reactions)

      const server = app.listen(PORT, err => {
        console.log('Listening on port', PORT)

        // TODO continue merge argument about this functionality
        //   likely best option is to use an ENV variable to determine
        //   if we are behind a proxy or not. This is likely useful / necessary
        //   also for express configuration
        // const ioServer = new Server(server, {
        //   cors: {
        //     origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
        //     methods: ['GET', 'POST'],
        //   },
        // })

        // ioServer.listen(PORT)
        const ioServer = new Server(server, {
          cors: { origin: 'http://127.0.0.1:3000' },
        })

        socketProtector(ioServer, {
          authenticate: socketAuth,
          timeout: 2000,
        })

        const filteredStream = changeFeed.map(state.removeSensitive)

        const fullEvStream = Kefir.merge([filteredStream, shadowFeed])

        fullEvStream.onValue(ev => {
          state.applyEvent(state.pubState, ev)
          ioServer.emit('eventstream', ev)
          console.log('emitting:', ev.type)
        })

        // ensure there is a community hub card in the state
        // console.log("AO: server/state.js: initialize: checking for community hub card", { "tasks": state.pubState.tasks } );
        // let communityHubCardFound = false;
        // state.pubState.tasks.forEach
        //     ( (taskItem, index) =>
        //       {
        //         if (taskItem.name.toLowerCase() === "community hub")
        //         {
        //           communityHubCardFound = true;
        //           console.log("AO: server/state.js: initialize: community hub card found");
        //           return;
        //         }
        //       }
        //     );
        // if (communityHubCardFound === false)
        // {
        //   let newCommunityHubCardEvent =
        //       {
        //         type        : "task-create",
        //         name        : "community hub",
        //         color       : "blue",
        //         deck        : [],
        //         inId        : null,
        //         prioritized : false,
        //       }
        //   // setImmediate
        //   //     (
        //         // () =>
        //         // {
        //           insertEvent
        //           ( newCommunityHubCardEvent,
        //             (error, {event, result}) =>
        //             {

        //               if (error)
        //               {
        //                 // this should never happen... umm... not sure what to do here
        //                 console.log("AO: server/state.js: initialize: error running insertEvent for communityHubCard", {error, event, result});

        //               }
        //               else
        //               {
        //                 // we should be good to go to send data to any clients.
        //               }
        //             }
        //           )
        //         // }
        //       // );
        // }
      })
    })
  })
}
