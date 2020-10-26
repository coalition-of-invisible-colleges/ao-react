const _ = require('lodash')
const state = require('./state')

module.exports = {
  isAmount(val, errRes) {
    let parsed = parseFloat(val)
    if (parsed !== 0 && !parsed) {
      errRes.push('amount must be a number')
      return false
    }
    if (parsed < 0) {
      errRes.push('amount must be positive')
      return false
    }
    return true
  },
  isField(val, errRes) {
    let isField =
      val === 'name' || val === 'email' || val === 'secret' || val === 'fob'
    if (!isField) {
      errRes.push('invalid field')
      return false
    }
    return isField
  },
  isAddress(val, errRes) {
    let result = false
    state.serverState.ao.forEach(ao => {
      if (val === ao.address) {
        result = true
      }
    })
    if (!result) {
      errRes.push('invalid address')
    }
    return result
  },
  isMemberId(val, errRes) {
    let result = false
    let result2 = false
    state.serverState.members.forEach(member => {
      if (val === member.memberId) {
        result = true
      }
    })
    state.serverState.tasks.forEach(task => {
      if (val === task.taskId) {
        result2 = true
      }
    })

    if (!result || !result2) {
      errRes.push('invalid member')
    }
    return result
  },
  isActiveMemberId(val, errRes) {
    let result = false
    state.serverState.members.forEach(member => {
      if (val === member.memberId && member.active >= 0) {
        result = true
      }
    })
    if (!result) {
      errRes.push('invalid member')
    }
    return result
  },
  isTaskId(val, errRes) {
    let result = false
    state.serverState.tasks.forEach(task => {
      if (task.taskId == val) {
        result = true
      }
    })
    if (!result) {
      errRes.push('invalid task')
    }
    return result
  },
  isSession(val, errRes) {
    let result = false
    state.serverState.sessions.forEach(s => {
      if (val === s.session) {
        result = true
      }
    })
    if (!result) {
      errRes.push('invalid session')
    }
    return result
  },
  isResourceId(val, errRes) {
    let result = false
    state.serverState.resources.forEach(resource => {
      if (val === resource.resourceId) {
        result = true
      }
    })
    if (!result) {
      errRes.push('invalid resource')
    }
    return result
  },
  isNewResourceId(val, errRes) {
    let isNew = true
    state.serverState.resources.forEach(resource => {
      if (val == resource.resourceId) {
        isNew = false
      }
    })
    if (!isNew) {
      errRes.push('resourceId exists')
    }
    return isNew
  },
  isBool(val, errRes) {
    let isBool = typeof val === 'boolean'
    if (!isBool) {
      errRes.push('field requires boolean')
    }
    return isBool
  },
  isNotes(val, errRes) {
    return true
  },
  isCoord(val, errRes) {
    let result = true
    const lbx = 0
    const lby = 0
    const ubx = 16
    const uby = 16

    let bx = lbx <= val.x && val.x <= ubx
    let by = lby <= val.y && val.y <= uby
    if (!(by && bx) && Number.isInteger(val.x) && Number.isInteger(val.y)) {
      result = false
      // errRes.push("invalid grid coord");
    }
    return result
  },
  isColor(val, errRes) {
    let colors = ['red', 'yellow', 'green', 'purple', 'blue']
    return colors.indexOf(val) >= 0
  },
  isSenpaiOf(senpaiId, kohaiId, errRes) {
    const senpaiCard = state.serverState.tasks.find(t => t.taskId === senpaiId)
    if (!senpaiCard) {
      errRes.push('invalid member detected')
      return false
    }
    const kohaiCard = state.serverState.tasks.find(t => t.taskId === kohaiId)
    if (!kohaiCard) {
      errRes.push('invalid member detected')
      return false
    }

    const senpaiVouches = senpaiCard.deck
      .map(mId => state.serverState.tasks.find(t => t.taskId === mId))
      .filter(memberCard => memberCard !== undefined).length

    const kohaiVouches = kohaiCard.deck
      .map(mId => state.serverState.tasks.find(t => t.taskId === mId))
      .filter(memberCard => memberCard !== undefined).length

    let senpaiRank = state.serverState.members.findIndex(
      m => m.memberId === senpaiId
    )
    let kohaiRank = state.serverState.members.findIndex(
      m => m.memberId === kohaiId
    )

    if (senpaiRank < kohaiRank && senpaiVouches > kohaiVouches) {
      return true
    }

    errRes.push('member is not a senpai of the other member')
    return false
  },
  hasBanOn(senpaiId, kohaiId, errRes) {
    const kohai = state.serverState.members.find(t => t.memberId === kohaiId)
    if (!kohai) {
      console.log('invalid member detected')
      errRes.push('invalid member detected')
      return false
    }
    if (!kohai.hasOwnProperty('potentials')) {
      console.log('no ban to remove')

      errRes.push('no ban exists to remove')
      return false
    }
    console.log('will return true if it finds it now')

    return kohai.potentials.some(
      pot => pot.memberId === senpaiId && pot.opinion === 'member-banned'
    )
  }
}
