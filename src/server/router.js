const express = require('express')
const config = require('../../configuration')
const path = require('path')
const bodyParser = require('body-parser')
const state = require('./state')
const spec = require('./spec')
const fobtap = require('./fobtap')
const calculations = require('../calculations')
const { serverAuth } = require('./auth')
const { lightningRouter } = require('./lightning')
const fs = require('fs')

module.exports = function applyRouter(app) {
  var myLogger = function(req, res, next) {
    console.log('REQUEST: ', req)
    next()
  }
  app.use(myLogger)
  app.use(express.static(path.join(__dirname, '../../dist')))
  app.use(express.static(path.join(__dirname, '../../public')))
  // app.use('/meme', express.static(config.memes.dir))
  // app.use(express.static(path.join(__dirname, '../../memes')))
  app.get('/%PUBLIC_URL%/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/%PUBLIC_URL%/manifest.json'))
  })
  app.get('/%PUBLIC_URL%/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/%PUBLIC_URL%/favicon.ico'))
  })
  // app.get('/*', (req, res) => {
  //   console.log('any route detected')
  //   res.sendFile(path.join(__dirname, '../../dist/index.html'))
  // })
  app.use(bodyParser.json())
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  )
  // app.post('/fobtap', (req, res) => {
  //   console.log('\nfobtap post!!!')
  //   res.status(200).send()
  //   // res.json(state.pubState)
  // })
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

  // app.post('/taskhash/:taskId', (req, res) => {
  //   res.end(
  //     calculations.crawlerHash(state.serverState.tasks, req.params.taskId)
  //   )
  // })

  // // XXX restrict to only memberIds not ao or resourceIds
  app.all('/meme/:memeHash', (req, res) => {
    console.log('meme route detected, hash is ', req.params.memeHash)
    const meme = state.memes.find(meme => {
      return meme.hash === req.params.memeHash
    })
    const memePath = path.join(config.memes.dir, meme.filename)
    // const memePath = process.env.PUBLIC_URL + '/doge.jpg'
    console.log('meme path is ', memePath)
    // res.sendFile(memePath)
    // res.sendFile(path)
    // res.sendFile(path.join(__dirname, '../../dist/%PUBLIC_URL%/doge.jpg'))
    // console.log('meme route completed')

    ////////

    var stream = fs.readStream(memePath)
    var filename = 'WhateverFilenameYouWant.pdf'
    // Be careful of special characters

    filename = encodeURIComponent(filename)
    // Ideally this should strip them

    res.setHeader('Content-disposition', 'inline; filename="' + filename + '"')
    res.setHeader('Content-type', 'application/pdf')

    stream.pipe(res)
  })

  app.all('/download/:memeHash', (req, res) => {
    console.log('download route detected, hash is ', req.params.memeHash)
    const meme = state.memes.find(meme => {
      return meme.hash === req.params.memeHash
    })
    const memePath = path.join(config.memes.dir, meme.filename)
    console.log('meme path is ', memePath)
    res.download(memePath)
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
