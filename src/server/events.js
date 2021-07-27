import v1 from 'uuid'
import _ from 'lodash'
import crypto from 'crypto'
import state from './state.js'
const serverState = state.serverState
import { insertEvent, triggerShadow } from './dctrlDb.js'

function highlighted(taskId, memberId, valence, callback) {
  let newEvent = {
    type: 'highlighted',
    taskId,
    memberId,
    valence,
  }
  insertEvent(newEvent, callback)
}

function aoInboundConnected(address, secret, callback) {
  let newEvent = {
    type: 'ao-inbound-connected',
    address,
    secret,
  }
  insertEvent(newEvent, callback)
}

function aoLinked(address, taskId, callback) {
  let newEvent = {
    type: 'ao-linked',
    address,
    taskId,
  }
  insertEvent(newEvent, callback)
}

function aoOutboundConnected(address, secret, callback) {
  let newEvent = {
    type: 'ao-outbound-connected',
    address,
    secret,
  }
  insertEvent(newEvent, callback)
}

function aoDisconnected(address, callback) {
  let newEvent = {
    type: 'ao-disconnected',
    address,
  }
  insertEvent(newEvent, callback)
}

function aoNamed(alias, callback) {
  let newEvent = {
    type: 'ao-named',
    alias,
  }
  insertEvent(newEvent, callback)
}

function getNodeInfo(info, callback) {
  let newEvent = {
    type: 'get-node-info',
    info,
  }
  triggerShadow(newEvent)
}

function rentSet(amount, callback) {
  let newEvent = {
    type: 'rent-set',
    amount,
  }
  insertEvent(newEvent, callback)
}

function capSet(amount, callback) {
  let newEvent = {
    type: 'cap-set',
    amount,
  }
  insertEvent(newEvent, callback)
}

function spotUpdated(spot, callback) {
  let newEvent = {
    type: 'spot-updated',
    spot,
  }
  triggerShadow(newEvent)
}

function currencySwitched(currency, callback) {
  let newEvent = {
    type: 'currency-switched',
    currency,
  }
  insertEvent(newEvent, callback)
}

function fundsSet(outputs, channels, callback) {
  let newEvent = {
    type: 'funds-set',
    outputs,
    channels,
  }
  triggerShadow(newEvent)
}

function quorumSet(quorum, callback) {
  let newEvent = {
    type: 'quorum-set',
    quorum: quorum,
  }
  insertEvent(newEvent)
}

function memberCreated(name, fob, secret, callback) {
  let memberId = v1()
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
    lastActivated: 7,
  }
  insertEvent(newEvent, callback)
}

function memberDeactivated(memberId, callback) {
  let newEvent = {
    type: 'member-deactivated',
    memberId,
  }
  insertEvent(newEvent, callback)
}

function memberSecretReset(kohaiId, senpaiId, callback) {
  let newEvent = {
    type: 'member-secret-reset',
    kohaiId,
    senpaiId,
  }
  insertEvent(newEvent, callback)
}

function memberPromoted(kohaiId, senpaiId, callback) {
  let newEvent = {
    type: 'member-promoted',
    kohaiId,
    senpaiId,
  }
  insertEvent(newEvent, callback)
}

function memberBanned(kohaiId, senpaiId, callback) {
  let newEvent = {
    type: 'member-banned',
    kohaiId,
    senpaiId,
  }
  insertEvent(newEvent, callback)
}

function memberUnbanned(kohaiId, senpaiId, callback) {
  let newEvent = {
    type: 'member-unbanned',
    kohaiId,
    senpaiId,
  }
  insertEvent(newEvent, callback)
}

function memberPurged(memberId, blame, callback) {
  let newEvent = {
    type: 'member-purged',
    memberId,
    blame,
  }
  insertEvent(newEvent, callback)
}

function memberActivated(memberId, callback) {
  let newEvent = {
    type: 'member-activated',
    memberId,
  }
  insertEvent(newEvent, callback)
}

function memberFieldUpdated(memberId, field, newfield, callback) {
  let newEvent = {
    type: 'member-field-updated',
    memberId,
    field,
    newfield,
  }
  insertEvent(newEvent, callback)
}

function memberTickerSet(fromCoin, toCoin, index, memberId, callback) {
  let newEvent = {
    type: 'member-ticker-set',
    fromCoin,
    toCoin,
    index,
    memberId,
  }
  insertEvent(newEvent, callback)
}

function dogeBarked(memberId, callback) {
  let newEvent = {
    type: 'doge-barked',
    memberId,
  }
  insertEvent(newEvent, callback)
}

function dogeMuted(memberId, callback) {
  let newEvent = {
    type: 'doge-muted',
    memberId,
  }
  insertEvent(newEvent, callback)
}

function dogeUnmuted(memberId, callback) {
  let newEvent = {
    type: 'doge-unmuted',
    memberId,
  }
  insertEvent(newEvent, callback)
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
    info: {},
  }
  if (trackStock) {
    newEvent.stock = 0
  }
  insertEvent(newEvent, callback)
}

function resourceStocked(resourceId, memberId, amount, paid, notes, callback) {
  let newEvent = {
    type: 'resource-stocked',
    resourceId,
    memberId,
    amount,
    paid,
    notes,
  }
  insertEvent(newEvent, callback)
}

function resourceUsed(resourceId, memberId, amount, charged, notes, callback) {
  let newEvent = {
    type: 'resource-used',
    resourceId,
    memberId,
    amount,
    charged,
    notes,
  }
  insertEvent(newEvent, callback)
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
    notes,
  }
  insertEvent(newEvent, callback)
}

function bookCancelled(resourceId, bookTime, callback) {
  let newEvent = {
    type: 'book-cancelled',
    resourceId,
    bookTime,
  }
  insertEvent(newEvent, callback)
}

function resourcePurged(resourceId, blame, callback) {
  let newEvent = {
    type: 'resource-purged',
    resourceId,
    blame,
  }
  insertEvent(newEvent, callback)
}

function memeAdded(filename, hash, filetype, callback) {
  let newEvent = {
    type: 'meme-added',
    taskId: v1(),
    filename: filename,
    hash: hash,
    filetype: filetype,
  }
  insertEvent(newEvent, callback)
}

function sessionCreated(ownerId, session, token, callback) {
  let newEvent = {
    type: 'session-created',
    session,
    token,
    ownerId,
  }
  insertEvent(newEvent, callback)
}

function sessionKilled(session, callback) {
  let newEvent = {
    type: 'session-killed',
    session,
  }
  insertEvent(newEvent, callback)
}

function taskCreated(name, color, deck, inId, prioritized, callback) {
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
      taskId: v1(),
      lastClaimed: Date.now(),
      name,
      color,
      deck,
      hash,
      inId,
      prioritized,
    }
    insertEvent(newEvent, callback)
  }
}

function addressUpdated(taskId, address, callback) {
  insertEvent(
    {
      type: 'address-updated',
      taskId,
      address,
    },
    callback
  )
}

function taskGuilded(taskId, guild, callback) {
  let newEvent = {
    type: 'task-guilded',
    taskId,
    guild,
  }
  insertEvent(newEvent, callback)
}

function taskGrabbed(taskId, memberId, callback) {
  let newEvent = {
    type: 'task-grabbed',
    taskId,
    memberId,
  }
  insertEvent(newEvent, callback)
}

function pileGrabbed(taskId, memberId, callback) {
  let newEvent = {
    type: 'pile-grabbed',
    taskId,
    memberId,
  }
  insertEvent(newEvent, callback)
}

function pileDropped(taskId, memberId, callback) {
  let newEvent = {
    type: 'pile-dropped',
    taskId,
    memberId,
  }
  insertEvent(newEvent, callback)
}

function taskSubTasked(taskId, subTask, memberId, callback) {
  let newEvent = {
    type: 'task-sub-tasked',
    taskId,
    subTask,
    memberId,
  }
  insertEvent(newEvent, callback)
}

function taskDeSubTasked(taskId, subTask, memberId, callback) {
  let newEvent = {
    type: 'task-de-sub-tasked',
    taskId,
    subTask,
    memberId,
  }
  insertEvent(newEvent, callback)
}

function taskEmptied(taskId, memberId, callback) {
  let newEvent = {
    type: 'task-emptied',
    taskId,
    memberId,
  }
  insertEvent(newEvent, callback)
}

function taskPrioritized(taskId, inId, position, callback) {
  let newEvent = {
    type: 'task-prioritized',
    taskId,
    inId,
    position,
  }
  insertEvent(newEvent, callback)
}

function pilePrioritized(inId, callback) {
  let newEvent = {
    type: 'pile-prioritized',
    inId,
  }
  insertEvent(newEvent, callback)
}

function taskRefocused(taskId, inId, blame, callback) {
  let newEvent = {
    type: 'task-refocused',
    taskId,
    inId,
    blame,
  }
  insertEvent(newEvent, callback)
}

function pileRefocused(inId, blame, callback) {
  let newEvent = {
    type: 'pile-refocused',
    inId,
    blame,
  }
  insertEvent(newEvent, callback)
}

function taskDropped(taskId, memberId, callback) {
  let newEvent = {
    type: 'task-dropped',
    taskId,
    memberId,
  }
  insertEvent(newEvent, callback)
}

function taskPassed(taskId, fromMemberId, toMemberId, callback) {
  let newEvent = {
    type: 'task-passed',
    taskId,
    fromMemberId,
    toMemberId,
  }
  insertEvent(newEvent, callback)
}

function taskPropertySet(taskId, property, value, blame, callback) {
  let newEvent = {
    type: 'task-property-set',
    taskId,
    property,
    value,
    blame,
  }
  insertEvent(newEvent, callback)
}

function taskColored(taskId, inId, color, blame, callback) {
  let newEvent = {
    type: 'task-colored',
    taskId,
    inId,
    color,
    blame,
  }
  insertEvent(newEvent, callback)
}

function taskClaimed(taskId, memberId, blame, callback) {
  let newEvent = {
    type: 'task-claimed',
    taskId,
    memberId,
    blame,
  }
  insertEvent(newEvent, callback)
}

function taskUnclaimed(taskId, memberId, blame, callback) {
  let newEvent = {
    type: 'task-unclaimed',
    taskId,
    memberId,
    blame,
  }
  insertEvent(newEvent, callback)
}

function taskBoosted(taskId, amount, txid, callback) {
  let newEvent = {
    type: 'task-boosted',
    taskId,
    amount,
    txid,
  }
  insertEvent(newEvent, callback)
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
    pay_index,
  }
  insertEvent(newEvent, callback)
}

function tasksRemoved(taskIds, blame, callback) {
  let newEvent = {
    type: 'tasks-removed',
    taskIds,
    blame,
  }
  insertEvent(newEvent, callback)
}

function taskSwapped(taskId, swapId1, swapId2, blame, callback) {
  let newEvent = {
    type: 'task-swapped',
    taskId,
    swapId1,
    swapId2,
    blame,
  }
  insertEvent(newEvent, callback)
}

function taskBumped(taskId, bumpId, direction, blame, callback) {
  let newEvent = {
    type: 'task-bumped',
    taskId,
    bumpId,
    direction,
    blame,
  }
  insertEvent(newEvent, callback)
}

function tasksReceived(tasks, blame, callback) {
  let newEvent = {
    type: 'tasks-received',
    tasks,
    blame,
  }
  insertEvent(newEvent, callback)
}

function invoiceCreated(taskId, bolt11, payment_hash, callback) {
  let newEvent = {
    type: 'invoice-created',
    taskId,
    bolt11,
    payment_hash,
  }
  insertEvent(newEvent, callback)
}

function memberCharged(memberId, charged, notes, callback) {
  let newEvent = {
    type: 'member-charged',
    memberId,
    charged,
    notes,
  }
  insertEvent(newEvent, callback)
}

function taskTimeClocked(taskId, memberId, seconds, date, callback) {
  let newEvent = {
    type: 'task-time-clocked',
    taskId,
    memberId,
    seconds,
    date,
  }
  insertEvent(newEvent, callback)
}

function taskSigned(taskId, memberId, opinion, callback) {
  let newEvent = {
    type: 'task-signed',
    taskId,
    memberId,
    opinion,
  }
  insertEvent(newEvent, callback)
}

function taskSeen(taskId, memberId, callback) {
  let newEvent = {
    type: 'task-seen',
    taskId,
    memberId,
  }
  insertEvent(newEvent, callback)
}

function taskVisited(taskId, memberId, area, callback) {
  let newEvent = {
    type: 'task-visited',
    taskId,
    memberId,
    area,
    timestamp: Date.now(),
  }
  insertEvent(newEvent, callback)
}

function gridCreated(name, height, width, color, deck, callback) {
  let taskId = v1()
  let newEvent = {
    type: 'grid-created',
    taskId,
    name,
    height,
    width,
    color,
    deck,
  }
  insertEvent(newEvent, callback)
}

function gridAdded(taskId, height, width, callback) {
  let newEvent = {
    type: 'grid-added',
    taskId,
    height,
    width,
  }
  insertEvent(newEvent, callback)
}

function gridRemoved(taskId, callback) {
  let newEvent = {
    type: 'grid-removed',
    taskId,
  }
  insertEvent(newEvent, callback)
}

function gridResized(taskId, height, width, callback) {
  let newEvent = { type: 'grid-resized', taskId, height, width }
  insertEvent(newEvent, callback)
}

function gridPin(inId, taskId, x, y, memberId, callback) {
  let newEvent = { type: 'grid-pin', inId, taskId, x, y, memberId }
  insertEvent(newEvent, callback)
}

function gridUnpin(inId, x, y, callback) {
  let newEvent = { type: 'grid-unpin', inId, x, y }
  insertEvent(newEvent, callback)
}

export default {
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
  quorumSet,
  getNodeInfo,
  memberCreated,
  memberDeactivated,
  memberSecretReset,
  memberPromoted,
  memberBanned,
  memberUnbanned,
  memberPurged,
  memberActivated,
  memberFieldUpdated,
  memberTickerSet,
  dogeBarked,
  dogeMuted,
  dogeUnmuted,
  resourceCreated,
  resourceUsed,
  resourceStocked,
  resourceBooked,
  bookCancelled,
  resourcePurged,
  memeAdded,
  sessionCreated,
  sessionKilled,
  taskCreated,
  taskBoosted,
  taskClaimed,
  taskUnclaimed,
  taskRefocused,
  pileRefocused,
  tasksRemoved,
  taskSwapped,
  taskBumped,
  taskGrabbed,
  pileGrabbed,
  pileDropped,
  taskPrioritized,
  pilePrioritized,
  taskDropped,
  taskPassed,
  taskPropertySet,
  taskColored,
  taskGuilded,
  taskSubTasked,
  taskDeSubTasked,
  taskEmptied,
  addressUpdated,
  invoiceCreated,
  taskBoostedLightning,
  tasksReceived,
  taskVisited,
  gridCreated,
  gridAdded,
  gridRemoved,
  gridResized,
  gridPin,
  gridUnpin,
  taskSeen,
  taskTimeClocked,
  taskSigned,
}
