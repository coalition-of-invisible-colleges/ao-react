import utils from './utils'
import validators from './validators'
import events from '../events'

// export single middleware for each type
module.exports = function(req,res,next){
  switch (req.body.type){
      case 'member-created':
           specMemberCreated(req, res, next)
           break
      case 'member-paid':
          specMemberPaid(req, res, next)
          break
      case 'member-charged':
          specMemberCharged(req, res, next)
          break
      case 'member-activated':
          specMemberActivated(req, res, next)
          break
      case 'member-deactivated':
          specMemberDeactivated(req, res, next)
          break
      case 'member-purged':
          specMemberPurged(req, res, next)
          break
      case 'member-address-updated':
          specMemberAddressUpdated(req, res, next)
          break
      case 'member-field-updated':
          specMemberFieldUpdated(req, res, next)
          break
      case 'badge-added':
          specBadgeAdded(req, res, next)
          break
      case 'badge-removed':
          specBadgeRemoved(req, res, next)
          break
      case 'badge-hidden':
          specBadgeHidden(req, res, next)
          break
      case 'doge-barked':
          specDogeBarked(req, res, next)
          break
      case 'doge-muted':
          specDogeMuted(req, res, next)
          break
      case 'doge-unmuted':
          specDogeUnmuted(req, res, next)
          break
      default:
          next()
  }
}

function specMemberAddressUpdated(req, res, next){
  let errRes = []

  if (
    validators.isId(req.body.memberId, errRes)
  ){
    events.membersEvs.memberAddressUpdated(
      req.body.memberId,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberFieldUpdated(req, res, next){
  let errRes = []
  if (
    validators.isMemberId(req.body.memberId, errRes) &&
    validators.isField(req.body.field, errRes) &&
    validators.isNotes(req.body.newfield, errRes)
  ){
    events.membersEvs.memberFieldUpdated(
        req.body.memberId,
        req.body.field,
        req.body.newfield,
        utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberCreated(req, res, next){
  let errRes = []
  if (
    validators.isName(req.body.name, errRes) &&
    validators.isFob(req.body.fob, errRes) &&
    validators.isNotes(req.body.secret)
  ){
    events.membersEvs.memberCreated(
      req.body.name,
      req.body.fob,
      req.body.secret,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberPaid(req, res, next){
  let errRes = []
  if (
    validators.isMemberId(req.body.memberId, errRes) &&
    validators.isAmount(req.body.paid, errRes) &&
    validators.isBool(req.body.isCash, errRes) &&
    validators.isNotes(req.body.fob, errRes)
  ){
    events.membersEvs.memberPaid(
      req.body.memberId,
      req.body.paid,
      req.body.isCash,
      req.body.notes,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberCharged(req, res, next){
  let errRes = []
  if (
    validators.isMemberId(req.body.memberId, errRes) &&
    validators.isAmount(req.body.charged, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    events.membersEvs.memberCharged(
      req.body.memberId,
      req.body.charged,
      req.body.notes,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberDeactivated(req, res, next){
  let errRes = []
  if (
    validators.isMemberId(req.body.memberId, errRes)
  ){
    events.membersEvs.memberDeactivated(
      req.body.memberId,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberPurged(req, res, next){
  let errRes = []
  if (
    validators.isMemberId(req.body.memberId, errRes)
  ){
    events.membersEvs.memberPurged(
      req.body.memberId,
      req.body.blame,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specMemberActivated(req, res, next){
  let errRes = []
  if (
    validators.isMemberId(req.body.memberId, errRes)
  ){
    events.membersEvs.memberActivated(
      req.body.memberId,
      utils.buildResCallback(res)
    )
  } else {
    res.status(400).send(errRes)
  }
}

function specBadgeAdded(req, res, next){
    let errRes = []
    if (
      validators.isMemberId(req.body.memberId, errRes) &&
      validators.isNotes( req.body.badge )
    ){
      events.membersEvs.badgeAdded(
        req.body.memberId,
        req.body.badge,
        utils.buildResCallback(res)
      )
    } else {
      res.status(400).send(errRes)
    }
}

function specBadgeRemoved(req, res, next){
    let errRes = []
    if (
      validators.isMemberId(req.body.memberId, errRes) &&
      validators.isNotes( req.body.badge )
    ){
      events.membersEvs.badgeRemoved(
        req.body.memberId,
        req.body.badge,
        utils.buildResCallback(res)
      )
    } else {
      res.status(400).send(errRes)
    }
}

function specBadgeHidden(req, res, next){
    let errRes = []
    if (
      validators.isMemberId(req.body.memberId, errRes) &&
      validators.isNotes( req.body.badge )
    ){
      events.membersEvs.badgeHidden(
        req.body.memberId,
        req.body.badge,
        utils.buildResCallback(res)
      )
    } else {
      res.status(400).send(errRes)
    }
}

function specDogeBarked(req, res, next) {
    let errRes = []
    if (
      validators.isMemberId(req.body.memberId, errRes)
    ){
      events.membersEvs.dogeBarked(
        req.body.memberId,
        utils.buildResCallback(res)
      )
    } else {
      res.status(400).send(errRes)
    }

}

function specDogeMuted(req, res, next) {
    let errRes = []
    if (validators.isMemberId(req.body.memberId, errRes)){
      events.membersEvs.dogeMuted(
        req.body.memberId,
        utils.buildResCallback(res)
      )
    } else {
      res.status(400).send(errRes)
    }

}

function specDogeUnmuted(req, res, next) {
    let errRes = []
    if (validators.isMemberId(req.body.memberId, errRes)){
      events.membersEvs.dogeUnmuted(
        req.body.memberId,
        utils.buildResCallback(res)
      )
    } else {
      res.status(400).send(errRes)
    }

}