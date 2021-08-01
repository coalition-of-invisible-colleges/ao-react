import express from 'express'
import v1 from 'uuid'
import state from './state.js'
import { buildResCallback } from './utils.js'
import validators from './validators.js'
import { blankCard } from '../calculations.js'
import events from './events.js'
import { postEvent } from './connector.js'
import lightning from './lightning.js'

const router = express.Router()

router.post('/events', (req, res, next) => {
  state.serverState.sessions.forEach(s => {
    if (s.token === req.headers.authorization) {
      req.body.blame = s.ownerId
    }
  })
  next()
})

router.post('/events', (req, res, next) => {
  let errRes = []
  switch (req.body.type) {
    case 'ao-linked':
      if (
        validators.isAddress(req.body.address, errRes) &&
        validators.isTaskId(req.body.taskId)
      ) {
        events.aoLinked(
          req.body.address,
          req.body.taskId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'highlighted':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        validators.isBool(req.body.valence, errRes)
      ) {
        events.highlighted(
          req.body.taskId,
          req.body.memberId,
          req.body.valence,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'ao-disconnected':
      if (validators.isAddress(req.body.address, errRes)) {
        events.aoDisconnected(req.body.address, buildResCallback(res))
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'ao-named':
      if (validators.isNotes(req.body.alias, errRes)) {
        events.aoNamed(req.body.alias, buildResCallback(res))
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'rent-set':
      if (validators.isAmount(req.body.amount, errRes)) {
        events.rentSet(req.body.amount, buildResCallback(res))
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'cap-set':
      if (validators.isAmount(req.body.amount, errRes)) {
        events.capSet(req.body.amount, buildResCallback(res))
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'quorum-set':
      if (validators.isAmount(req.body.quorum, errRes)) {
        events.quorumSet(req.body.quorum, buildResCallback(res))
      } else {
        res.status(400).send(errRes)
      }
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
            events.aoOutboundConnected(
              req.body.address,
              req.body.secret,
              buildResCallback(res)
            )
          }
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'ao-inbound-connected':
      if (
        validators.isNotes(req.body.address, errRes) &&
        validators.isNotes(req.body.secret, errRes)
      ) {
        events.aoInboundConnected(
          req.body.address,
          req.body.secret,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
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
        lightning
          .createInvoice(req.body.amount, '<3' + v1(), '~', 3600)
          .then(result => {
            events.invoiceCreated(
              req.body.taskId,
              result.bolt11,
              result.payment_hash,
              buildResCallback(res)
            )
          })
          .catch(err => {
            console.log({ err })
            res.status(200).send('attempt failed')
          })
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'member-created':
      if (
        validators.isNotes(req.body.name, errRes) &&
        validators.isNotes(req.body.fob, errRes) &&
        validators.isNotes(req.body.secret) &&
        !validators.isMemberName(req.body.name, errRes)
      ) {
        events.memberCreated(
          req.body.name,
          req.body.fob,
          req.body.secret,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'member-activated':
      if (validators.isMemberId(req.body.memberId, errRes)) {
        events.memberActivated(req.body.memberId, buildResCallback(res))
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'member-deactivated':
      if (validators.isMemberId(req.body.memberId, errRes)) {
        events.memberDeactivated(req.body.memberId, buildResCallback(res))
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'member-secret-reset':
      if (
        validators.isMemberId(req.body.kohaiId, errRes) &&
        validators.isMemberId(req.body.senpaiId, errRes) &&
        validators.isSenpaiOf(req.body.senpaiId, req.body.kohaiId, errRes) === 1
      ) {
        events.memberSecretReset(
          req.body.kohaiId,
          req.body.senpaiId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'member-promoted':
      if (
        validators.isMemberId(req.body.kohaiId, errRes) &&
        validators.isMemberId(req.body.senpaiId, errRes) &&
        validators.isAheadOf(req.body.senpaiId, req.body.kohaiId, errRes) === 1
      ) {
        events.memberPromoted(
          req.body.kohaiId,
          req.body.senpaiId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'member-banned':
      if (
        validators.isMemberId(req.body.kohaiId, errRes) &&
        validators.isMemberId(req.body.senpaiId, errRes) &&
        validators.isSenpaiOf(req.body.senpaiId, req.body.kohaiId, errRes) === 1
      ) {
        events.memberBanned(
          req.body.kohaiId,
          req.body.senpaiId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'member-unbanned':
      if (
        validators.isMemberId(req.body.kohaiId, errRes) &&
        validators.isMemberId(req.body.senpaiId, errRes) &&
        validators.hasBanOn(req.body.senpaiId, req.body.kohaiId, errRes)
      ) {
        events.memberUnbanned(
          req.body.kohaiId,
          req.body.senpaiId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'member-purged':
      if (validators.isMemberId(req.body.memberId, errRes)) {
        events.memberPurged(
          req.body.memberId,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'member-field-updated':
      if (
        validators.isMemberId(req.body.memberId, errRes) &&
        validators.isField(req.body.field, errRes) &&
        validators.isNotes(req.body.newfield, errRes)
      ) {
        events.memberFieldUpdated(
          req.body.memberId,
          req.body.field,
          req.body.newfield,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'member-ticker-set':
      if (
        validators.isNotes(req.body.fromCoin, errRes) &&
        validators.isNotes(req.body.toCoin, errRes) &&
        validators.isAmount(req.body.index, errRes) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.memberTickerSet(
          req.body.fromCoin,
          req.body.toCoin,
          req.body.index,
          req.body.memberId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'doge-barked':
      if (validators.isMemberId(req.body.memberId, errRes)) {
        events.dogeBarked(req.body.memberId, buildResCallback(res))
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'doge-muted':
      if (validators.isMemberId(req.body.memberId, errRes)) {
        events.dogeMuted(req.body.memberId, buildResCallback(res))
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'doge-unmuted':
      if (validators.isMemberId(req.body.memberId, errRes)) {
        events
          .dogeUnmuted(req.body.memberId, buildResCallback(res))
          .catch(err => {
            console.log({ err })
            res.status(200).send('attempt failed')
          })
      } else {
        res.status(200).send(errRes)
      }
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
        events.resourceCreated(
          req.body.resourceId,
          req.body.name,
          req.body.charged,
          req.body.secret,
          req.body.trackStock,
          buildResCallback(res)
        )
      } else {
        res.status(200).send(errRes)
      }
      break
    case 'resource-used':
      if (
        validators.isActiveMemberId(req.body.memberId, errRes) &&
        validators.isResourceId(req.body.resourceId, errRes) &&
        validators.isAmount(req.body.amount, errRes) &&
        validators.isAmount(req.body.charged, errRes) &&
        validators.isNotes(req.body.notes, errRes)
      ) {
        events.resourceUsed(
          req.body.resourceId,
          req.body.memberId,
          req.body.amount,
          req.body.charged,
          req.body.notes,
          buildResCallback(res)
        )
      } else {
        res.status(200).send(errRes)
      }
      break
    case 'resource-stocked':
      if (
        validators.isResourceId(req.body.resourceId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        validators.isAmount(req.body.amount, errRes) &&
        validators.isAmount(req.body.paid, errRes) &&
        validators.isNotes(req.body.notes, errRes)
      ) {
        events.resourceStocked(
          req.body.resourceId,
          req.body.memberId,
          req.body.amount,
          req.body.paid,
          req.body.notes,
          buildResCallback(res)
        )
      } else {
        res.status(200).send(errRes)
      }
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
        events.resourceBooked(
          req.body.resourceId,
          req.body.blame,
          req.body.startTs,
          req.body.endTs,
          req.body.eventType,
          req.body.charge,
          req.body.notes,
          buildResCallback(res)
        )
      } else {
        res.status(200).send(errRes)
      }
      break
    case 'resource-purged':
      if (validators.isResourceId(req.body.resourceId, errRes)) {
        events.resourcePurged(
          req.body.resourceId,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'meme-added':
      if (
        validators.isNotes(req.body.hash) &&
        validators.isNotes(reqbody.filename)
      ) {
        events.memeAdded(
          req.body.filename,
          req.body.hash,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }

    case 'session-killed':
      if (validators.isSession(req.body.session, errRes)) {
        events.sessionKilled(req.body.session, buildResCallback(res))
      } else {
        res.status(200).send(errRes)
      }
      break
    case 'address-updated':
      if (validators.isTaskId(req.body.taskId, errRes)) {
        lightning
          .newAddress()
          .then(result => {
            let addr = result['p2sh-segwit']
            events.addressUpdated(req.body.taskId, addr, buildResCallback(res))
          })
          .catch(err => {
            res.status(200).send('attempt failed')
          })
      } else {
        res.status(200).send(errRes)
      }
      break
    case 'task-created':
      if (
        validators.isNotes(req.body.name, errRes) &&
        !validators.isTaskName(req.body.name, errRes) &&
        validators.isNotes(req.body.color, errRes) &&
        validators.isNotes(req.body.deck, errRes) &&
        (req.body.inId === null ||
          validators.isTaskId(req.body.inId, errRes)) &&
        validators.isBool(req.body.prioritized, errRes)
      ) {
        events.taskCreated(
          req.body.name,
          req.body.color,
          req.body.deck,
          req.body.inId,
          req.body.prioritized,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-guilded':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isNotes(req.body.guild, errRes)
      ) {
        events.taskGuilded(
          req.body.taskId,
          req.body.guild,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-seen':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.taskSeen(
          req.body.taskId,
          req.body.memberId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-sub-tasked':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isTaskId(req.body.subTask, errRes) &&
        validators.isMemberId(req.body.blame)
      ) {
        events.taskSubTasked(
          req.body.taskId,
          req.body.subTask,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-de-sub-tasked':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isTaskId(req.body.subTask, errRes)
      ) {
        events.taskDeSubTasked(
          req.body.taskId,
          req.body.subTask,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-emptied':
      if (validators.isTaskId(req.body.taskId, errRes)) {
        events.taskEmptied(
          req.body.taskId,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-property-set':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        (typeof req.body.property === 'string' ||
          req.body.property instanceof String) &&
        validators.isNotes(req.body.value, errRes)
      ) {
        events.taskPropertySet(
          req.body.taskId,
          req.body.property,
          req.body.value,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-colored':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        (validators.isTaskId(req.body.inId, errRes) ||
          req.body.inId === null) &&
        validators.isColor(req.body.color, errRes)
      ) {
        events.taskColored(
          req.body.taskId,
          req.body.inId,
          req.body.color,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-claimed':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.taskClaimed(
          req.body.taskId,
          req.body.memberId,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-unclaimed':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        validators.isNotes(req.body.notes, errRes)
      ) {
        events.taskUnclaimed(
          req.body.taskId,
          req.body.memberId,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-interval-set':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isAmount(req.body.claimInterval, errRes) &&
        validators.isMemberId(req.body.blame, errRes)
      ) {
        events.taskIntervalSet(
          req.body.taskId,
          req.body.claimInterval,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-refocused':
      if (
        validators.isTaskId(req.body.inId, errRes) &&
        validators.isTaskId(req.body.taskId, errRes)
      ) {
        events.taskRefocused(
          req.body.taskId,
          req.body.inId,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'pile-refocused':
      if (validators.isTaskId(req.body.inId, errRes)) {
        events.pileRefocused(
          req.body.inId,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'tasks-removed':
      if (req.body.taskIds.every(tId => validators.isTaskId(tId, errRes))) {
        events.tasksRemoved(
          req.body.taskIds,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-passed':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.fromMemberId, errRes) &&
        validators.isMemberId(req.body.toMemberId, errRes)
      ) {
        events.taskPassed(
          req.body.taskId,
          req.body.fromMemberId,
          req.body.toMemberId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-grabbed':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        req.body.memberId !== req.body.taskId
      ) {
        events.taskGrabbed(
          req.body.taskId,
          req.body.memberId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'pile-grabbed':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        req.body.memberId !== req.body.taskId
      ) {
        events.pileGrabbed(
          req.body.taskId,
          req.body.memberId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-dropped':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.taskDropped(
          req.body.taskId,
          req.body.memberId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'pile-dropped':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.pileDropped(
          req.body.taskId,
          req.body.memberId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-swapped':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isTaskId(req.body.swapId1, errRes) &&
        (validators.isTaskId(req.body.swapId2, errRes) ||
          req.body.swapId2 === -1)
      ) {
        events.taskSwapped(
          req.body.taskId,
          req.body.swapId1,
          req.body.swapId2,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-bumped':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isTaskId(req.body.bumpId, errRes) &&
        (req.body.direction === -1 || req.body.direction === 1)
      ) {
        events.taskBumped(
          req.body.taskId,
          req.body.bumpId,
          req.body.direction,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break

    case 'task-prioritized':
      if (
        validators.isTaskId(req.body.inId, errRes) &&
        validators.isTaskId(req.body.taskId, errRes) &&
        Number.isInteger(req.body.position)
      ) {
        events.taskPrioritized(
          req.body.taskId,
          req.body.inId,
          req.body.position,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-time-clocked':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.taskTimeClocked(
          req.body.taskId,
          req.body.memberId,
          req.body.seconds,
          req.body.date,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-signed':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        !validators.isMemberId(req.body.taskId, errRes) &&
        Number.isInteger(req.body.opinion)
      ) {
        events.taskSigned(
          req.body.taskId,
          req.body.memberId,
          req.body.opinion,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'pile-prioritized':
      if (validators.isTaskId(req.body.inId, errRes)) {
        events.pilePrioritized(req.body.inId, buildResCallback(res))
      } else {
        res.status(400).send(errRes)
      }
    case 'tasks-received':
      if (true) {
        // XXX
        events.tasksReceived(
          req.body.tasks,
          req.body.blame,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'task-visited':
      if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isMemberId(req.body.memberId, errRes) &&
        Number.isInteger(req.body.area)
      ) {
        events.taskVisited(
          req.body.taskId,
          req.body.memberId,
          req.body.area,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break
    case 'grid-created':
      if (
        validators.isNotes(req.body.name, errRes) &&
        Number.isInteger(req.body.height, errRes) &&
        Number.isInteger(req.body.width) &&
        validators.isColor(req.body.color) &&
        Array.isArray(req.body.deck)
      ) {
        events.gridCreated(
          req.body.name,
          req.body.height,
          req.body.width,
          req.body.color,
          req.body.deck,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break

    case 'grid-added':
      if (
        validators.isTaskId(req.body.taskId) &&
        Number.isInteger(req.body.height, errRes) &&
        Number.isInteger(req.body.width)
      ) {
        events.gridAdded(
          req.body.taskId,
          req.body.height,
          req.body.width,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break

    case 'grid-removed':
      if (validators.isTaskId(req.body.taskId)) {
        events.gridRemoved(req.body.taskId, buildResCallback(res))
      } else {
        res.status(400).send(errRes)
      }
      break

    case 'grid-resized':
      if (
        validators.isTaskId(req.body.taskId) &&
        Number.isInteger(req.body.height) &&
        req.body.height >= 1 &&
        Number.isInteger(req.body.width) &&
        req.body.width >= 1
      ) {
        events.gridResized(
          req.body.taskId,
          req.body.height,
          req.body.width,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break

    case 'grid-pin':
      if (
        validators.isTaskId(req.body.inId) &&
        validators.isTaskId(req.body.taskId) &&
        Number.isInteger(req.body.x) &&
        req.body.x >= 0 &&
        Number.isInteger(req.body.y) &&
        req.body.y >= 0 &&
        validators.isMemberId(req.body.memberId, errRes)
      ) {
        events.gridPin(
          req.body.inId,
          req.body.taskId,
          req.body.x,
          req.body.y,
          req.body.memberId,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }

      break

    case 'grid-unpin':
      if (
        validators.isTaskId(req.body.inId) &&
        Number.isInteger(req.body.x) &&
        req.body.x >= 0 &&
        Number.isInteger(req.body.y) &&
        req.body.y >= 0
      ) {
        events.gridUnpin(
          req.body.inId,
          req.body.x,
          req.body.y,
          buildResCallback(res)
        )
      } else {
        res.status(400).send(errRes)
      }
      break

    default:
      next()
  }
})

export default router
