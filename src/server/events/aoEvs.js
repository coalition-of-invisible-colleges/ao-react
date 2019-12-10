import uuidV1 from 'uuid/v1'
import dctrlDb from '../dctrlDb'

function aoSubscribed(address, secret, callback){
    let newEvent = {
        type: "ao-subscribed",
        address,
        secret
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function aoConnected(address, secret, callback) {
    let newEvent = {
        type: "ao-connected",
        address,
        secret,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function aoDisconnected(address, callback) {
    let newEvent = {
        type: "ao-disconnected",
        address,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function aoRelayAttempted(address, successful, callback) {
    let newEvent = {
        type: "ao-relay-attempted",
        address,
        successful
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function aoUpdated(aoId, ev, callback){
    let newEvent = {
        type: "ao-updated",
        aoId,
        ev,
    }
    dctrlDb.triggerShadow(newEvent, callback)
}

function aoNamed(alias, callback){
    let newEvent = {
        type: "ao-named",
        alias,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

export default {
    aoConnected,
    aoDisconnected,
    aoUpdated,
    aoNamed,
    aoSubscribed,
    aoRelayAttempted,
}
