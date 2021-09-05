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
import validators from './validators'

import { fileURLToPath } from 'url'
import util from 'util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default function applyRouter(app) {
  var myLogger = function (req, res, next) {
    // console.log('AO: server/router.js: myLogger: ', {"url": req.url, "body": req.body})
    next()
  }
  app.use(myLogger)

  app.use(express.static(path.join(__dirname, '../../dist')))
  app.use(express.static(path.join(__dirname, '../../public')))
  app.get('/public/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/public/manifest.json'))
  })
  app.get('/public/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/public/favicon.ico'))
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
    // console.log(req);
    // console.log("AO: server/router.js: app post /state", {"req": util.inspect(req)} )

    debugger

    let useReducedState = true
    let dataPackageToSendToClient = {}
    let stateToSend

    let reqOwner = req.reqOwner
    let memberDeckSize = 0

    if (useReducedState === true) {
      stateToSend = { tasks: [] }
      for (let [key, value] of Object.entries(state.pubState)) {
        // console.log({[key]: value} )

        if (key !== 'tasks') {
          stateToSend[key] = state.pubState[key]
        } else {
          for (let taskItem of value) {
            if (
              taskItem.name === taskItem.taskId ||
              taskItem.name === 'community hub'
            ) {
              stateToSend.tasks.push(taskItem)
            }
          }
        }
      }
    } else {
      stateToSend = state.pubState
    }
    dataPackageToSendToClient.stateToSend = stateToSend

    let bookmarksTaskId
    state.pubState.tasks.forEach(taskItem => {
      if (taskItem.deck && taskItem.deck.indexOf(reqOwner) !== -1)
        memberDeckSize++

      if (taskItem.name === reqOwner + '-bookmarks') {
        bookmarksTaskId = taskItem.taskId
        console.log('bookmarksTaskId is', bookmarksTaskId)
        stateToSend.tasks.push(taskItem)
      }
    })

    let bookmarkTaskItems = []
    state.pubState.tasks.forEach(taskItem => {
      if (
        taskItem.parents &&
        taskItem.parents.indexOf(bookmarksTaskId) !== -1
      ) {
        stateToSend.tasks.push(taskItem)
        bookmarkTaskItems.push(taskItem)
      }
    })

    let inboxTaskItems = []
    state.pubState.tasks.forEach(taskItem => {
      if (taskItem.passed.some(pass => pass[1] === req.reqOwner)) {
        stateToSend.tasks.push(taskItem)
        inboxTaskItems.push(taskItem)
      }
    })

    dataPackageToSendToClient.metaData = { memberDeckSize, bookmarksTaskId }

    // console.log(util.inspect(req))

    // let reqOwner = req.reqOwner;
    // let deckSize = 0

    res.json(dataPackageToSendToClient)
  })

  app.post(
    '/fetchTaskByID',
    // bodyParser.json(),
    (req, res) => {
      let errRes = []
      let foundThisTask

      // console.log("AO: server/router.js: fetchTaskByID: ");

      let taskIdList = req.body.taskId
      let taskIdListParameterWasSingleValue = false
      if (!Array.isArray(taskIdList)) {
        taskIdList = [taskIdList]
        taskIdListParameterWasSingleValue = true
      }

      let allTaskIdsAreSane = true
      taskIdList.some(taskId => {
        if (!validators.isTaskId_sane(taskId, errRes)) {
          allTaskIdsAreSane = false
          return true
        }
      })

      let foundThisTaskList = []
      let foundAllTaskItems = false
      if (allTaskIdsAreSane === true) {
        state.pubState.tasks.some(taskItem => {
          if (taskIdList.includes(taskItem.taskId)) {
            foundThisTaskList.push(taskItem)
            taskIdList.splice(taskIdList.indexOf(taskItem.taskId), 1)
            if (taskIdList.length === 0) {
              foundAllTaskItems = true
              return true
            }
          }
        })

        // console.log("AO: server/router.js: fetchTaskByID: ", {"taskId": req.body.taskId, "result": foundThisTask});
        let objectToSend
        if (taskIdListParameterWasSingleValue === true) {
          if (foundThisTaskList.length === 0) {
            res.status(400).send({ success: false, errorList: errRes })
          } else {
            res.status(200).json(foundThisTaskList[0])
          }
        } else {
          res.status(200).json({ foundThisTaskList, foundAllTaskItems })
        }

        // }
        // else
        // {
        //   errRes.push("AO: server/router.js: fetchTaskByID: task not found ", { "req.body": req.body, foundThisTask});
        //   res.status(400).send({ "success": false, "errorList": errRes });
        // }
      } else {
        // console.log("AO: server/router.js: fetchTaskByID: invalid taskId found in list: ", taskIdList);
        res.status(400).send(errRes)
      }
    }
  )

  app.post(
    '/fetchTaskByName',
    // bodyParser.json(),
    (req, res) => {
      let errRes = []
      let foundThisTask

      // console.log("AO: server/router.js: fetchTaskByName: start: ", { "pubState.tasks": state.pubState.tasks });

      if (validators.isTaskName_sane(req.body.taskName, errRes)) {
        let taskName = req.body.taskName
        state.pubState.tasks.some(taskItem => {
          // console.log("AO: server/router.js: fetchTaskByName: iterative search: ", { "taskName": req.body.taskName, taskItem });
          if (taskItem.name === req.body.taskName) {
            foundThisTask = taskItem
            return true
          }
        })

        if (foundThisTask) {
          // console.log("AO: server/router.js: fetchTaskByName: task found: ", {"taskName": req.body.taskName, "result": foundThisTask})
          res.status(200).send([foundThisTask])
        } else {
          // console.log("AO: server/router.js: fetchTaskByName: task not found ", { "req.body": req.body, foundThisTask} )
          errRes.push('task name not found')
          res.status(400).send({ success: false, errorList: errRes })
        }
      } else {
        // console.log("AO: server/router.js: fetchTaskByName: invalid taskName: ", { "req.body": req.body, foundThisTask } )
        res.status(400).send(errRes)
      }
    }
  )

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
    // console.log('req is ', req)

    fs.rename(tempPath, targetPath, err => {
      // if (err) return handleError(err, res)
      const memePromise = addMeme(req.file.originalname, targetPath)
      console.log('memePromise is ', memePromise)
      memePromise.then(newTaskId => {
        console.log('returned. newTaskId is', newTaskId)
        if (newTaskId) {
          res.status(200).send(newTaskId)
        } else {
          res.status(400).send([])
        }
      })
      // .catch(res.status(400).send([]))
    })
  })

  app.get('/meme/:memeHash', (req, res) => {
    console.log('download route detected, hash is ', req.params.memeHash)
    const meme = state.serverState.memes.find(meme => {
      return meme.hash === req.params.memeHash
    })
    if (!meme || !meme.filename) {
      res.status(604)
      return
    }
    const memePath = path.join(config.memes.dir, meme.filename)
    console.log('meme path is ', memePath)
    // res.contentType(memePath)
    res.set('Cache-Control', 'public, max-age=31557600').sendFile(memePath)
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
