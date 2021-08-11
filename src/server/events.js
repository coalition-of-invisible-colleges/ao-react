import { insertEvent, triggerShadow } from './dctrlDb.js'

function trigger(type, eventData, callback) {
  let newEvent = { type, ...eventData }
  insertEvent(newEvent, callback)
}

function getNodeInfo(info, callback) {
  let newEvent = {
    type: 'get-node-info',
    info,
  }
  triggerShadow(newEvent)
}

export default {
  trigger,
  getNodeInfo,
}
