import express from 'express'
import config from '../../configuration.js'
import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import state from './state.js'
import spec from './spec.js'
import fobtap from './fobtap.js'
import { serverAuth } from './auth.js'
import { lightningRouter } from './lightning.js'
import fs from 'fs'
import multer from 'multer'
import { addMeme } from './files.js'
import events from './events.js'
import { crawlerHash } from '../calculations.js'

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default function applyRouter(app) {
  // var myLogger = function(req, res, next) {
  //   console.log('REQUEST: ', req)
  //   next()
  // }
  // app.use(myLogger)
  app.use(express.static(path.join(__dirname, '../../dist')))
  app.use(express.static(path.join(__dirname, '../../public')))
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
  app.use(bodyParser.json({ limit: '10mb' }))
  app.use(cookieParser())
  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: '10mb',
    })
  )
  // app.use('/memes', express.static(config.memes.dir))
  app.use(serverAuth) // below here requires auth token
  app.use(spec) // handles event creation
  app.use(fobtap) // handles rfid scan devices
  app.use(lightningRouter)

  app.post('/state', (req, res) => {
    res.json(state.pubState)
  })

  const handleError = (err, res) => {
    res.status(500).contentType('text/plain').end('Oops! Something went wrong!')
  }

  const upload = multer({
    dest: path.join(config.memes.dir, '/.temp'),
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
    fs.rename(tempPath, targetPath, err => {
      if (err) return handleError(err, res)
      addMeme(req.file.originalname, targetPath)
      res.status(200).contentType('text/plain').end('File uploaded!')
    })
  })

  app.get('/memes/:memeHash', (req, res) => {
    console.log('download route detected, hash is ', req.params.memeHash)
    const meme = state.serverState.memes.find(meme => {
      return meme.hash === req.params.memeHash
    })
    const memePath = path.join(config.memes.dir, meme.filename)
    console.log('meme path is ', memePath)
    // res.contentType(memePath)
    res.sendFile(memePath)
  })

  app.get('/download/:memeHash', (req, res) => {
    console.log('download route detected, hash is ', req.params.memeHash)
    const meme = state.serverState.memes.find(meme => {
      return meme.hash === req.params.memeHash
    })
    const memePath = path.join(config.memes.dir, meme.filename)
    console.log('meme path is ', memePath)
    // res.contentType(memePath)
    res.download(memePath)
  })

  app.post('/taskhash/:taskId', (req, res) => {
    res.end(crawlerHash(state.serverState.tasks, req.params.taskId))
  })
}
