import utils from './utils'
import validators from './validators'
import events from '../events'
import Connector from '../connector'

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
      case 'doge-migrated':
          specDogeMigrated(req, res, next)
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

// function specDogeMigrated(req, res, next) {
//     let errRes = []
//     if (validators.isMemberId(req.body.memberId, errRes)){
//       state.serverState.ao.forEach(a => {
//           if (a.address === req.body.address){
//                 found = []
//                 let crawler = []
//                 state.tasks.forEach(t => {
//                     if(t.deck.indexOf(req.body.memberId) > -1) {
//                         crawler.push(t.taskId)
//                     }
//                 })
//                 let newCards = []
//                 do {
//                     newCards = []
//                     crawler = _.filter(crawler, t => {
//                         if(found.some(t2 => {
//                             if(!t2 || !t2.taskId) return false
//                             return t2.taskId === t
//                         })) {
//                             return false
//                         }
//                         let task = this.$store.getters.hashMap[t]
//                         if(task === undefined || task.subTasks === undefined || task.priorities === undefined || task.completed === undefined) return false

//                         found.push(Cards.safeClone(task))
//                         newCards = newCards.concat(task.subTasks, task.priorities, task.completed)
//                         return true
//                     })
//                     crawler = newCards
//                 } while(crawler.length > 0)

//                 let envelope = Cards.safeClone(this.$store.getters.memberCard)
//                 envelope.name = this.$store.getters.member.name
//                 envelope.subTasks = found
//                 found.splice(0, 0, envelope)
                
//                 found[0].passed = [[this.$store.state.cash.address, this.toMemberWarp, this.$store.getters.member.memberId]]
//                 console.log("found is ", found)
//                 if(found.length > 20) {
//                     let next100 = found.splice(0, 20)
//                     while(next100.length > 0) {
//                         console.log("next100 is ", next100)
//                         this.$store.dispatch('makeEvent', {
//                             type: 'ao-relay',
//                             address: this.$store.getters.warpDrive.address,
//                             ev: {
//                                 type: 'tasks-received',
//                                 tasks: next100,
//                             }
//                         })
//                         next100 = found.splice(0, 20)
//                     }
//                 } else {
//                     this.$store.dispatch('makeEvent', {
//                         type: 'ao-relay',
//                         address: this.$store.getters.warpDrive.address,
//                         ev: {
//                             type: 'tasks-received',
//                             tasks: found,
//                         }
//                     })
//                 }

//               connector.postEvent(a.address, a.secret, req.body, (err, state) => {
//                   if (err){
//                       return events.aoEvs.aoRelayAttempted(a.address, false, utils.buildResCallback(res))
//                   }
//                   console.log("adding state for:", {state})
//                   events.aoEvs.aoUpdated(a.address, state, utils.buildResCallback(res))
//               })

//           }
//       })
//       events.membersEvs.dogeMigrated(
//         req.body.memberId,
//         utils.buildResCallback(res)
//       )
//     } else {
//       res.status(400).send(errRes)
//     }
// }