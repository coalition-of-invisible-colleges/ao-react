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
const multer = require('multer')
const { addMeme } = require('./files')
const events = require('./events')

module.exports = function applyRouter(app) {
  // var myLogger = function(req, res, next) {
  //   console.log('REQUEST: ', req)
  //   next()
  // }
  // app.use(myLogger)
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
  app.get('/meme/:memeHash', (req, res) => {
    console.log('meme route detected, hash is ', req.params.memeHash)
    const meme = state.serverState.memes.find(meme => {
      return meme.hash === req.params.memeHash
    })
    const memePath = path.join(config.memes.dir, meme.filename)
    // const memePath = process.env.PUBLIC_URL + '/doge.jpg'
    console.log('meme path is ', memePath)
    res.sendFile(memePath)
    // res.sendFile(path)
    // res.sendFile(path.join(__dirname, '../../dist/%PUBLIC_URL%/doge.jpg'))
    // console.log('meme route completed')

    ////////

    // var stream = fs.readStream(memePath)
    // var filename = 'WhateverFilenameYouWant.pdf'
    // // Be careful of special characters

    // filename = encodeURIComponent(filename)
    // // Ideally this should strip them

    // res.setHeader('Content-disposition', 'inline; filename="' + filename + '"')
    // res.setHeader('Content-type', 'application/pdf')

    // stream.pipe(res)
  })

  // app.post('/upload', (req, res) => {
  //   console.log('upload route detected')

  const handleError = (err, res) => {
    res
      .status(500)
      .contentType('text/plain')
      .end('Oops! Something went wrong!')
  }

  const upload = multer({
    dest: path.join(config.memes.dir, '/.temp')
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
  })

  const uploadFormName = 'file'

  app.post('/upload', upload.single(uploadFormName), (req, res) => {
    const tempPath = req.file.path
    const targetPath = path.join(config.memes.dir, req.file.originalname)
    console.log('originalname is ', req.file.originalname)
    console.log('temppath is ', tempPath)
    console.log('targepath is ', targetPath)
    console.log('req is ', req)
    // if (path.extname(req.file.originalname).toLowerCase() === '.png') {
    fs.rename(tempPath, targetPath, err => {
      if (err) return handleError(err, res)
      addMeme(req.file.originalname, targetPath)
      res
        .status(200)
        .contentType('text/plain')
        .end('File uploaded!')
    })
    // } else {
    //   fs.unlink(tempPath, err => {
    //     if (err) return handleError(err, res)

    //     res
    //       .status(403)
    //       .contentType('text/plain')
    //       .end('Only .png files are allowed!')
    //   })
  })
  // })

  app.get('/download/:memeHash', (req, res) => {
    console.log('download route detected, hash is ', req.params.memeHash)
    const meme = state.serverState.memes.find(meme => {
      return meme.hash === req.params.memeHash
    })
    const memePath = path.join(config.memes.dir, meme.filename)
    console.log('meme path is ', memePath)
    res.contentType(memePath)
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
