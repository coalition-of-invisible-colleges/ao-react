import { insertEvent, triggerShadow } from './dctrlDb.js'

function trigger(type, eventData, callback) {
  let newEvent = {type, ...eventData}
  insertEvent(newEvent, callback)
}

function triggerShadowPlease(type, eventData, callback) {
  let newEvent = {type, ...eventData}
  triggerShadow(newEvent)
  callback() // db call is synchronous (?) so just do it here I guess
}

function getNodeInfo(info, callback) {
  let newEvent = {
    type: 'get-node-info',
    info,
  }
  triggerShadow(newEvent)
}

export default {
  triggerShadowPlease,
  trigger,
  getNodeInfo,
}
