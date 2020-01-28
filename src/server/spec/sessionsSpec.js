const utils = require( './utils')
const validators = require( './validators')
const events = require( '../events')

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
    events.sessionKilled(
      req.body.session,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}
