import express from 'express'
import config from '../../configuration.js'
import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import state from './state.js'
import spec from './spec.js'
import fobtap from './fobtap.js'
import { serverAuth } from './auth.js'
import lightningRouter from './lightning.js'
import fs from 'fs'
import multer from 'multer'

import { addMeme } from './files.js'
import events from './events.js'

import { crawlerHash } from '../calculations.js'
import validators from './validators'

import { fileURLToPath } from 'url'
import util from 'util'

import { allReachableHeldParents } from '../cards'

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
  app.get('/*', (req, res) => {
     console.log('any route detected')
    res.sendFile(path.join(__dirname, '../../dist/index.html'))
  })
  app.use(bodyParser.json({ limit: '1000mb' }))
  app.use(cookieParser())
  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: '1000mb',
    })
  )

  // app.use('/memes', express.static(config.memes.dir))
    //
  app.post(
    '/fetchPublicTask',
    (req, res) => {
      let errRes = []

      const taskId = req.body.taskId
      if (!validators.isTaskId_sane(taskId, errRes)) {
          res.status(400).send({ err: "bad taskID" })
      }

      const foundTask = state.pubState.tasks.find(taskItem => taskItem.taskId === taskId);
      if (foundTask) {
          res.status(200).send(foundTask);
      } else {
          res.status(400).send({ err: `task ${taskId} not found`, errRes })
      }
    }
  )


  app.use(serverAuth) // below here requires auth token

  app.use(spec) // handles event creation
  app.use(fobtap) // handles rfid scan devices
  app.use(lightningRouter)

  app.post('/logout', (req, res) => {
    console.log('Logging out and clearing token (new way)')
    res.clearCookie('token')
    console.log('sending end() res')
    res.end()
  })

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
          // Include all member cards (name equals taskId)
          // Include the community hub card itself
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

    // Include their bookmarks card itself
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

    // Include cards on their bookmarks bar
    state.pubState.tasks.forEach(taskItem => {
      if (
        taskItem.parents &&
        taskItem.parents.indexOf(bookmarksTaskId) !== -1
      ) {
        stateToSend.tasks.push(taskItem)
      }
    })

    // Include cards passed to them as a gift
    state.pubState.tasks.forEach(taskItem => {
      if (taskItem.passed.some(pass => pass[1] === reqOwner)) {
        stateToSend.tasks.push(taskItem)
      }
    })

    // Include guilds they are holding
    state.pubState.tasks.forEach(taskItem => {
      if (
        taskItem.guild &&
        taskItem.guild.length >= 1 &&
        taskItem.deck.includes(reqOwner)
      ) {
        stateToSend.tasks.push(taskItem)
      }
    })

    // Also include the first priority of every card we are sending
    let priorityIdList = []
    stateToSend.tasks.forEach(taskItem => {
      if (taskItem?.priorities?.length) {
        priorityIdList.push(taskItem.priorities[taskItem.priorities.length - 1])
      }
    })
    let priorityTaskItems = []
    state.pubState.tasks.some(taskItem => {
      if (priorityIdList.includes(taskItem.taskId)) {
        priorityTaskItems.push(taskItem) // will add duplicates
        priorityIdList.splice(priorityIdList.indexOf(taskItem.taskId), 1)
        if (priorityIdList.length === 0) {
          return true
        }
      }
    })

    // Also include everyone holding any of the cards we are sending
    let holderIdList = []
    stateToSend.tasks.forEach(taskItem => {
      if (taskItem?.deck?.length) {
        holderIdList.push(taskItem.deck)
      }
    })
    let holderTaskItems = []
    state.pubState.tasks.some(taskItem => {
      if (holderIdList.includes(taskItem.taskId)) {
        holderTaskItems.push(taskItem) // will add duplicates
        holderIdList.splice(holderIdList.indexOf(taskItem.taskId), 1)
        if (holderIdList.length === 0) {
          return true
        }
      }
    })
    
    // Also include any events in the next three days, whether or not they are holding them
    const msNow = Date.now()
    const timeRangeToSend = 1000 * 60 * 60 * 24 * 3
    state.pubState.tasks.forEach(taskItem => {
      if (
        taskItem.book &&
        taskItem.book.startTs >= 1 &&
        (msNow - taskItem.book.startTs <= timeRangeToSend)
      ) {
        stateToSend.tasks.push(taskItem)
      }
    })

    // Remove duplicates and combine lists
    stateToSend.tasks = [
      ...new Set([...stateToSend.tasks, ...priorityTaskItems]),
    ]

    // Include all parent cards of the cards we are sending using this somewhat slow algorithm
    let heldParentTasks = []
    stateToSend.tasks.forEach(taskItem => {
      heldParentTasks = heldParentTasks.concat(
        allReachableHeldParents(state.pubState.tasks, taskItem, reqOwner)
      )
    })
    console.log(
      'heldParentTasks.length is',
      heldParentTasks.length,
      ' and stateToSend.tasks.length is',
      stateToSend.tasks.length
    )

    // Remove duplicates and combine lists again
    stateToSend.tasks = [...new Set([...stateToSend.tasks, ...heldParentTasks])]
    console.log('POST stateToSend.tasks.length is', stateToSend.tasks.length)

    stateToSend.tasks.forEach(task => {
      if (task.guild && task.guild.length >= 1) {
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

      // console.log('AO: server/router.js: fetchTaskByID: ')

      let taskIdList = req.body.taskId
      let taskIdListParameterWasSingleValue = false
      if (!Array.isArray(taskIdList)) {
        taskIdList = [taskIdList]
        taskIdListParameterWasSingleValue = true
      }

      let allTaskIdsAreSane = true
      taskIdList.some(taskId => {
        if (!validators.isTaskId_sane(taskId, errRes)) {
          console.log('Not all requested task IDs are sane')
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

        // Also return the first priority for each card we are returning, since priorities show up prior to the card in priority mode
        let priorityIdList = []
        foundThisTaskList.forEach(foundTask => {
          if (foundTask?.priorities?.length) {
            priorityIdList.push(
              foundTask.priorities[foundTask.priorities.length - 1]
            )
          }
        })
        let foundAllPriorityItems = priorityIdList.length <= 0
        state.pubState.tasks.some(taskItem => {
          if (priorityIdList.includes(taskItem.taskId)) {
            foundThisTaskList.push(taskItem) // will add duplicates
            priorityIdList.splice(priorityIdList.indexOf(taskItem.taskId), 1)
            if (priorityIdList.length === 0) {
              foundAllPriorityItems = true
              return true
            }
          }
        })
        foundAllTaskItems = foundAllTaskItems && foundAllPriorityItems

        // Also return all the member cards of members who are holding this card
        let holderIdList = []
        foundThisTaskList.forEach(foundTask => {
          if (foundTask?.deck?.length) {
            holderIdList.push(foundTask.deck)
          }
        })
        let foundAllHolderItems = holderIdList.length <= 0
        state.pubState.tasks.some(taskItem => {
          if (holderIdList.includes(taskItem.taskId)) {
            foundThisTaskList.push(taskItem) // will add duplicates
            holderIdList.splice(holderIdList.indexOf(taskItem.taskId), 1)
            if (holderIdList.length === 0) {
              foundAllHolderItems = true
              return true
            }
          }
        })
        foundAllTaskItems = foundAllTaskItems && foundAllHolderItems

        // Also return all parent cards held by this member reachable through a continuous path
        let heldParentTasks = []
        foundThisTaskList.forEach(taskItem => {
          heldParentTasks = heldParentTasks.concat(
            allReachableHeldParents(
              state.pubState.tasks,
              taskItem,
              req.reqOwner
            )
          )
        })

        // Remove duplicates
        foundThisTaskList = [
          ...new Set([...foundThisTaskList, ...heldParentTasks]),
        ]

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

  app.post('/fetchDeck', (req, res) => {
    let errRes = []

    let foundThisTaskList = state.pubState.tasks.filter(taskItem => {
      return taskItem.deck.includes(req.reqOwner)
    })
    // Also return the first priority for each card we are returning, since priorities show up prior to the card in priority mode
    let priorityIdList = []
    foundThisTaskList.forEach(foundTask => {
      if (foundTask?.priorities?.length) {
        priorityIdList.push(
          foundTask.priorities[foundTask.priorities.length - 1]
        )
      }
    })
    let foundAllPriorityItems = priorityIdList.length <= 0
    state.pubState.tasks.some(taskItem => {
      if (priorityIdList.includes(taskItem.taskId)) {
        foundThisTaskList.push(taskItem) // will add duplicates
        priorityIdList.splice(priorityIdList.indexOf(taskItem.taskId), 1)
        if (priorityIdList.length === 0) {
          foundAllPriorityItems = true
          return true
        }
      }
    })
    let foundAllTaskItems = foundAllPriorityItems
    // Also return all the member cards of members who are holding this card
    let holderIdList = []
    foundThisTaskList.forEach(foundTask => {
      if (foundTask?.deck?.length) {
        holderIdList.push(foundTask.deck)
      }
    })
    let foundAllHolderItems = holderIdList.length <= 0
    state.pubState.tasks.some(taskItem => {
      if (holderIdList.includes(taskItem.taskId)) {
        foundThisTaskList.push(taskItem) // will add duplicates
        holderIdList.splice(holderIdList.indexOf(taskItem.taskId), 1)
        if (holderIdList.length === 0) {
          foundAllHolderItems = true
          return true
        }
      }
    })
    foundAllTaskItems = foundAllTaskItems && foundAllHolderItems

    // Remove duplicates
    foundThisTaskList = [...new Set([...foundThisTaskList])]

    // Remove broken cards
    let brokenCards = 0
    foundThisTaskList = foundThisTaskList.filter(taskItem => {
      if (!Array.isArray(taskItem.passed)) {
        brokenCards++
        return false
      }
      return true
    })
    console.log(
      'Sending entire deck of',
      foundThisTaskList.length,
      'except',
      brokenCards,
      'broken cards to member',
      req.reqOwner
    )

    let objectToSend
    if (foundThisTaskList.length === 0) {
      res.status(400).send({ success: false, errorList: errRes })
    } else {
      res.status(200).json({ foundThisTaskList })
    }

    // }
    // else
    // {
    //   errRes.push("AO: server/router.js: fetchTaskByID: task not found ", { "req.body": req.body, foundThisTask});
    //   res.status(400).send({ "success": false, "errorList": errRes });
    // }
  })

  app.post(
    '/fetchTaskByName',
    // bodyParser.json(),
    (req, res) => {
      let errRes = []
      let foundThisTask

      // console.log('AO: server/router.js: fetchTaskByName: start: ', {
      //   'pubState.tasks': state.pubState.tasks,
      // })

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
          let foundThisTaskList = [foundThisTask]

          // Also return the first priority for each card we are returning, since priorities show up prior to the card in priority mode
          const firstPriorityId = foundThisTask?.priorities?.length
            ? foundThisTask.priorities[foundThisTask.priorities.length - 1]
            : null
          let foundPriority
          state.pubState.tasks.some(taskItem => {
            if (taskItem.taskId === firstPriorityId) {
              foundThisTaskList.push(taskItem)
              return true
            }
          })

          // Also return all the member cards of members who are holding this card
          let holderIdList = []
          if (foundThisTask?.deck?.length) {
            holderIdList.push(foundThisTask.deck)
          }
          let foundAllHolderItems = holderIdList.length <= 0
          state.pubState.tasks.some(taskItem => {
            if (holderIdList.includes(taskItem.taskId)) {
              foundThisTaskList.push(taskItem) // will add duplicates
              holderIdList.splice(holderIdList.indexOf(taskItem.taskId), 1)
              if (holderIdList.length === 0) {
                foundAllHolderItems = true
                return true
              }
            }
          })

          // Remove duplicates
          foundThisTaskList = [...new Set(foundThisTaskList)]

          // console.log("AO: server/router.js: fetchTaskByName: task found: ", {"taskName": req.body.taskName, "result": foundThisTask})
          res.status(200).send({
            foundThisTaskList,
            foundAllTaskItems:
              !firstPriorityId || (firstPriorityId && foundPriority),
          })
        } else {
          // console.log("AO: server/router.js: fetchTaskByName: task not found ", { "req.body": req.body, foundThisTask} )
          errRes.push('task name not found')
          res.status(204).send({ success: false, errorList: errRes })
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
    // if (err) {
    //   console.log('UPLOAD ERROR: ', err)
    //   res.status(400).send([])
    //   return
    // }
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
    console.log('meme route detected, hash is ', req.params.memeHash)
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
    res
      .set('Cache-Control', 'public,max-age=31536000,immutable')
      .sendFile(memePath)
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

  app.get('/search/:query', (req, res) => {
    const search = decodeURIComponent(req.params.query)
    const { take, skip } = req.query

    let foundCards = []
    let foundGuilds = []
    let foundMembers = []
    let searchResults = []
    let hashMap = new Map()

    let skipcount = 0

    state.serverState.tasks.forEach(t => {
      hashMap.set(t.taskId, t)
    })

    try {
      let regex = new RegExp(search, 'i')

      state.serverState.tasks.every(t => {
        const testName = regex.test(t.name)

        if (t.guild && (testName || regex.test(t.guild))) {
            if (skipcount < skip) {
                skipcount += 1
            } else {
                foundGuilds.push(t)
            }
        } else if (regex.test(t.name)) {
          if (
            !foundGuilds.some(g => {
              return g.guild === t.name
            })
          ) {
              if (skipcount < skip) {
                  skipcount += 1
              } else {
                  foundCards.push(t)
              }
          }
        }
          if ((foundGuilds.length + foundCards.length) >= take) {
              return false
          } else {
              return true
          }
      })

      state.serverState.members.forEach(member => {
        if (regex.test(member.name)) {
          let result = hashMap.get(member.memberId)

          // This was introduced as a response to cross-AO cards breaking search
          if (result) {
          	result.name = member.name
          	foundMembers.push(result)
          }
        }
      })
      const searchResults = {
        missions: foundGuilds,
        members: foundMembers,
        tasks: foundCards,
        all: foundGuilds.concat(foundMembers, foundCards),
        length: foundGuilds.length + foundMembers.length + foundCards.length,
      }
      res.status(200).send(searchResults)
    } catch (err) {
      console.log('regex search terminated in error: ', err)
      res.status(500).send('Something went wrong...')
    }
  })
}
