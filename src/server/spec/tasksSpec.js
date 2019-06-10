import utils from './utils'
import uuidV1 from 'uuid/v1'

import validators from './validators'
import events from '../events'
import state from '../state'
import calculations from '../../calculations'
import lightning from '../lightning'

module.exports = function(req,res, next){
  switch (req.body.type){
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
      case 'task-refocused':
          specTaskRefocused(req, res, next)
          break
      // case 'task-boosted':
      //     specTaskBoosted(req, res, next)
      // break
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
      case 'task-dropped':
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
      default:
          next()
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
                events.tasksEvs.invoiceCreated(req.body.taskId, result.bolt11, result.payment_hash, utils.buildResCallback(res))
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
                events.tasksEvs.addressUpdated(req.body.taskId, addr, utils.buildResCallback(res))
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
    events.tasksEvs.taskGuilded(
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
    events.tasksEvs.taskSubTasked(
      req.body.taskId,
      req.body.subTask,
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
    events.tasksEvs.taskDeSubTasked(
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
    validators.isNotes(req.body.deck, errRes)
  ){
    events.tasksEvs.taskCreated(
      req.body.name,
      req.body.color,
      req.body.deck,
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
    events.tasksEvs.taskBountied(
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
    events.tasksEvs.taskPassed(
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
    if (task.taskId == req.body.taskId){
        paid = calculations.calculateTaskPayout(task)
    }
  })
  if (
    validators.isTaskId(req.body.taskId, errRes) &&
    validators.isTaskId(req.body.inId, errRes) &&
    validators.isMemberId(req.body.memberId, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    events.tasksEvs.taskClaimed(
      req.body.taskId,
      req.body.memberId,
      req.body.inId,
      paid,
      req.body.notes,
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
    events.tasksEvs.taskPrioritized(
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
    events.tasksEvs.taskRefocused(
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
    events.tasksEvs.taskCapUpdated(
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
    events.tasksEvs.taskRateUpdated(
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
    events.tasksEvs.taskInstructionsUpdated(
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
//     events.tasksEvs.taskBoosted(
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
    events.tasksEvs.taskRemoved(
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
    validators.isMemberId(req.body.memberId, errRes)
  ){
      switch (req.body.type) {
          case 'task-grabbed':
              events.tasksEvs.taskGrabbed(
                req.body.taskId,
                req.body.memberId,
                utils.buildResCallback(res)
              )
              break
          case 'task-dropped':
              events.tasksEvs.taskDropped(
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
    events.tasksEvs.taskSwapped(
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

function specTaskAllocated(req, res, next) {
  let errRes = []
  if (validators.isTaskId(req.body.taskId, errRes)) {
    events.tasksEvs.taskAllocated(
      req.body.taskId,
      req.body.allocatedId,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}
