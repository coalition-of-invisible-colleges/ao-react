import { buildResCallback } from './utils.js'
import events from './events.js'
import { createHash, hmacHex } from '../crypto.js'
import state from './state.js'

const getIdSecret = function (identifier) {
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

// This function receives an authentication request and processes it
export function serverAuth(req, res, next) {
    console.log('headers', req.headers)
    console.log('cookies', req.cookies)
    // Firstly, it looks through the server's list of members to see if the username
    // matches an active profile, and returns their secret if it does
  const { ownerId, secret } = getIdSecret(req.headers.name)
  let authorization
  
    // If the user is actively providing a password, use that for authorization.
    // Otherwise, attempt to use an available token in cookies
  const authorization = req.headers.authorization || req.cookies.token

  if (secret && req.headers.session) {
      // If the user is in the list of members (secret)
      // and has initiated a session (doesn't happen on auto-login), then proceed
      // with the creation of a new session.
    let sessionKey = createHash(req.headers.session + secret)
    let token = hmacHex(req.headers.session, sessionKey)
      
      // Go through the same process to create the token and see if it matches the
      // authorization provided
    if (token === authorization) {
      // client able to create the token, must have secret
      res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(253402300000000),
      })
      events.trigger(
        'session-created',
        {
          session: req.headers.session,
          token: token,
          ownerId: ownerId,
        },
        buildResCallback(res)
      )
    } else {
      res.status(401).end('unauthorized')
    }
  } else {
      // If they are not passing a session ID or a username, then we check their
      // authorization against the list of active sessions and look for a match
    let authorized = false
    state.serverState.sessions.forEach(session => {
      if (session.token === authorization) {
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
