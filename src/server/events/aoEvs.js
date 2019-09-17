import uuidV1 from 'uuid/v1'
import dctrlDb from '../dctrlDb'

function aoConnected(address, secret, state, callback) {
    let newEvent = {
        type: "ao-connected",
        address,
        secret,
        state,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function aoDisconnected(aoId, callback) {
    let newEvent = {
        type: "ao-disconnected",
        aoId,
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


export default {
    aoConnected,
    aoDisconnected,
    aoUpdated,
}
