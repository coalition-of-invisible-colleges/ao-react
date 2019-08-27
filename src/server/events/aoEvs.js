import uuidV1 from 'uuid/v1'
import dctrlDb from '../dctrlDb'

function aoConnected(aoId, location, secret, callback) {
    let newEvent = {
        type: "ao-connected",
        aoId,
        location,
        secret,
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

export default {
    aoConnected,
    aoDisconnected
}
