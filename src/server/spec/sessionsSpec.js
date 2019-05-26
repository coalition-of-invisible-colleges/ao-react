import utils from './utils'
import validators from './validators'
import events from '../events'

// export single middleware for each type
module.exports = function(req,res, next){
  switch (req.body.type){
      case 'session-killed':
          specSessionKilled(req, res, next)
          break
      default:
          next()
  }
}

function specSessionKilled(req, res, next){
  let errRes = []
  // TODO - only allow session owner to kill , req.reqOwner ===
  if (
    validators.isSession(req.body.session, errRes)
  ){
    events.sessionsEvs.sessionKilled(
      req.body.session,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}
