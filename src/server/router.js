const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const state = require('./state')
const spec = require('./spec')
const fobtap = require('./fobtap')
const calculations = require('../calculations')
const { serverAuth } = require('./auth')
const { lightningRouter } = require('./lightning')

module.exports = function applyRouter(app) {
  app.use(express.static(path.join(__dirname, '../../dist')))
  app.use(express.static(path.join(__dirname, '../../public')))
  app.get('/%PUBLIC_URL%/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/%PUBLIC_URL%/manifest.json'))
  })
  app.get('/%PUBLIC_URL%/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/%PUBLIC_URL%/favicon.ico'))
  })
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'))
  })
  app.use(bodyParser.json())
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  )
  app.use(serverAuth) // below here requires auth token
  app.use(spec) // handles event creation
  app.use(fobtap) // handles rfid scan devices
  app.use(lightningRouter)

  app.post('/state', (req, res) => {
    res.json(state.pubState)
  })

  // // XXX restrict to only memberIds not ao or resourceIds
  // app.post('/tasks/:taskId', (req, res) => {
  //   res.json(state.serverState.tasks)
  // })

  app.post('/taskhash/:taskId', (req, res) => {
    res.end(
      calculations.crawlerHash(state.serverState.tasks, req.params.taskId)
    )
  })

  // app.post('/grids/:gridId', (req, res) => {
  //   // XXX filter by req id req.params.taskId
  //   res.json(state.serverState.grids, req.params.gridId)
  // })

  // app.post('/member/:memberId', (req, res) => {
  //     res.json(
  //         state.serverState.tasks.filter(t => t.deck.indexOf(req.params.taskId) > -1)
  //     )
  // })
}
