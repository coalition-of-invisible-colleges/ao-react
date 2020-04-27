const uuidV1 = require('uuid/v1')
const _ = require('lodash')
const crypto = require('crypto')

const { serverState } = require('./state')
const dctrlDb = require('./dctrlDb')

function highlighted(taskId, memberId, valence, callback) {
  let newEvent = {
    type: 'highlighted',
    taskId,
    memberId,
    valence
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function aoInboundConnected(address, secret, callback) {
  let newEvent = {
    type: 'ao-inbound-connected',
    address,
    secret
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function aoLinked(address, taskId, callback) {
  let newEvent = {
    type: 'ao-linked',
    address,
    taskId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function aoOutboundConnected(address, secret, callback) {
  let newEvent = {
    type: 'ao-outbound-connected',
    address,
    secret
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function aoDisconnected(address, callback) {
  let newEvent = {
    type: 'ao-disconnected',
    address
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function aoNamed(alias, callback) {
  let newEvent = {
    type: 'ao-named',
    alias
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function getNodeInfo(info, callback) {
  let newEvent = {
    type: 'get-node-info',
    info
  }
  dctrlDb.triggerShadow(newEvent)
}

function rentSet(amount, callback) {
  let newEvent = {
    type: 'rent-set',
    amount
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function capSet(amount, callback) {
  let newEvent = {
    type: 'cap-set',
    amount
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function spotUpdated(spot, callback) {
  let newEvent = {
    type: 'spot-updated',
    spot
  }
  dctrlDb.triggerShadow(newEvent)
}

function currencySwitched(currency, callback) {
  let newEvent = {
    type: 'currency-switched',
    currency
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function fundsSet(outputs, channels, callback) {
  let newEvent = {
    type: 'funds-set',
    outputs,
    channels
  }
  dctrlDb.triggerShadow(newEvent)
}

function memberCreated(name, fob, secret, callback) {
  let memberId = uuidV1()
  let newEvent = {
    type: 'member-created',
    memberId,
    fob,
    name,
    secret,
    active: 1,
    balance: 0,
    badges: [],
    info: {},
    lastActivated: 7
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberDeactivated(memberId, callback) {
  let newEvent = {
    type: 'member-deactivated',
    memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberPurged(memberId, blame, callback) {
  let newEvent = {
    type: 'member-purged',
    memberId,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberActivated(memberId, callback) {
  let newEvent = {
    type: 'member-activated',
    memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberFieldUpdated(memberId, field, newfield, callback) {
  let newEvent = {
    type: 'member-field-updated',
    memberId,
    field,
    newfield
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function dogeBarked(memberId, callback) {
  let newEvent = {
    type: 'doge-barked',
    memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function dogeMuted(memberId, callback) {
  let newEvent = {
    type: 'doge-muted',
    memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function dogeUnmuted(memberId, callback) {
  let newEvent = {
    type: 'doge-unmuted',
    memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function resourceCreated(
  resourceId,
  name,
  charged,
  secret,
  trackStock,
  callback
) {
  let newEvent = {
    type: 'resource-created',
    resourceId,
    name,
    charged,
    secret,
    info: {}
  }
  if (trackStock) {
    newEvent.stock = 0
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function resourceStocked(resourceId, memberId, amount, paid, notes, callback) {
  let newEvent = {
    type: 'resource-stocked',
    resourceId,
    memberId,
    amount,
    paid,
    notes
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function resourceUsed(resourceId, memberId, amount, charged, notes, callback) {
  let newEvent = {
    type: 'resource-used',
    resourceId,
    memberId,
    amount,
    charged,
    notes
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function resourceBooked(
  resourceId,
  memberId,
  startTs,
  endTs,
  eventType,
  charge,
  notes,
  callback
) {
  let newEvent = {
    type: 'resource-booked',
    resourceId,
    memberId,
    startTs,
    endTs,
    eventType,
    charge,
    notes
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function bookCancelled(resourceId, bookTime, callback) {
  let newEvent = {
    type: 'book-cancelled',
    resourceId,
    bookTime
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function resourcePurged(resourceId, blame, callback) {
  let newEvent = {
    type: 'resource-purged',
    resourceId,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function sessionCreated(ownerId, session, token, callback) {
  let newEvent = {
    type: 'session-created',
    session,
    token,
    ownerId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function sessionKilled(session, callback) {
  let newEvent = {
    type: 'session-killed',
    session
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskCreated(name, color, deck, inId, callback) {
  let h = crypto.createHash('sha256')
  h.update(name)
  let hash = h.digest('hex')
  let isExist = false

  serverState.tasks.forEach(t => {
    if (t.hash === hash) {
      isExist = true
    }
  })

  if (!isExist) {
    let newEvent = {
      type: 'task-created',
      taskId: uuidV1(),
      lastClaimed: Date.now(),
      name,
      color,
      deck,
      hash,
      inId
    }
    dctrlDb.insertEvent(newEvent, callback)
  }
}

function addressUpdated(taskId, address, callback) {
  dctrlDb.insertEvent(
    {
      type: 'address-updated',
      taskId,
      address
    },
    callback
  )
}

function taskGuilded(taskId, guild, callback) {
  let newEvent = {
    type: 'task-guilded',
    taskId,
    guild
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskGrabbed(taskId, memberId, callback) {
  let newEvent = {
    type: 'task-grabbed',
    taskId,
    memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function pileGrabbed(taskId, memberId, callback) {
  let newEvent = {
    type: 'pile-grabbed',
    taskId,
    memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function pileDropped(taskId, memberId, callback) {
  let newEvent = {
    type: 'pile-dropped',
    taskId,
    memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskSubTasked(taskId, subTask, memberId, callback) {
  let newEvent = {
    type: 'task-sub-tasked',
    taskId,
    subTask,
    memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskDeSubTasked(taskId, subTask, memberId, callback) {
  let newEvent = {
    type: 'task-de-sub-tasked',
    taskId,
    subTask,
    memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskPrioritized(taskId, inId, callback) {
  let newEvent = {
    type: 'task-prioritized',
    taskId,
    inId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function pilePrioritized(inId, callback) {
  let newEvent = {
    type: 'pile-prioritized',
    inId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskRefocused(taskId, inId, blame, callback) {
  let newEvent = {
    type: 'task-refocused',
    taskId,
    inId,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function pileRefocused(inId, blame, callback) {
  let newEvent = {
    type: 'pile-refocused',
    inId,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskDropped(taskId, memberId, callback) {
  let newEvent = {
    type: 'task-dropped',
    taskId,
    memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskPassed(taskId, fromMemberId, toMemberId, callback) {
  let newEvent = {
    type: 'task-passed',
    taskId,
    fromMemberId,
    toMemberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskValued(taskId, value, blame, callback) {
  let newEvent = {
    type: 'task-valued',
    taskId,
    value,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskColored(taskId, inId, color, blame, callback) {
  let newEvent = {
    type: 'task-colored',
    taskId,
    inId,
    color,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskClaimed(taskId, memberId, blame, callback) {
  let newEvent = {
    type: 'task-claimed',
    taskId,
    memberId,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskUnclaimed(taskId, memberId, blame, callback) {
  let newEvent = {
    type: 'task-unclaimed',
    taskId,
    memberId,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskBoosted(taskId, amount, txid, callback) {
  let newEvent = {
    type: 'task-boosted',
    taskId,
    amount,
    txid
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskBoostedLightning(
  taskId,
  amount,
  payment_hash,
  pay_index,
  callback
) {
  let newEvent = {
    type: 'task-boosted-lightning',
    taskId,
    amount,
    payment_hash,
    pay_index
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskRemoved(taskId, blame, callback) {
  let newEvent = {
    type: 'task-removed',
    taskId,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskSwapped(taskId, swapId1, swapId2, blame, callback) {
  let newEvent = {
    type: 'task-swapped',
    taskId,
    swapId1,
    swapId2,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskBumped(taskId, bumpId, direction, blame, callback) {
  let newEvent = {
    type: 'task-bumped',
    taskId,
    bumpId,
    direction,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function tasksReceived(tasks, blame, callback) {
  let newEvent = {
    type: 'tasks-received',
    tasks,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function invoiceCreated(taskId, bolt11, payment_hash, callback) {
  let newEvent = {
    type: 'invoice-created',
    taskId,
    bolt11,
    payment_hash
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberCharged(memberId, charged, notes, callback) {
  let newEvent = {
    type: 'member-charged',
    memberId,
    charged,
    notes
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskTimeClocked(taskId, memberId, seconds, date, callback) {
  console.log('taskTimeClocked EVENTS')
  let newEvent = {
    type: 'task-time-clocked',
    taskId,
    memberId,
    seconds,
    date
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskSeen(taskId, memberId, callback) {
  console.log('EVENTS fire')

  let newEvent = {
    type: 'task-seen',
    taskId,
    memberId
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function gridCreated(name, height, width, color, deck, callback) {
  console.log('grid-created event pre')

  let taskId = uuidV1()
  let newEvent = {
    type: 'grid-created',
    taskId,
    name,
    height,
    width,
    color,
    deck
  }
  dctrlDb.insertEvent(newEvent, callback)
  console.log('grid-created event post')
}

function gridAdded(taskId, height, width, callback) {
  console.log('grid-added event pre')

  let newEvent = {
    type: 'grid-added',
    taskId,
    height,
    width
  }
  dctrlDb.insertEvent(newEvent, callback)
  console.log('grid-added event post')
}

function gridResized(taskId, height, width, callback) {
  let newEvent = { type: 'grid-resized', taskId, height, width }
  dctrlDb.insertEvent(newEvent, callback)
}

function gridPin(inId, taskId, x, y, callback) {
  console.log('grid-pin event pre')

  let newEvent = { type: 'grid-pin', inId, taskId, x, y }
  dctrlDb.insertEvent(newEvent, callback)
  console.log('grid-pin event pre')
}

function gridUnpin(inId, x, y, callback) {
  let newEvent = { type: 'grid-unpin', inId, x, y }
  dctrlDb.insertEvent(newEvent, callback)
}

module.exports = {
  highlighted,
  memberCharged,
  aoInboundConnected,
  aoLinked,
  aoOutboundConnected,
  aoDisconnected,
  aoNamed,
  spotUpdated,
  rentSet,
  capSet,
  fundsSet,
  getNodeInfo,
  memberCreated,
  memberDeactivated,
  memberPurged,
  memberActivated,
  memberFieldUpdated,
  dogeBarked,
  dogeMuted,
  dogeUnmuted,
  resourceCreated,
  resourceUsed,
  resourceStocked,
  resourceBooked,
  bookCancelled,
  resourcePurged,
  sessionCreated,
  sessionKilled,
  taskCreated,
  taskBoosted,
  taskClaimed,
  taskUnclaimed,
  taskRefocused,
  pileRefocused,
  taskRemoved,
  taskSwapped,
  taskBumped,
  taskGrabbed,
  pileGrabbed,
  pileDropped,
  taskPrioritized,
  pilePrioritized,
  taskDropped,
  taskPassed,
  taskValued,
  taskColored,
  taskGuilded,
  taskSubTasked,
  taskDeSubTasked,
  addressUpdated,
  invoiceCreated,
  taskBoostedLightning,
  tasksReceived,
  gridCreated,
  gridAdded,
  gridResized,
  gridPin,
  gridUnpin,
  taskSeen,
  taskTimeClocked
}
