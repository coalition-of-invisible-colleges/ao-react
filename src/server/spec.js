import express from 'express'
import v1 from 'uuid'
import state from './state.js'
import { buildResCallback } from './utils.js'
import validators from './validators.js'
import { blankCard, blankGrid } from '../cards.js'
import events from './events.js'
import { postEvent } from './connector.js'
import { newAddress, createInvoice } from './lightning.js'
import { sendNotification } from './signal.js'
import { createHash } from '../crypto.js'
import getUrls from 'get-urls'
import { cache } from './cache.js'

const router = express.Router()

router.post('/events', (req, res, next) => {
  // console.log('AO: server/spec.js: router.post(/events):', {})
  state.serverState.sessions.forEach(s => {
    if (s.token === req.headers.authorization) {
      req.body.blame = s.ownerId
    }
  })
  next()
})

router.post('/events', (req, res, next) => {
  // console.log('AO: server/spec.js: router.post(/events):', {
  // 'req.body': req.body,
  // })
  let errRes = []

  function sendErrorStatus() {
    res.status(400).send(errRes)
  }

  const eventType = req.body.type

  const resCallback = buildResCallback(res)

  switch (eventType) {
    case 'ao-linked':
      if (
        validators.isAddress(req.body.address, errRes) &&
        validators.isTaskId(req.body.taskId, errRes)
      ) {
        events.trigger(eventType, {
          address: req.body.address,
          taskId: req.body.taskId,
        })
      } else sendErrorStatus()
      break
    case 'highlighted':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        validators.isBool(req.body.valence, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            memberId: req.body.memberId,
            valence: req.body.valence,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'ao-disconnected':
      if (validators.isAddress(req.body.address, errRes)) {
        events.trigger(eventType, { address: req.body.address }, resCallback)
      } else sendErrorStatus()
      break
    case 'ao-named':
      if (validators.isNotes(req.body.alias, errRes)) {
        events.trigger(eventType, { alias: req.body.alias }, resCallback)
      } else sendErrorStatus()
      break
    case 'rent-set':
      if (validators.isAmount(req.body.amount, errRes)) {
        events.trigger(eventType, { amount: req.body.amount }, resCallback)
      } else sendErrorStatus()
      break
    case 'cap-set':
      if (validators.isAmount(req.body.amount, errRes)) {
        events.trigger(eventType, { amount: req.body.amount }, resCallback)
      } else sendErrorStatus()
      break
    case 'quorum-set':
      if (validators.isAmount(req.body.quorum, errRes)) {
        events.trigger(eventType, { quorum: req.body.quorum }, resCallback)
      } else sendErrorStatus()
      break
    case 'ao-outbound-connected':
      if (
        validators.isNotes(req.body.address, errRes) &&
        validators.isNotes(req.body.secret, errRes)
      ) {
        postEvent(
          req.body.address,
          req.body.secret,
          {
            type: 'ao-inbound-connected',
            address: state.serverState.cash.address,
            secret: req.body.secret, //
          },
          subscriptionResponse => {
            if (!subscriptionResponse.lastInsertRowid) {
              return res.status(200).send(['ao-connect failed'])
            }
            console.log('subscribe success, attempt ao connect')
            events.trigger(
              eventType,
              {
                address: req.body.address,
                secret: req.body.secret,
              },
              resCallback
            )
          }
        )
      } else sendErrorStatus()
      break
    case 'ao-inbound-connected':
      if (
        validators.isNotes(req.body.address, errRes) &&
        validators.isNotes(req.body.secret, errRes)
      ) {
        events.trigger(
          eventType,
          {
            address: req.body.address,
            secret: req.body.secret,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'ao-relay':
      let secret
      state.serverState.ao.forEach(a => {
        if (a.address == req.body.address) {
          secret = a.outboundSecret
        }
      })
      if (secret) {
        postEvent(req.body.address, secret, req.body.ev, connectorRes => {
          console.log('ao relay response', { connectorRes })
        })
      } else {
        console.log('no connection for ', req.body.address)
        next()
      }
      break
    case 'invoice-created':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isAmount(req.body.amount, errRes)
      ) {
        createInvoice(req.body.amount, '<3' + v1(), '~', 3600)
          .then(result => {
            events.trigger(
              eventType,
              {
                taskId: req.body.taskId,
                bolt11: result.bolt11,
                payment_hash: result.payment_hash,
              },
              resCallback
            )
          })
          .catch(err => {
            console.log({ err })
            res.status(200).send('attempt failed')
          })
      } else sendErrorStatus()
      break
    case 'member-created':
      if (
        validators.isNotes(req.body.name, errRes) &&
        validators.isNotes(req.body.fob, errRes) &&
        validators.isNotes(req.body.secret) &&
        !validators.isMemberName(req.body.name, errRes)
      ) {
        const memberId = v1()
        events.trigger(eventType, {
          memberId,
          fob: req.body.fob,
          name: req.body.name,
          secret: req.body.secret,
          active: 1,
          balance: 0,
          badges: [],
          info: {},
          lastActivated: 7,
        })
        const newBookmarksTaskId = v1()
        const newBookmarksName = memberId + '-bookmarks'
        const newBookmarksHash = createHash(newBookmarksName)
        events.trigger('task-created', {
          taskId: newBookmarksTaskId,
          lastClaimed: Date.now(),
          name: newBookmarksName,
          color: 'blue',
          deck: [memberId],
          hash: newBookmarksHash,
          inId: null,
          prioritized: false,
          grid: false,
        })
        events.trigger(
          'grid-added',
          {
            taskId: newBookmarksTaskId,
            height: 1,
            width: 6,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'member-activated':
      if (validators.isMemberId(req.body.memberId, errRes)) {
        events.trigger(eventType, { memberId: req.body.memberId }, resCallback)
      } else sendErrorStatus()
      break
    case 'member-deactivated':
      if (validators.isMemberId(req.body.memberId, errRes)) {
        events.trigger(eventType, { memberId: req.body.memberId }, resCallback)
      } else sendErrorStatus()
      break
    case 'member-secret-reset':
      if (
        validators.isMemberId(req.body.kohaiId, errRes) &&
        validators.isMemberId(req.body.senpaiId, errRes) &&
        validators.isSenpaiOf(req.body.senpaiId, req.body.kohaiId, errRes) === 1
      ) {
        events.trigger(
          eventType,
          { kohaiId: req.body.kohaiId, senpaiId: req.body.senpaiId },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'member-promoted':
      if (
        validators.isMemberId(req.body.kohaiId, errRes) &&
        validators.isMemberId(req.body.senpaiId, errRes) &&
        validators.isAheadOf(req.body.senpaiId, req.body.kohaiId, errRes) === 1
      ) {
        events.trigger(
          eventType,
          { kohaiId: req.body.kohaiId, senpaiId: req.body.senpaiId },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'member-banned':
      if (
        validators.isMemberId(req.body.kohaiId, errRes) &&
        validators.isMemberId(req.body.senpaiId, errRes) &&
        validators.isSenpaiOf(req.body.senpaiId, req.body.kohaiId, errRes) === 1
      ) {
        events.trigger(
          eventType,
          { kohaiId: req.body.kohaiId, senpaidId: req.body.senpaiId },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'member-unbanned':
      if (
        validators.isMemberId(req.body.kohaiId, errRes) &&
        validators.isMemberId(req.body.senpaiId, errRes) &&
        validators.hasBanOn(req.body.senpaiId, req.body.kohaiId, errRes)
      ) {
        events.trigger(
          eventType,
          { kohaiId: req.body.kohaiId, senpaiId: req.body.senpaiId },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'member-purged':
      if (validators.isMemberId(req.body.memberId, errRes)) {
        events.trigger(
          eventType,
          { memberId: req.body.memberId, blame: req.body.blame },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'member-field-updated':
      if (
        validators.isMemberId(req.body.memberId, errRes) &&
        validators.isField(req.body.field, errRes) &&
        validators.isNotes(req.body.newfield, errRes)
      ) {
        events.trigger(
          eventType,
          {
            memberId: req.body.memberId,
            field: req.body.field,
            newfield: req.body.newfield,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'member-ticker-set':
      if (
        validators.isNotes(req.body.fromCoin, errRes) &&
        validators.isNotes(req.body.toCoin, errRes) &&
        validators.isAmount(req.body.index, errRes) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.trigger(
          eventType,
          {
            fromCoin: req.body.fromCoin,
            toCoin: req.body.toCoin,
            index: req.body.index,
            memberId: req.body.memberId,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'doge-barked':
      if (validators.isMemberId(req.body.memberId, errRes)) {
        console.log('memberId is', req.body.memberId)
        sendNotification(req.body.memberId, 'HellAO WAOrld!')
        // events.trigger(eventType, req.body.memberId, resCallback)
      } else sendErrorStatus()
      break
    case 'doge-hopped':
      if (
        validators.isMemberId(req.body.memberId, errRes) &&
        validators.isTaskId(req.body.taskId, errRes)
      ) {
        console.log('memberId is', req.body.memberId)
        state.serverState.tasks.forEach(task => {
          if (task.taskId === req.body.taskId) {
            let firstPriorityId
            if (task.priorities && task.priorities.length >= 1) {
              firstPriorityId = task.priorities[task.priorities.length - 1]
            }

            if (!firstPriorityId && task.grid && task.grid.rows) {
              const rows = Object.values(task.grid.rows)
              if (rows && rows.length && rows.length >= 1) {
                const cells = Object.values(rows[0])
                if (cells && cells.length && cells.length >= 1) {
                  firstPriorityId = cells[0]
                }
              }
            }

            if (
              !firstPriorityId &&
              task.subTasks &&
              task.subTasks.length >= 1
            ) {
              firstPriorityId = task.subTasks[task.subTasks.length - 1]
            }

            const cardContent = task.guild || task.name
            let firstPriorityContent
            if (firstPriorityId) {
              const firstPriorityCard = state.serverState.tasks.find(
                st => st.taskId === firstPriorityId
              )
              firstPriorityContent =
                firstPriorityCard.guild || firstPriorityCard.name
            }

            const notificationMessage = `${cardContent} - ${firstPriorityContent}`

            sendNotification(req.body.memberId, notificationMessage)
          }
        })
      } else sendErrorStatus()
      break

    case 'doge-migrated':
      let tasks = []
      let memberCard
      let taskIds = []
      state.serverState.tasks.forEach(t => {
        if (t.taskId === req.body.memberId) {
          memberCard = t
        }
        if (t.deck.indexOf(req.body.memberId) >= 0) {
          taskIds.push(t.taskId)
          taskIds = [...taskIds, ...t.subTasks, ...t.priorities, ...t.completed]
        }
      })

      let name = 'migrated doge'
      let memberObject = state.serverState.members.some(m => {
        if (m.memberId === req.body.memberId) {
          let name = m.name
        }
      })
      let envelope = blankCard(v1(), name, 'blue')
      envelope.name = memberCard.name
      envelope.subTasks = [...new Set(taskIds)]
      envelope.passed = [[req.body.address, req.body.toMemberId]]

      tasks = state.serverState.tasks.filter(
        t => taskIds.indexOf(t.taskId) >= 0
      )
      tasks.push(envelope)

      let serverAddress
      let serverSecret
      state.serverState.ao.forEach(a => {
        if (a.address === req.body.address) {
          serverAddress = a.address
          serverSecret = a.secret
        }
      })
      console.log('tasks to be sent: ', tasks.length)
      let next100 = tasks.splice(0, 50)
      let delay = 0
      while (next100.length > 0) {
        let newEvent = {
          type: 'tasks-received',
          tasks: next100,
        }
        setTimeout(() => {
          postEvent(serverAddress, serverSecret, newEvent, connectorRes => {
            console.log('migrate connection response', {
              connectorRes,
            })
          })
        }, delay)
        next100 = tasks.splice(0, 50)
        delay += 500
      }
      break
    case 'resource-created':
      if (
        validators.isNewResourceId(req.body.resourceId, errRes) &&
        validators.isNotes(req.body.name, errRes) &&
        validators.isAmount(req.body.charged, errRes) &&
        validators.isNotes(req.body.secret, errRes) &&
        validators.isBool(req.body.trackStock, errRes)
      ) {
        events.trigger(
          eventType,
          {
            resourceId: req.body.resourceId,
            name: req.body.name,
            charged: req.body.charged,
            secret: req.body.secret,
            trackStock: req.body.trackStock,
            stock: req.body.trackStock ? 0 : undefined,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'resource-used':
      if (
        validators.isActiveMemberId(req.body.memberId, errRes) &&
        validators.isResourceId(req.body.resourceId, errRes) &&
        validators.isAmount(req.body.amount, errRes) &&
        validators.isAmount(req.body.charged, errRes) &&
        validators.isNotes(req.body.notes, errRes)
      ) {
        events.trigger(
          eventType,
          {
            resourceId: req.body.resourceId,
            memberId: req.body.memberId,
            amount: req.body.amount,
            charged: req.body.charged,
            notes: req.body.notes,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'resource-stocked':
      if (
        validators.isResourceId(req.body.resourceId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        validators.isAmount(req.body.amount, errRes) &&
        validators.isAmount(req.body.paid, errRes) &&
        validators.isNotes(req.body.notes, errRes)
      ) {
        events.trigger(
          eventType,
          {
            resourceId: req.body.resourceId,
            memberId: req.body.memberId,
            amount: req.body.amount,
            paid: req.body.paid,
            notes: req.body.notes,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'resource-booked':
      if (
        validators.isTaskId(req.body.resourceId, errRes) &&
        validators.isMemberId(req.body.blame, errRes) &&
        validators.isNotes(req.body.startTs, errRes) &&
        validators.isNotes(req.body.endTs, errRes) &&
        validators.isNotes(req.body.eventType, errRes) &&
        validators.isNotes(req.body.charge, errRes) &&
        validators.isNotes(req.body.notes, errRes)
      ) {
        events.trigger(
          eventType,
          {
            resourceId: req.body.resourceId,
            memberId: req.body.blame,
            startTs: req.body.startTs,
            endTs: req.body.endTs,
            eventType: req.body.eventType,
            charge: req.body.charge,
            notes: req.body.notes,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'resource-purged':
      if (validators.isResourceId(req.body.resourceId, errRes)) {
        events.trigger(
          eventType,
          { resourceId: req.body.resourceId, blame: req.body.blame },
          resCallback
        )
      } else sendErrorStatus()
      break
    // case 'meme-added':
    //   if (
    //     validators.isNotes(req.body.hash) &&
    //     validators.isNotes(reqbody.filename)
    //   ) {
    //     events.trigger(
    //       eventType,
    //       { filename: req.body.filename, hash: req.body.hash },
    //       resCallback
    //     )
    //   } else sendErrorStatus()
    case 'meme-cached':
      console.log('meme-cached')
      if (validators.isTaskId(req.body.taskId, errRes)) {
        const card = state.serverState.tasks.find(
          task => task.taskId === req.body.taskId
        )
        if (card) {
          console.log('found card: ', card.name)

          const urls = Array.from(getUrls(card.name))
          console.log('Found Urls: ', urls)
          if (urls.length >= 1) {
            cache(urls[0], req.body.taskId)
          } else sendErrorStatus()
        } else {
          sendErrorStatus()
        }
      } else sendErrorStatus()
      break
    case 'session-killed':
      if (validators.isSession(req.body.session, errRes)) {
        events.trigger(eventType, req.body.session, resCallback)
      } else sendErrorStatus()
      break
    case 'address-updated':
      if (validators.isTaskId(req.body.taskId, errRes)) {
        newAddress()
          .then(result => {
            console.log('new lightning address generated is ', result)
            let addr = result['bech32']
            events.trigger(
              eventType,
              { taskId: req.body.taskId, address: addr },
              resCallback
            )
          })
          .catch(err => {
            res.status(200).send('attempt failed')
          })
        break
      } else sendErrorStatus()
      break
    case 'task-created':
      const hash = createHash(req.body.name)
      const isExist = state.serverState.tasks.some(t => t.hash === hash)
      if (
        validators.isNotes(req.body.name, errRes) &&
        !validators.taskNameExists(req.body.name, errRes) &&
        validators.isNotes(req.body.color, errRes) &&
        validators.isNotes(req.body.deck, errRes) &&
        (req.body.inId === null ||
          validators.isTaskId(req.body.inId, errRes)) &&
        validators.isBool(req.body.prioritized, errRes)
      ) {
        if (!isExist) {
          events.trigger(
            eventType,
            {
              taskId: v1(),
              lastClaimed: Date.now(),
              name: req.body.name,
              color: req.body.color,
              deck: req.body.deck,
              hash: hash,
              inId: req.body.inId,
              prioritized: req.body.prioritized,
            },
            resCallback
          )
        }
      } else sendErrorStatus()
      break
    case 'task-guilded':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isNotes(req.body.guild, errRes)
      ) {
        events.trigger(
          eventType,
          { taskId: req.body.taskId, guild: req.body.guild },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-seen':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.trigger(
          eventType,
          { taskId: req.body.taskId, memberId: req.body.memberId },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-sub-tasked':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isTaskId(req.body.subTask, errRes) &&
        validators.isMemberId(req.body.blame)
      ) {
        events.trigger(
          eventType,
          eventType,
          {
            taskId: req.body.taskId,
            subTask: req.body.subTask,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-de-sub-tasked':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isTaskId(req.body.subTask, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            subTask: req.body.subTask,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-emptied':
      if (validators.isTaskId(req.body.taskId, errRes)) {
        events.trigger(
          eventType,
          { taskId: req.body.taskId, memberId: req.body.blame },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-property-set':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        (typeof req.body.property === 'string' ||
          req.body.property instanceof String) &&
        validators.isNotes(req.body.value, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            property: req.body.property,
            value: req.body.value,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-colored':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        (validators.isTaskId(req.body.inId, errRes) ||
          req.body.inId === null) &&
        validators.isColor(req.body.color, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            inId: req.body.inId,
            color: req.body.color,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-claimed':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            memberId: req.body.memberId,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-unclaimed':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        validators.isNotes(req.body.notes, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            memberId: req.body.memberId,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-refocused':
      if (
        validators.isTaskId(req.body.inId, errRes) &&
        validators.isTaskId(req.body.taskId, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            inId: req.body.inId,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'pile-refocused':
      if (validators.isTaskId(req.body.inId, errRes)) {
        events.trigger(
          eventType,
          { inId: req.body.inId, blame: req.body.blame },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-allocated':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isTaskId(req.body.allocatedId, errRes) &&
        validators.isAmount(req.body.amount, errRes) &&
        validators.isMemberId(req.body.blame, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            allocatedId: req.body.allocatedId,
            amount: req.body.amount,
            memberId: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'tasks-removed':
      if (req.body.taskIds.every(tId => validators.isTaskId(tId, errRes))) {
        events.trigger(
          eventType,
          { taskIds: req.body.taskIds, blame: req.body.blame },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-passed':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.fromMemberId, errRes) &&
        validators.isMemberId(req.body.toMemberId, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            fromMemberId: req.body.fromMemberId,
            toMemberId: req.body.toMemberId,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-grabbed':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        req.body.memberId !== req.body.taskId
      ) {
        events.trigger(
          eventType,
          { taskId: req.body.taskId, memberId: req.body.memberId },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'pile-grabbed':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        req.body.memberId !== req.body.taskId
      ) {
        events.trigger(
          eventType,
          { taskId: req.body.taskId, memberId: req.body.memberId },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-dropped':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.trigger(
          eventType,
          { taskId: req.body.taskId, memberId: req.body.memberId },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'pile-dropped':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.trigger(
          eventType,
          { taskId: req.body.taskId, memberId: req.body.memberId },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-swapped':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isTaskId(req.body.swapId1, errRes) &&
        (validators.isTaskId(req.body.swapId2, errRes) ||
          req.body.swapId2 === -1)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            swapId1: req.body.swapId1,
            swapId2: req.body.swapId2,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-bumped':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isTaskId(req.body.bumpId, errRes) &&
        (req.body.direction === -1 || req.body.direction === 1)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            bumpId: req.body.bumpId,
            direction: req.body.direction,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-prioritized':
      if (
        validators.isTaskId(req.body.inId, errRes) &&
        validators.isTaskId(req.body.taskId, errRes) &&
        Number.isInteger(req.body.position) &&
        validators.isMemberId(req.body.blame, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            inId: req.body.inId,
            position: req.body.position,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-started':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        (!req.body.inId || validators.isTaskId(req.body.inId, errRes)) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.trigger(
          eventType,
          {
            memberId: req.body.memberId,
            taskId: req.body.taskId,
            inId: req.body.inId,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-stopped':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        (!req.body.inId || validators.isTaskId(req.body.inId, errRes)) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.trigger(
          eventType,
          {
            memberId: req.body.memberId,
            taskId: req.body.taskId,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-time-clocked':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            memberId: req.body.memberId,
            seconds: req.body.seconds,
            date: req.body.date,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-signed':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        !validators.isMemberId(req.body.taskId, errRes) &&
        Number.isInteger(req.body.opinion)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            memberId: req.body.memberId,
            opinion: req.body.opinion,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-membership':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        !validators.isMemberId(req.body.taskId, errRes) &&
        Number.isInteger(req.body.level) &&
        validators.isMemberId(req.body.blame, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            memberId: req.body.memberId,
            level: req.body.level,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-stashed':
      // const val1 = validators.isTaskId(req.body.taskId, errRes)
      // const val2 = validators.isTaskId(req.body.inId, errRes)
      // const val3 = Number.isInteger(req.body.level)
      // console.log('typeof level is', typeof req.body.level)
      // const val4 = validators.isMemberId(req.body.blame, errRes)
      // console.log('stashed vals ar e', { val1, val2, val3, val4 })

      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isTaskId(req.body.inId, errRes) &&
        Number.isInteger(req.body.level) &&
        validators.isMemberId(req.body.blame, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            inId: req.body.inId,
            level: req.body.level,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-unstashed':
      // const vala1 = validators.isTaskId(req.body.taskId, errRes)
      // const vala2 = validators.isTaskId(req.body.inId, errRes)
      // const vala3 = Number.isInteger(req.body.level)
      // console.log('typeof level is', typeof req.body.level)
      // const vala4 = validators.isMemberId(req.body.blame, errRes)
      // console.log('stashed vals ar e', { val1, val2, val3, val4 })

      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isTaskId(req.body.inId, errRes) &&
        Number.isInteger(req.body.level) &&
        validators.isMemberId(req.body.blame, errRes)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            inId: req.body.inId,
            level: req.body.level,
            blame: req.body.blame,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'pile-prioritized':
      if (validators.isTaskId(req.body.inId, errRes)) {
        events.trigger(eventType, { inId: req.body.inId }, resCallback)
      } else sendErrorStatus()
    case 'tasks-received':
      if (true) {
        // TODO
        events.trigger(
          eventType,
          { tasks: req.body.tasks, blame: req.body.blame },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'task-visited':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        Number.isInteger(req.body.area)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            memberId: req.body.memberId,
            area: req.body.area,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'grid-created':
      if (
        validators.isNotes(req.body.name, errRes) &&
        Number.isInteger(req.body.height, errRes) &&
        Number.isInteger(req.body.width) &&
        validators.isColor(req.body.color) &&
        Array.isArray(req.body.deck)
      ) {
        events.trigger(
          eventType,
          {
            taskId: v1(),
            name: req.body.name,
            height: req.body.height,
            width: req.body.width,
            color: req.body.color,
            deck: req.body.deck,
          },
          resCallback
        )
      } else sendErrorStatus()
      break

    case 'grid-added':
      if (
        validators.isTaskId(req.body.taskId) &&
        Number.isInteger(req.body.height, errRes) &&
        Number.isInteger(req.body.width)
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            height: req.body.height,
            width: req.body.width,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'grid-removed':
      if (validators.isTaskId(req.body.taskId)) {
        events.trigger(eventType, { taskId: req.body.taskId }, resCallback)
      } else sendErrorStatus()
      break
    case 'grid-resized':
      if (
        validators.isTaskId(req.body.taskId) &&
        Number.isInteger(req.body.height) &&
        req.body.height >= 1 &&
        Number.isInteger(req.body.width) &&
        req.body.width >= 1
      ) {
        events.trigger(
          eventType,
          {
            taskId: req.body.taskId,
            height: req.body.height,
            width: req.body.width,
          },
          resCallback
        )
      } else sendErrorStatus()
      break

    case 'grid-pin':
      if (
        validators.taskIdExists(req.body.inId, errRes) &&
        validators.taskIdExists(req.body.taskId, errRes) &&
        Number.isInteger(req.body.x) &&
        req.body.x >= 0 &&
        Number.isInteger(req.body.y) &&
        req.body.y >= 0 &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.trigger(
          eventType,
          {
            inId: req.body.inId,
            taskId: req.body.taskId,
            x: req.body.x,
            y: req.body.y,
            memberId: req.body.memberId,
          },
          resCallback
        )
      } else sendErrorStatus()
      break
    case 'grid-unpin':
      if (
        validators.isTaskId(req.body.inId, errRes) &&
        Number.isInteger(req.body.x) &&
        req.body.x >= 0 &&
        Number.isInteger(req.body.y) &&
        req.body.y >= 0
      ) {
        events.trigger(
          eventType,
          { inId: req.body.inId, x: req.body.x, y: req.body.y },
          resCallback
        )
      } else sendErrorStatus()
      break

    default:
      next()
  }
})

export default router
