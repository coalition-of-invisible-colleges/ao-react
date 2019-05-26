const uuidV1 = require('uuid/v1')
const dctrlDb = require('../dctrlDb')

function sessionCreated(ownerId, session, token, callback) {
    let newEvent = {
        type: "session-created",
        session,
        token,
        ownerId
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function sessionKilled(session, callback) {
    let newEvent = {
        type: "session-killed",
        session
    }
    dctrlDb.insertEvent(newEvent, callback)
}

export default {
  sessionCreated,
  sessionKilled
}
