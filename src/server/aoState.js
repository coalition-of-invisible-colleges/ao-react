import _ from 'lodash'
import M from '../mutations'
import config from '../../configuration'

import cash from '../modules/cash.js'
import members from '../modules/members.js'
import tasks from '../modules/tasks.js'
import resources from '../modules/resources.js'
import memes from '../modules/memes.js'
import sessions from '../modules/sessions.js'
import ao from '../modules/ao.js'

const modules = { cash, members, tasks, resources, memes, sessions, ao }

function setCurrent(state, b) {
  modules.cash.mutations.setCurrent(state.cash, b)
  modules.tasks.mutations.setCurrent(state.tasks, b)
  modules.sessions.mutations.setCurrent(state.sessions, b)
  modules.ao.mutations.setCurrent(state.ao, b)
  modules.members.mutations.setCurrent(state.members, b)
  modules.resources.mutations.setCurrent(state.resources, b)
}

function applyEvent(state, ev) {
  M.cashMuts(state.cash, ev)
  M.membersMuts(state.members, ev)
  M.resourcesMuts(state.resources, ev)
  M.sessionsMuts(state.sessions, ev)
  M.tasksMuts(state.tasks, ev)
  M.aoMuts(state.ao, ev)
}

function removeSensitive(ev) {
  let secretStuff = [
    'fob',
    'secret',
    'token',
    'email',
    'payment_hash',
    'inboundSecret',
    'outboundSecret',
    'draft',
  ]
  if (ev.type === 'member-field-updated') {
    ;['fob', 'secret', 'email'].forEach(str => {
      if (ev.field === str) {
        secretStuff.push('newfield')
      }
    })
  }
  return _.omit(ev, secretStuff)
}

class AoState {
  constructor(database) {
    this.serverState = {
      ao: [],
      sessions: [],
      members: [],
      tasks: [],
      resources: [],
      cash: {
        address: config.tor.hostname,
        alias: 'dctrl',
        currency: 'CAD',
        spot: 0,
        rent: 0,
        cap: 75,
        pay_index: 0,
        usedTxIds: [],
        outputs: [],
        channels: [],
        info: {},
      },
    }

    this.pubState = {
      ao: [],
      sessions: [],
      members: [],
      tasks: [],
      resources: [],
      cash: {
        address: config.tor.hostname,
        alias: '',
        currency: 'CAD',
        spot: 0,
        rent: 0,
        cap: 75,
        pay_index: 0,
        usedTxIds: [],
        outputs: [],
        channels: [],
        info: {},
      },
    }

    let backup = database.recover()
    if (typeof backup === 'string') {
      return backup
    }
    let ts = 0
    if (backup.length > 0) {
      ts = backup[0].timestamp
      this.applyBackup(backup[0])
    }
    let allEvents = database.getAll(ts)
    if (typeof allEvents === 'string') {
      return callback(allEvents)
    }
    allEvents.forEach(ev => {
      applyEvent(this.serverState, Object.assign({}, ev))
      applyEvent(this.pubState, removeSensitive(Object.assign({}, ev)))
    })
  }

  applyBackup(b) {
    let b1 = Object.assign({}, b)
    setCurrent(this.serverState, b1)
    b.resources = b.resources.map(removeSensitive)
    b.members = b.members.map(removeSensitive)
    b.ao = b.ao.map(removeSensitive)
    b.tasks = b.tasks.map(removeSensitive)
    setCurrent(this.pubState, b)
  }

  backupState(database) {
    database.insertBackup(this.serverState)
  }
}

export default {
  AoState,
  setCurrent,
  applyEvent,
  removeSensitive,
}
