import _ from 'lodash'
import dctrlDb from './dctrlDb'
import M from '../mutations'
import modules from '../modules'

const serverState = {
  ao: [],
  recent: [],
  sessions: [],
  members: [],
  tasks: [],
  resources: [],
  cash: {
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
  recent: [],
  sessions: [],
  members: [],
  tasks: [],
  resources: [],
  cash: {
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

    setCurrent(serverState, b)

    b.resources = b.resources.map(removeSensitive)
    b.members = b.members.map(removeSensitive)
    b.ao = b.ao.map(removeSensitive)

    setCurrent(pubState, b)
}

function applyEvent(state, ev) {
      M.aoMuts(state.ao, ev)
      M.recentMuts(state.recent, ev)
      M.cashMuts(state.cash, ev)
      M.membersMuts(state.members, ev)
      M.resourcesMuts(state.resources, ev)
      M.sessionsMuts(state.sessions, ev)
      M.tasksMuts(state.tasks, ev)
}

function initialize(callback) {
    dctrlDb.recover((err, backup) => {
          let ts = 0
          if (backup.length > 0){
              console.log( backup[0].members.length, " members in backup")
              ts = backup[0].timestamp

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
