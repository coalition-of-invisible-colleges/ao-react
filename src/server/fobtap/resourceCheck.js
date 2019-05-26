const state = require('../state')
const utils = require('../spec/utils')
const validators = require('../spec/validators')
const events = require('../events')

function access(member, resource){
    if (member.active < 0){
        return false
    }
    if (resource.charged == 0){
        return true
    }
    let limit = member.active * 3 + 17
    let newBalance = member.balance - resource.charged
    let canAccess = (newBalance + limit > 0)
    console.log( {member, resource, limit, newBalance, canAccess} )
    return canAccess
}

module.exports = function(req, res, next){
    let member = utils.memberFromFob(req.body.fob)
    let resource = utils.getResource(req.body.resourceId)
    let canAccess = access(member,resource)
    if (member && resource && canAccess){
        events.resourcesEvs.resourceUsed(
          req.body.resourceId,
          member.memberId,
          req.body.amount || 1,
          resource.charged || 0,
          req.body.notes || '',
          utils.buildResCallback(res)
        )
    } else {
        next()
    }
}
