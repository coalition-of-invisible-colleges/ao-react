import { buildResCallback } from './utils'
import events from './events'
import { createHash, hmacHex } from '../crypto'
import state from './state'

const getIdSecret = function(identifier) {
  var ownerId, secret

  try {
    identifier = identifier.toLowerCase()
  } catch (err) {}

  state.serverState.members.forEach(member => {
    let name
    try {
      name = member.name.toLowerCase()
    } catch (err) {}
    if (name === identifier || member.memberId === identifier) {
      ownerId = member.memberId
      secret = member.secret
    }
  })

  state.serverState.resources.forEach(resource => {
    if (resource.name === identifier || resource.resourceId === identifier) {
      ownerId = resource.resourceId
      secret = resource.secret
    }
  })

  return { ownerId, secret }
}
// Used in socketio-auth creation, checks token (https://www.npmjs.com/package/socketio-auth)
export function socketAuth(socket, data, callback) {
  let authorized
  state.serverState.sessions.forEach(session => {
    if (session.token === data.token) {
      authorized = true
    }
  })
  console.log('socket auth triggered:', authorized)
  callback(null, authorized)
}

export function serverAuth(req, res, next) {
  const { ownerId, secret } = getIdSecret(req.headers.name)

  if (secret && req.headers.authorization && req.headers.session) {
    let sessionKey = createHash(req.headers.session + secret)
    let token = hmacHex(req.headers.session, sessionKey)
    if (token === req.headers.authorization) {
      // client able to create the token, must have secret
      events.sessionCreated(
        ownerId,
        req.headers.session,
        token,
        buildResCallback(res)
      )
    } else {
      res.status(401).end('unauthorized')
    }
  } else {
    // otherwise we validate there authorization token in the header
    let authorized = false
    state.serverState.sessions.forEach(session => {
      if (session.token === req.headers.authorization) {
        authorized = true
        req.reqOwner = session.ownerId
      }
    })
    if (authorized) {
      next()
    } else {
      res.status(401).end('unauthorized')
    }
  }
}
