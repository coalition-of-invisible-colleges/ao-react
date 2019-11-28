
const uuidV1 = require('uuid/v1')
const dctrlDb = require('../dctrlDb')
import crypto from 'crypto'
import { pubState } from '../state'
import { newAddress } from '../lightning'


function taskCreated(name, color, deck, inId, callback) {
  let h = crypto.createHash('sha256')
  h.update(name)
  let hash = h.digest('hex')
  let isExist = false

  pubState.tasks.forEach( t => {
      if (t.hash === hash){
          isExist = true
      }
  })

  if (!isExist){
      let newEvent = {
          type: "task-created",
          taskId: uuidV1(),
          lastClaimed: Date.now(),
          name,
          color,
          deck,
          hash,
          inId,
      }
      dctrlDb.insertEvent(newEvent, callback)
  }
}

function addressUpdated(taskId, address, callback){
      dctrlDb.insertEvent({
          type: "address-updated",
          taskId,
          address,
      }, callback)
}

function taskBountied(taskId, instructions, boost, monthlyValue, cap, oneTime, blame, callback){
    let newEvent = {
        type: "task-bountied",
        taskId,
        instructions,
        boost,
        monthlyValue,
        cap,
        oneTime: !!oneTime,
        blame,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskGuilded(taskId, guild, callback){
    let newEvent = {
        type: "task-guilded",
        taskId,
        guild,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskGrabbed(taskId, memberId, callback){
    let newEvent = {
      type: "task-grabbed",
      taskId,
      memberId,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskSubTasked(taskId, subTask, memberId, callback){
    let newEvent = {
      type: "task-sub-tasked",
      taskId,
      subTask,
      memberId,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskDeSubTasked(taskId, subTask, callback){
    let newEvent = {
      type: "task-de-sub-tasked",
      taskId,
      subTask,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskPrioritized(taskId, inId, callback){
    let newEvent = {
      type: "task-prioritized",
      taskId,
      inId,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskRefocused(taskId, inId, blame, callback) {
  let newEvent = {
    type: "task-refocused",
    taskId,
    inId,
    blame,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskDropped(taskId, memberId, callback){
    let newEvent = {
      type: "task-dropped",
      taskId,
      memberId,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskPassed(taskId, fromMemberId, toMemberId, callback){
    let newEvent = {
      type: "task-passed",
      taskId,
      fromMemberId,
      toMemberId,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskClaimed(taskId, memberId, paid, notes, blame, callback) {
  let newEvent = {
    type: "task-claimed",
    taskId,
    memberId,
    paid,
    notes,
    blame,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskUnclaimed(taskId, memberId, blame, callback) {
  let newEvent = {
    type: "task-unclaimed",
    taskId,
    memberId,
    blame,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskBoosted(taskId, amount, txid, callback) {
  let newEvent = {
      type: "task-boosted",
      taskId,
      amount,
      txid,
  }
  dctrlDb.insertEvent(newEvent, callback)
}


function taskBoostedLightning(taskId, amount, payment_hash, pay_index, callback) {
  let newEvent = {
      type: "task-boosted-lightning",
      taskId,
      amount,
      payment_hash,
      pay_index,
  }
  dctrlDb.insertEvent(newEvent, callback)
}


function taskRateUpdated(taskId, amount, blame, callback) {
  let newEvent = {
    type: "task-rate-updated",
    taskId,
    amount,
    blame,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskCapUpdated(taskId, amount, blame, callback) {
  let newEvent = {
    type: "task-cap-updated",
    taskId,
    amount,
    blame,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskInstructionsUpdated(taskId, newInstructions, blame, callback){
  let newEvent = {
    type: "task-instructions-updated",
    taskId,
    newInstructions,
    blame,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskRemoved(taskId, blame, callback){
  let newEvent = {
    type: "task-removed",
    taskId,
    blame,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskSwapped(taskId, swapId1, swapId2, blame, callback){
  let newEvent = {
    type: "task-swapped",
    taskId,
    swapId1,
    swapId2,
    blame,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function tasksReceived(tasks, blame, callback) {
  let newEvent = {
    type: "tasks-received",
    tasks,
    blame,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskAllocated(taskId, allocatedId, memberId, callback) {
  let newEvent = {
     type: "task-allocated",
     taskId,
     allocatedId,
     memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function invoiceCreated(taskId, bolt11, payment_hash, callback){
    let newEvent = {
        type: "invoice-created",
        taskId,
        bolt11,
        payment_hash,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

export default {
  taskCreated,
  taskBountied,
  taskBoosted,
  taskClaimed,
  taskUnclaimed,
  taskRefocused,
  taskInstructionsUpdated,
  taskRateUpdated,
  taskCapUpdated,
  taskRemoved,
  taskSwapped,
  taskGrabbed,
  taskPrioritized,
  taskDropped,
  taskPassed,
  taskGuilded,
  taskSubTasked,
  taskDeSubTasked,
  taskAllocated,
  addressUpdated,
  invoiceCreated,
  taskBoostedLightning,
}
