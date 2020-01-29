const express = require( 'express')
const { serverState } = require( './state')
const utils = require( './utils')
const validators = require( './validators')
const events = require( './events')
const connector = require( './connector')
const Cards = require( '../utils/cards')

const router = express.Router()

router.post('/events', (req, res, next) => {
    serverState.sessions.forEach(s => {
        if (s.token === req.headers.authorization){
            req.body.blame = s.ownerId
        }
    })
    next()
})

router.post('/events', (req, res, next)=>{
  switch (req.body.type){
      case 'ao-disconnected':
          specAoDisconnected(req, res, next)
          break
      case 'ao-named':
          specAoNamed(req, res, next)
          break
      case 'cash-increased':
          specCashIncreased(req, res, next)
          break
      case 'cash-decreased':
          specCashDecreased(req, res, next)
          break
      case 'rent-set':
          specRentSet(req, res, next)
          break
      case 'cap-set':
          specCapSet(req, res, next)
          break
      case 'ao-connected':
          specAOConnect(req, res, next)
          break
      case 'ao-subscribed':
          specAOSubscribed(req, res, next)
          break
      case 'ao-relay':
          let secret
          state.serverState.ao.forEach(a => {
              if (a.address == req.body.address){
                  secret = a.secret
              }
          })
          if (secret){
            console.log('ao relay attempt', req.body.address, req.body.ev)
            connector.postEvent(req.body.address, secret, req.body.ev, (connectorRes) => {
                console.log("connection response: ", {connectorRes})
                if (connectorRes.lastInsertRowid){
                    events.aoRelayAttempted(
                      req.body.address,
                      true,
                      utils.buildResCallback(res)
                    )
                } else {
                    events.aoRelayAttempted(
                      req.body.address,
                      false,
                      utils.buildResCallback(res)
                    )
                }
            })
          } else {
              console.log("no connection for ", req.body.address)
          }
          break
      case "ao-updated":
          specAoUpdated(req, res, next)
          break
      case 'invoice-created':
          specInvoiceCreated(req, res, next)
          break
      case 'invoice-requested':
          specInvoiceRequested(req, res, next)
          break
      case 'member-created':
           specMemberCreated(req, res, next)
           break
      case 'member-paid':
          specMemberPaid(req, res, next)
          break
      case 'member-charged':
          specMemberCharged(req, res, next)
          break
      case 'member-activated':
          specMemberActivated(req, res, next)
          break
      case 'member-deactivated':
          specMemberDeactivated(req, res, next)
          break
      case 'member-purged':
          specMemberPurged(req, res, next)
          break
      case 'member-field-updated':
          specMemberFieldUpdated(req, res, next)
          break
      case 'badge-added':
          specBadgeAdded(req, res, next)
          break
      case 'badge-removed':
          specBadgeRemoved(req, res, next)
          break
      case 'badge-hidden':
          specBadgeHidden(req, res, next)
          break
      case 'doge-barked':
          specDogeBarked(req, res, next)
          break
      case 'doge-muted':
          specDogeMuted(req, res, next)
          break
      case 'doge-unmuted':
          specDogeUnmuted(req, res, next)
          break
      case 'doge-migrated':
          specDogeMigrated(req, res, next)
          break
      case 'resource-created':
          specResourceCreated(req, res, next)
          break
      case 'resource-used':
          specResourceUsed(req, res, next)
          break
      case 'resource-stocked':
          specResourceStocked(req, res, next)
          break
      case 'resource-removed':
          specResourceRemoved(req, res, next)
          break
      case 'resource-booked':
          specResourceBooked(req, res, next)
          break
      case 'resource-purged':
          specResourcePurged(req, res, next)
          break
      case 'session-killed':
          specSessionKilled(req, res, next)
          break
      case 'address-updated':
          specAddressUpdated(req, res, next)
          break
      case 'task-created':
          specTaskCreated(req, res, next)
          break
      case 'task-bountied':
          specTaskBountied(req, res, next)
          break
      case 'task-guilded':
          specTaskGuilded(req, res, next)
          break
      case 'task-sub-tasked':
          specSubTasked(req, res, next)
          break
      case 'task-de-sub-tasked':
          specDeSubTasked(req, res, next)
          break
      case 'task-claimed':
          specTaskClaimed(req, res, next)
          break
      case 'task-unclaimed':
          specTaskUnclaimed(req, res, next)
          break
      case 'task-refocused':
          specTaskRefocused(req, res, next)
          break
      case 'task-rate-updated':
          specTaskRateUpdated(req, res, next)
          break
      case 'task-cap-updated':
          specTaskCapUpdated(req, res, next)
          break
      case 'task-instructions-updated':
          specTaskInstructionsUpdated(req, res, next)
          break
      case 'task-removed':
          specTaskRemoved(req, res, next)
          break
      case 'task-passed':
          specTaskPassed(req, res, next)
          break
      case 'task-grabbed':
          specTaskMoved(req, res, next)
          break
      case 'pile-grabbed':
          specTaskMoved(req, res, next)
          break
      case 'task-dropped':
          specTaskMoved(req, res, next)
          break
      case 'pile-dropped':
          specTaskMoved(req, res, next)
          break
      case 'task-swapped':
          specTaskSwapped(req, res, next)
          break
      case 'task-prioritized':
          specTaskPrioritized(req, res, next)
          break
      case 'task-allocated':
          specTaskAllocated(req, res, next)
          break
      case 'invoice-created':
          specInvoiceCreated(req, res, next)
          break
      case 'state-requested':
          specStateRequested(req, res, next)
          break
      case 'tasks-received':
          specTasksReceived(req, res, next)
          break
      default:
          next()
    }
})

function specTasksReceived(req, res, next){
    let errRes = []
    console.log("tasks rec called: ", req.body)
    if (true) { // XXX
        events.tasksReceived(
          req.body.tasks,
          req.body.blame,
          utils.buildResCallback(res))
    } else {
      res.status(200).send(errRes)
    }
}

function specInvoiceCreated(req, res, next){
    let errRes = []
    console.log("validating: ", req.body)
    if (
        validators.isTaskId(req.body.taskId, errRes) &&
        validators.isAmount(req.body.amount, errRes)
    ) {
        lightning.createInvoice(req.body.amount, "<3" +  uuidV1(), '~', 3600)
            .then(result => {
                let addr = result['p2sh-segwit']
                events.invoiceCreated(req.body.taskId, result.bolt11, result.payment_hash, utils.buildResCallback(res))
            })
            .catch(err => {
                console.log({err})
                res.status(200).send("attempt failed")
            });
    } else {
      res.status(200).send(errRes)
    }
}

function specAddressUpdated(req, res, next){
    let errRes = []
    console.log("attempt to create address", req.body)
    if (validators.isTaskId(req.body.taskId, errRes)) {
        lightning.newAddress()
            .then(result => {
                let addr = result['p2sh-segwit']
                events.addressUpdated(req.body.taskId, addr, utils.buildResCallback(res))
            })
            .catch(err => {
                res.status(200).send("attempt failed")
            });
    } else {
      console.log('req invalid')
      res.status(200).send(errRes)
    }
}

//
function specTaskGuilded(req, res, next){
  let errRes = []
  if (
    validators.isNotes(req.body.taskId, errRes) &&
    validators.isNotes(req.body.guild, errRes)
  ){
    events.taskGuilded(
      req.body.taskId,
      req.body.guild,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specSubTasked(req, res, next){
  let errRes = []
  if (
    validators.isNotes(req.body.taskId, errRes) &&
    validators.isNotes(req.body.subTask, errRes)
  ){
    events.taskSubTasked(
      req.body.taskId,
      req.body.subTask,
      req.body.memberId,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specDeSubTasked(req, res, next){
  let errRes = []
  if (
    validators.isNotes(req.body.taskId, errRes) &&
    validators.isNotes(req.body.subTask, errRes)
  ){
    events.taskDeSubTasked(
      req.body.taskId,
      req.body.subTask,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specTaskCreated(req, res, next){
  let errRes = []
  if (
    validators.isName(req.body.name, errRes) &&
    validators.isNotes(req.body.color, errRes) &&
    validators.isNotes(req.body.deck, errRes) &&
    validators.isTaskId(req.body.inId)
  ){
    events.taskCreated(
      req.body.name,
      req.body.color,
      req.body.deck,
      req.body.inId,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specTaskBountied(req, res, next) {
  let errRes = []
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isNotes(req.body.instructions, errRes) &&
    validators.isAmount(req.body.boost, errRes) &&
    validators.isAmount(req.body.monthlyValue, errRes) &&
    validators.isAmount(req.body.cap, errRes) &&
    validators.isBool(req.body.oneTime, errRes) &&
    validators.isMemberId(req.body.blame, errRes)
  ){
    events.taskBountied(
      req.body.taskId,
      req.body.instructions,
      req.body.boost,
      req.body.monthlyValue,
      req.body.cap,
      req.body.oneTime,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specTaskPassed(req, res, next){
  let errRes = []
  // TODO: this member-fob conversion in earlier middleware, (new name authFob?)
  let paid
  state.pubState.tasks.forEach( task => {
    if (task.taskId == req.body.taskId){
        paid = calculations.calculateTaskPayout(task)
    }
  })
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isMemberId(req.body.fromMemberId, errRes) &&
    validators.isMemberId(req.body.toMemberId, errRes)
  ){
    events.taskPassed(
      req.body.taskId,
      req.body.fromMemberId,
      req.body.toMemberId,
      utils.buildResCallback(res)
    )
  } else {
      res.status(400).send(errRes)
  }
}

function specTaskClaimed(req, res, next){
  let errRes = []
  let paid = 0
  state.pubState.tasks.forEach( task => {
      if (task.allocations && Array.isArray(task.allocations) ){
        task.allocations.forEach( al => {
          if (al.allocatedId === req.body.taskId){
            paid = paid + al.amount
          }
        })
      }
  })

  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isMemberId(req.body.memberId, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    events.taskClaimed(
      req.body.taskId,
      req.body.memberId,
      paid,
      req.body.notes,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
      res.status(400).send(errRes)
  }
}

function specTaskUnclaimed(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isMemberId(req.body.memberId, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    events.taskUnclaimed(
      req.body.taskId,
      req.body.memberId,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
      res.status(400).send(errRes)
  }
}

function specTaskPrioritized(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.inId, errRes) &&
    validators.isTaskId(req.body.taskId, errRes)
  ){
      switch (req.body.type) {
case 'task-prioritized':
    events.taskPrioritized(
      req.body.taskId,
      req.body.inId,
      utils.buildResCallback(res)
    )
    break
      }
  } else {
    res.status(200).send(errRes)
  }
}

function specTaskRefocused(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.inId, errRes) &&
    validators.isTaskId(req.body.taskId, errRes)
  ){
    events.taskRefocused(
      req.body.taskId,
      req.body.inId,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
      res.status(400).send(errRes)
  }
}

function specTaskCapUpdated(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isAmount(req.body.amount, errRes)
  ){
    events.taskCapUpdated(
      req.body.taskId,
      req.body.amount,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specTaskRateUpdated(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isAmount(req.body.amount, errRes)
  ){
    events.taskRateUpdated(
      req.body.taskId,
      req.body.amount,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}


function specTaskInstructionsUpdated(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isNotes(req.body.newInstructions, errRes)
  ){
    events.taskInstructionsUpdated(
      req.body.taskId,
      req.body.newInstructions,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

// function specTaskBoosted(req, res, next){
//   let errRes = []
//   if (
//     validators.isTaskId(req.body.taskId, errRes) &&
//     validators.isAmount(req.body.amount, errRes)
//   ){
//     events.taskBoosted(
//       req.body.taskId,
//       req.body.amount,
//       req.body.blame,
//       utils.buildResCallback(res)
//     )
//   } else {
//     res.status(200).send(errRes)
//   }
// }


function specTaskRemoved(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.taskId, errRes)
  ){
    events.taskRemoved(
      req.body.taskId,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}


function specTaskMoved(req, res, next){
  let errRes = []
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isMemberId(req.body.memberId, errRes) &&
    req.body.memberId !== req.body.taskId
  ){
      switch (req.body.type) {
          case 'task-grabbed':
              events.taskGrabbed(
                req.body.taskId,
                req.body.memberId,
                utils.buildResCallback(res)
              )
              break
          case 'pile-grabbed':
              events.pileGrabbed(
                req.body.taskId,
                req.body.memberId,
                utils.buildResCallback(res)
              )
              break
          case 'task-dropped':
              events.taskDropped(
                req.body.taskId,
                req.body.memberId,
                utils.buildResCallback(res)
              )
              break
          case 'pile-dropped':
              events.pileDropped(
                req.body.taskId,
                req.body.memberId,
                utils.buildResCallback(res)
              )
              break
      }
  } else {
    res.status(200).send(errRes)
  }
}

function specTaskSwapped(req, res, next){
  let errRes = []
  if (validators.isTaskId(req.body.taskId, errRes)) {
    events.taskSwapped(
      req.body.taskId,
      req.body.swapId1,
      req.body.swapId2,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specTasksReceived(req, res, next){
  let errRes = []
  if (true) {
    events.tasksReceived(
      req.body.tasks,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specTaskAllocated(req, res, next) {
  let errRes = []
  if (validators.isTaskId(req.body.taskId, errRes)) {
    events.taskAllocated(
      req.body.taskId,
      req.body.allocatedId,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

// import Connector from '../connector'

function specStateRequested(req, res, next) {
  let errRes = []
  // Connector.getState(state.serverState.  state.serverState.)
}


function specSessionKilled(req, res, next){
  let errRes = []
  // TODO - only allow session owner to kill , req.reqOwner ===
  if (
    validators.isSession(req.body.session, errRes)
  ){
    events.sessionKilled(
      req.body.session,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specResourcePurged(req, res, next){
  let errRes = []
  if (
    validators.isResourceId(req.body.resourceId, errRes)
  ){
    events.resourcePurged(
      req.body.resourceId,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}


function specResourceCreated(req, res, next){
  let errRes = []
  if (
    validators.isNewResourceId(req.body.resourceId, errRes) &&
    validators.isNotes(req.body.name, errRes) &&
    validators.isAmount(req.body.charged, errRes) &&
    validators.isNotes(req.body.secret, errRes) &&
    validators.isBool(req.body.trackStock, errRes)
  ){
    events.resourceCreated(
      req.body.resourceId,
      req.body.name,
      req.body.charged,
      req.body.secret,
      req.body.trackStock,
			utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specResourceUsed(req, res, next){
  let errRes = []
  console.log('trying to use')


  if (
    validators.isActiveMemberId(req.body.memberId, errRes) &&
    validators.isResourceId(req.body.resourceId, errRes) &&
    validators.isAmount(req.body.amount, errRes) &&
    validators.isAmount(req.body.charged, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    // check member balance
    events.resourceUsed(
      req.body.resourceId,
      req.body.memberId,
      req.body.amount,
      req.body.charged,
      req.body.notes,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
    console.log("failed auth", errRes)
  }
}

function specResourceStocked(req, res, next){
  let errRes = []
  if (
    validators.isResourceId(req.body.resourceId, errRes) &&
    validators.isMemberId(req.body.memberId, errRes) &&
    validators.isAmount(req.body.amount, errRes) &&
    validators.isAmount(req.body.paid, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    events.resourceStocked(
      req.body.resourceId,
      req.body.memberId,
      req.body.amount,
      req.body.paid,
      req.body.notes,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specResourceBooked(req, res, next){
  let errRes = []
  if (
    // validators.isTas(req.body.resourceId, errRes) &&
    validators.isId(req.body.memberId, errRes) &&
    validators.isNotes(req.body.startTs, errRes) &&
    validators.isNotes(req.body.endTs, errRes) &&
    validators.isNotes(req.body.eventType, errRes) &&
    validators.isNotes(req.body.charge, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    events.resourceBooked(
      req.body.resourceId,
      req.body.memberId,
      req.body.startTs,
      req.body.endTs,
      req.body.eventType,
      req.body.charge,
      req.body.notes,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specResourceRemoved(req, res, next){
  let errRes = []
  if (
    validators.isResourceId(req.body.resourceId, errRes)
  ){
    events.resourceRemoved(
      req.body.resourceId,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specMemberFieldUpdated(req, res, next){
  let errRes = []
  if (
    validators.isMemberId(req.body.memberId, errRes) &&
    validators.isField(req.body.field, errRes) &&
    validators.isNotes(req.body.newfield, errRes)
  ){
    events.memberFieldUpdated(
        req.body.memberId,
        req.body.field,
        req.body.newfield,
        utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberCreated(req, res, next){
  let errRes = []
  if (
    validators.isName(req.body.name, errRes) &&
    validators.isFob(req.body.fob, errRes) &&
    validators.isNotes(req.body.secret)
  ){
    events.memberCreated(
      req.body.name,
      req.body.fob,
      req.body.secret,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberPaid(req, res, next){
  let errRes = []
  if (
    validators.isMemberId(req.body.memberId, errRes) &&
    validators.isAmount(req.body.paid, errRes) &&
    validators.isBool(req.body.isCash, errRes) &&
    validators.isNotes(req.body.fob, errRes)
  ){
    events.memberPaid(
      req.body.memberId,
      req.body.paid,
      req.body.isCash,
      req.body.notes,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberCharged(req, res, next){
  let errRes = []
  if (
    validators.isMemberId(req.body.memberId, errRes) &&
    validators.isAmount(req.body.charged, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    events.memberCharged(
      req.body.memberId,
      req.body.charged,
      req.body.notes,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberDeactivated(req, res, next){
  let errRes = []
  if (
    validators.isMemberId(req.body.memberId, errRes)
  ){
    events.memberDeactivated(
      req.body.memberId,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberPurged(req, res, next){
  let errRes = []
  if (
    validators.isMemberId(req.body.memberId, errRes)
  ){
    events.memberPurged(
      req.body.memberId,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberActivated(req, res, next){
  let errRes = []
  if (
    validators.isMemberId(req.body.memberId, errRes)
  ){
    events.memberActivated(
      req.body.memberId,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specBadgeAdded(req, res, next){
    let errRes = []
    if (
      validators.isMemberId(req.body.memberId, errRes) &&
      validators.isNotes( req.body.badge )
    ){
      events.badgeAdded(
        req.body.memberId,
        req.body.badge,
        utils.buildResCallback(res)
      )
    } else {
      res.status(400).send(errRes)
    }
}

function specBadgeRemoved(req, res, next){
    let errRes = []
    if (
      validators.isMemberId(req.body.memberId, errRes) &&
      validators.isNotes( req.body.badge )
    ){
      events.badgeRemoved(
        req.body.memberId,
        req.body.badge,
        utils.buildResCallback(res)
      )
    } else {
      res.status(400).send(errRes)
    }
}

function specBadgeHidden(req, res, next){
    let errRes = []
    if (
      validators.isMemberId(req.body.memberId, errRes) &&
      validators.isNotes( req.body.badge )
    ){
      events.badgeHidden(
        req.body.memberId,
        req.body.badge,
        utils.buildResCallback(res)
      )
    } else {
      res.status(400).send(errRes)
    }
}

function specDogeBarked(req, res, next) {
    let errRes = []
    if (
      validators.isMemberId(req.body.memberId, errRes)
    ){
      events.dogeBarked(
        req.body.memberId,
        utils.buildResCallback(res)
      )
    } else {
      res.status(400).send(errRes)
    }

}

function specDogeMuted(req, res, next) {
    let errRes = []
    if (validators.isMemberId(req.body.memberId, errRes)){
      events.dogeMuted(
        req.body.memberId,
        utils.buildResCallback(res)
      )
    } else {
      res.status(400).send(errRes)
    }

}

function specDogeUnmuted(req, res, next) {
    let errRes = []
    if (validators.isMemberId(req.body.memberId, errRes)){
      events.dogeUnmuted(
        req.body.memberId,
        utils.buildResCallback(res)
      )
    } else {
      res.status(400).send(errRes)
    }
}

function specDogeMigrated(req, res, next){
    let tasks = []
    let memberCard
    let taskIds = []
    state.serverState.tasks.forEach(t => {
        if(t.taskId === req.body.memberId) {
            memberCard = t
        }
        if(t.deck.indexOf(req.body.memberId) >= 0) {
            taskIds.push(t.taskId)
            taskIds = [...taskIds, ...t.subTasks, ...t.priorities, ...t.completed]
        }
    })

    let name = "migrated doge"
    let memberObject = state.serverState.members.some(m => {
        if(m.memberId === req.body.memberId) {
            let name = m.name
        }
    })
    let envelope = Cards.blankCard(name)
    envelope.name = memberCard.name
    envelope.subTasks = [...new Set(taskIds)]
    envelope.passed = [[req.body.address, req.body.toMemberId]]

    tasks = state.serverState.tasks.filter(t => taskIds.indexOf(t.taskId) >= 0)
    tasks.push(envelope)

    let serverAddress
    let serverSecret
    state.serverState.ao.forEach(a => {
        if (a.address === req.body.address) {
            serverAddress = a.address
            serverSecret = a.secret
          }
    })
    console.log("tasks to be sent: ", tasks.length)
    let next100 = tasks.splice(0, 50)
    let delay = 0
    while(next100.length > 0) {
        let newEvent = {
            type: 'tasks-received',
            tasks: next100,
        }
        setTimeout(() => {
            connector.postEvent(serverAddress, serverSecret, newEvent, (err, state) => {
                if (err){
                    return events.aoRelayAttempted(serverAddress, false)
                }
                events.aoRelayAttempted(serverAddress, true)
            })
        }, delay)
        next100 = tasks.splice(0, 50)
        delay += 500
    }
}

function specInvoiceCreated(req, res, next){
  let errRes = []
  if (
    validators.isId(req.body.ownerId, errRes) &&
    validators.isNotes(req.body.memo, errRes) &&
    validators.isAmount(req.body.sats, errRes)
  ){
    if (req.body.r_hash){
        return events.resourceInvoiceCreated(
          req.body.ownerId,
          req.body.r_hash,
          req.body.payment_request,
          req.body.memo,
          req.body.sats,
          utils.buildResCallback(res)
        )
    }

    events.invoiceCreated(
      req.body.ownerId,
      req.body.memo,
      req.body.sats,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specInvoiceRequested(req, res, next){
  let errRes = []
  if (
    validators.isId(req.body.ownerId, errRes) &&
    validators.isNotes(req.body.memo, errRes) &&
    validators.isAmount(req.body.sats, errRes)
  ){
    events.invoiceRequested(
      req.body.ownerId,
      req.body.memo,
      req.body.sats,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specAoNamed(req, res, next){
    let errRes = []
    if (validators.isNotes(req.body.alias, errRes)){
        events.aoNamed(req.body.alias, utils.buildResCallback(res))
    } else {
        res.status(200).send(errRes)
    }
}

function specCashIncreased(req, res, next){
  let errRes = []
  if (
    validators.isAmount(req.body.amount, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    events.cashIncreased(
      req.body.amount,
      req.body.notes,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specCashDecreased(req, res, next){
  let errRes = []
  if (
    validators.isAmount(req.body.amount, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    events.cashDecreased(
      req.body.amount,
      req.body.notes,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specRentSet(req, res, next){
  let errRes = []
  if (
    validators.isAmount(req.body.amount, errRes)
  ){
    events.rentSet(
      req.body.amount,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specCapSet(req, res, next){
  let errRes = []
  if (
    validators.isAmount(req.body.amount, errRes)
  ){
    events.capSet(
      req.body.amount,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specAOSubscribed(req, res, next){
  let errRes = []
  if (
      validators.isNotes(req.body.address, errRes) &&
      validators.isNotes(req.body.secret, errRes)
  ){
    events.aoSubscribed(
      req.body.address,
      req.body.secret,
      utils.buildResCallback(res)
    )
  } else {
      res.status(200).send(errRes)
  }
}

function specAoDisconnected(req, res, next){
    let errRes = []
    if (
      validators.isAddress(req.body.address, errRes)
    ){
      console.log("making disconnected ev")
      events.aoDisconnected(
        req.body.address,
        utils.buildResCallback(res)
      )
    } else {
      res.status(200).send(errRes)
    }
}

function specAOConnect(req, res, next){
  let errRes = []
  console.log('attempt post to ', req.body.address)
  connector.postEvent(req.body.address, req.body.secret, {
      type: 'ao-subscribed',
      address: state.serverState.cash.address,
      secret: req.body.secret, //
  }, (subscriptionResponse) => {
      if (!subscriptionResponse.lastInsertRowid){
          return res.status(200).send(['ao-connect failed'])
      }
      console.log('subscribe success, attempt ao connect')
      events.aoConnected(
        req.body.address,
        req.body.secret,
        utils.buildResCallback(res)
      )
  })
}

function specAoUpdated(req, res, next){
    console.log('attempting update')
    state.serverState.ao.forEach(a => {
        if (a.address === req.body.address){
            console.log("matched address")
            connector.getState(a.address, a.secret, (err, state) => {
                if (err){
                    return events.aoRelayAttempted(a.address, false, utils.buildResCallback(res))
                }
                console.log("adding state for:", {state})
                events.aoUpdated(a.address, state, utils.buildResCallback(res))
            })

        }
    })
}


module.exports = router
