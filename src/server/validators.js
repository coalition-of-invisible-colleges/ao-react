import _ from 'lodash'
import state from './state.js'
import {
  isAheadOf,
  isDecidedlyMorePopularThan,
  isSenpaiOf,
} from '../members.js'

export default {
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
      val === 'name' ||
      val === 'email' ||
      val === 'secret' ||
      val === 'fob' ||
      val === 'draft' ||
      val === 'tutorial' ||
      val === 'phone'
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
  isMemberName(val, errRes) {
    let result = false
    state.serverState.members.forEach(member => {
      if (val === member.name) {
        result = true
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
      // console.log("AO: server/validators.js: isTaskId: ", {val, task})
      if (task.taskId == val) {
        result = true
      }
    })
    if (!result) {
      errRes.push('invalid task')
    }
    // console.log("AO: server/validators.js: isTaskId: ", {result, val, errRes});
    return result
  },
  isTaskId_sane(val, errRes) {
    let result = false
    try {
      let taskName = val.trim().toLowerCase()
      if (taskName === val) result = true
    } catch (erorr) {
      // do nothing
    }
    if (result === false) {
      errRes.push('invalid task id, must be a lower case, trimmed string')
    }
    // console.log("AO: server/validators.js: isTaskId_sane: ", {result, val, errRes})
    return result
  },
  taskIdExists(val, errRes) {
    let result = false
    if (!this.isTaskId_sane(val)) {
      errRes.push('invalid task id')
    } else {
      let taskId = val
      state.serverState.tasks.some(task => {
        if (task.taskId.trim().toLowerCase() === val) {
          result = true
          return true
        }
      })
      if (result === false) {
        errRes.push(
          'AO: server/validators.js: taskIdExists: task not found: ' + val
        )
      }
      // console.log('AO: server/validators.js: taskIdExists: ', {result, val, errRes});
      return result
    }
  },
  isTaskName(val, errRes) {
    let result = false
    state.serverState.tasks.forEach(task => {
      if (
        task.name.trim().localeCompare(val.trim(), undefined, {
          sensitivity: 'base',
        })
      ) {
        result = true
      }
    })
    if (result) {
      errRes.push('invalid task')
    }
    // console.log("AO: server/validators.js: isTaskName: ", {result, val, errRes});
    return !result
  },
  isTaskName_sane(val, errRes) {
    let result = false
    try {
      let taskName = val.trim().toLowerCase()
      if (taskName === val) result = true
    } catch (erorr) {
      // do nothing
    }
    if (result === false) {
      errRes.push('invalid task name, must be a lower case, trimmed string')
    }
    // console.log("AO: server/validators.js: isTaskName_sane: ", {result, val, errRes})
    return result
  },
  taskNameExists(val, errRes) {
    let result = false
    if (!this.isTaskName_sane(val, errRes)) {
      errRes.push('invalid task')
    } else {
      let taskName = val
      state.serverState.tasks.some(task => {
        if (task.name.trim().toLowerCase() === val) {
          result = true
          return true
        }
      })
      if (result === false) {
        errRes.push(
          'AO: server/validators.js: taskNameExists: task not found: ' + val
        )
      }
      // console.log("AO: server/validators.js: taskNameExists: ", {result, val, errRes});
      return result
    }
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
  isAheadOf(senpaiId, kohaiId, errRes) {
    return isAheadOf(senpaiId, kohaiId, state.serverState, errRes)
  },
  isDecidedlyMorePopularThan(senpaiId, kohaiId, errRes) {
    return isDecidedlyMorePopularThan(
      senpaiId,
      kohaiId,
      state.serverState,
      errRes
    )
  },
  isSenpaiOf(senpaiId, kohaiId, errRes) {
    return isSenpaiOf(senpaiId, kohaiId, state.serverState, errRes)
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
  },
}
