import { importAddress } from '../onChain/bitcoindRpc'

import uuidV1 from 'uuid/v1'
import dctrlDb from '../dctrlDb'

const NESTED_PUBKEY_HASH = 1

function memberCreated(name, fob, secret, callback) {
      let memberId = uuidV1()
      let newEvent = {
          type: "member-created",
          memberId,
          fob,
          name,
          secret,
          active: 1,
          balance: 0,
          badges: [],
          info: {},
          lastActivated: 7
      }
      dctrlDb.insertEvent(newEvent, callback)
}

function memberPaid(memberId, paid, isCash, notes, callback) {
  let newEvent = {
      type: "member-paid",
      memberId,
      paid,
      isCash,
      notes
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberCharged(memberId, charged, notes, callback) {
    let newEvent = {
        type: "member-charged",
        memberId,
        charged,
        notes,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function memberDeactivated(memberId, callback) {
  let newEvent = {
    type: "member-deactivated",
    memberId,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberPurged(memberId, blame, callback) {
  let newEvent = {
    type: "member-purged",
    memberId,
    blame,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberActivated(memberId, callback) {
  let newEvent = {
    type: "member-activated",
    memberId,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberAddressUpdated(memberId, callback){
  // lnd.getClient().newAddress({
  //     type: NESTED_PUBKEY_HASH ,
  // }, (err, response)=>{
  //     if (err) {
  //         return console.log('lnd err', err)
  //     }
  //     let a = response.address
  //     importAddress(a)
  //
  //     let newEvent = {
  //       type: "member-address-updated",
  //       memberId,
  //       address: a,
  //     }
  //
  //     dctrlDb.insertEvent(newEvent, callback)
  // })
}

function memberFieldUpdated(memberId, field, newfield, callback){
  let newEvent = {
    type: "member-field-updated",
    memberId,
    field,
    newfield,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function badgeAdded(memberId, badge, callback) {
  let newEvent = {
      type: "badge-added",
      memberId,
      badge,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function badgeRemoved(memberId, badge, callback) {
  let newEvent = {
      type: "badge-removed",
      memberId,
      badge,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function badgeHidden(memberId, badge, callback) {
    let newEvent = {
        type: "badge-hidden",
        memberId,
        badge,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function dogeBarked(memberId, callback) {
    let newEvent ={
        type: "doge-barked",
        memberId,
    }
    dctrlDb.triggerShadow(newEvent, callback)
}

function dogeMuted(memberId, callback) {
    let newEvent ={
        type: "doge-muted",
        memberId,
    }
    dctrlDb.triggerShadow(newEvent, callback)
}

function dogeUnmuted(memberId, callback) {
    let newEvent ={
        type: "doge-unmuted",
        memberId,
    }
    dctrlDb.triggerShadow(newEvent, callback)
}

export default {
  memberCreated,
  memberPaid,
  memberCharged,
  memberDeactivated,
  memberPurged,
  memberActivated,
  memberAddressUpdated,
  memberFieldUpdated,
  badgeAdded,
  badgeRemoved,
  badgeHidden,
  dogeBarked,
  dogeMuted,
  dogeUnmuted,
}
