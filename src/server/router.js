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
  // app.use(express.static(path.join(__dirname, '../../memes')))
  app.get('/%PUBLIC_URL%/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/%PUBLIC_URL%/manifest.json'))
  })
  app.get('/%PUBLIC_URL%/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/%PUBLIC_URL%/favicon.ico'))
  })
  app.get('/*', (req, res) => {
    console.log('any route detected')
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
  // app.get('/task/:taskId', (req, res) => {
  //   console.log('task route detected')
  //   res.sendFile(path.join(__dirname, '../../dist/index.html'))
  //   res.json(
  //     state.serverState.tasks.find(task => {
  //       return task.taskId === req.params.taskId
  //     })
  //   )
  //   console.log('task route completed')
  // })

  app.post('/taskhash/:taskId', (req, res) => {
    res.end(
      calculations.crawlerHash(state.serverState.tasks, req.params.taskId)
    )
  })

  // // XXX restrict to only memberIds not ao or resourceIds
  app.post('/meme/:memeHash', (req, res) => {
    console.log('meme route detected, hash is ', req.params.memeHash)
    const meme = state.memes.find(meme => {
      return meme.hash === req.params.memeHash
    })
    const path = path.join(__dirname, '~/.ao/memes/' + meme.filename)
    console.log('meme path is ', path)
    res.download(path)
    console.log('meme route completed')
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
