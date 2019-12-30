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
    let newBalance = member.balance - resource.charged
    return newBalance >= 0
}

module.exports = function(req, res, next){
    let member = utils.memberFromFob(req.body.fob)
    let resource = utils.getResource(req.body.resourceId)
    if (member && resource && access(member,resource)){
        events.resourcesEvs.resourceUsed(
          req.body.resourceId,
          member.memberId,
          req.body.amount || 1,
          resource.charged || 0,
          req.body.notes || 'D',
          utils.buildResCallback(res)
        )
    } else {
        next()
    }
}
