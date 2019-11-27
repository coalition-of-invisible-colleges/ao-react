import uuidV1 from 'uuid/v1'
import dctrlDb from '../dctrlDb'

function resourceCreated(resourceId, name, charged, secret, trackStock, callback) {
    let newEvent = {
        type: "resource-created",
        resourceId,
        name,
        charged,
        secret,
        info: {},
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
      notes,
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

function resourceRemoved(resourceId, callback) {
  let newEvent = {
      type: 'resource-removed',
      resourceId,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function resourceBooked(resourceId, memberId, startTs, endTs, eventType, charge, notes, callback) {
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
  dctrlDb.insertEvent(newEvent, callback)
}

function bookCancelled(resourceId, bookTime, callback){
  let newEvent = {
      type: 'book-cancelled',
      resourceId,
      bookTime,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function resourcePurged(resourceId, blame, callback) {
  let newEvent = {
    type: "resource-purged",
    resourceId,
    blame,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

export default {
    resourceCreated,
    resourceUsed,
    resourceStocked,
    resourceBooked,
    bookCancelled,
    resourceRemoved,
    resourcePurged,
}
