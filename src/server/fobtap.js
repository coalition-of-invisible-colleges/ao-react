import express from 'express'
const router = express.Router()

import state from './state.js'
import { memberFromFob, getResource, buildResCallback } from './utils.js'
import events from './events.js'

function access(member, resource) {
  if (member.active < 0) {
    return false
  }
  if (resource.charged == 0) {
    return true
  }
  let newBalance = member.balance - resource.charged
  return newBalance >= 0
}

function resourceCheck(req, res, next) {
  console.log('resourceCheck')
  let member = memberFromFob(req.body.fob)
  let resource = getResource(req.body.resourceId)
  if (member && resource && access(member, resource)) {
    events.resourceUsed(
      req.body.resourceId,
      member.memberId,
      req.body.amount || 1,
      resource.charged || 0,
      req.body.notes || 'D',
      buildResCallback(res)
    )
  } else {
    next()
  }
}

router.use('/fobtap', resourceCheck)

router.use('/fobtap', (req, res) => {
  res.end('fobtap not handled')
})

export default router
