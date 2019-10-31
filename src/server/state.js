import _ from 'lodash'
import dctrlDb from './dctrlDb'
import M from '../mutations'
import modules from '../modules'
import config from '../../configuration'

const serverState = {
  ao: [],
  sessions: [],
  members: [],
  tasks: [],
  resources: [],
  cash: {
    subscribed: [],
    address: config.tor.hostname,
    alias: '',
    currency: 'CAD',
    cash: 0,
    spot: 0,
    rent: 0,
    variable: 0,
    cap: 75,
    pay_index: 0,
    usedTxIds: [],
    outputs: [],
    channels: [],
    info: {},
  },
}

const pubState = {
  ao: [],
  sessions: [],
  members: [],
  tasks: [],
  resources: [],
  cash: {
    subscribed: [],
    address: config.tor.hostname,
    alias: '',
    currency: 'CAD',
    cash: 0,
    spot: 0,
    rent: 0,
    variable: 0,
    cap: 75,
    pay_index: 0,
    usedTxIds: [],
    outputs: [],
    channels: [],
    info: {},
  },
}

function setCurrent(state, b){
    modules.cash.mutations.setCurrent(state.cash, b)
    modules.tasks.mutations.setCurrent(state.tasks, b)
    modules.sessions.mutations.setCurrent(state.sessions, b)
    modules.ao.mutations.setCurrent(state.ao, b)
    modules.members.mutations.setCurrent(state.members, b)
    modules.resources.mutations.setCurrent(state.resources, b)
}

function applyBackup(b){
    let b1 = Object.assign({}, b)
    let b2 = Object.assign({}, b)
    setCurrent(serverState, b1)
    b.resources = b2.resources.map(removeSensitive)
    b.members = b2.members.map(removeSensitive)
    b.ao = b2.ao.map(removeSensitive)
    setCurrent(pubState, b2)
}

function applyEvent(state, ev) {
      M.cashMuts(state.cash, ev)
      M.membersMuts(state.members, ev)
      M.resourcesMuts(state.resources, ev)
      M.sessionsMuts(state.sessions, ev)
      M.tasksMuts(state.tasks, ev)
      M.aoMuts(state.ao, ev)
}

function initialize(callback) {
    dctrlDb.recover((err, backup) => {
          let ts = 0
          if (backup.length > 0){
              console.log( backup[0].members.length, " members in backup")
              console.log( backup[0].tasks.length, " task in backup")
              console.log( backup[0].resources.length, " resources in backup")
              ts = backup[0].timestamp
              let knownMIds = []
              let knownTIds = []
              let knownRIds = []
              backup[0].members = backup[0].members.filter(m => {
                  if (knownMIds.indexOf(m.memberId) === -1){
                      knownMIds.push(m.memberId)
                      return true
                  }
              })
              backup[0].tasks = backup[0].tasks.filter(t => {
                  if (knownTIds.indexOf(t.taskId) === -1){
                      knownTIds.push(t.taskId)
                      return true
                  }
              })
              backup[0].resources = backup[0].resources.filter(r => {
                  if (knownRIds.indexOf(r.resourceId) === -1){
                      knownRIds.push(r.resourceId)
                      return true
                  }
              })
              console.log( backup[0].members.length, " members in backup after dedup")
              console.log( backup[0].tasks.length, " tasks in backup after dedup")
              console.log( backup[0].resources.length, " resources in backup after dedup")
              applyBackup(backup[0])
          }
          dctrlDb.getAll(ts, (err, all) => {
              if (err) return callback(err)

              all.forEach( ev => {
                  applyEvent(serverState, Object.assign({}, ev) )
                  applyEvent(pubState, removeSensitive( Object.assign({}, ev) ))
              })

              applyEvent(serverState, {type: 'cleanup'})
              applyEvent(pubState, {type: 'cleanup'})

              callback(null)
          })
    })
}

function backupState(){
    dctrlDb.insertBackup(serverState)
}

function removeSensitive(ev){
      let secretStuff = ['fob', 'secret', 'token', 'email']

      if (ev.type === 'member-field-updated'){
          ['fob', 'secret', 'email'].forEach( str => {
              if (ev.field === str){
                  secretStuff.push('newfield')
              }
          })
      }

      return _.omit(ev, secretStuff)
}

module.exports = {
    serverState,
    pubState,
    initialize,
    applyEvent,
    removeSensitive,
    setCurrent,
}
