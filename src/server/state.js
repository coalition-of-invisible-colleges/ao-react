const _ = require('lodash')
const dctrlDb = require('./dctrlDb')
const M = require('../mutations')
const modules = require('../modules')
const config = require('../../configuration')
const { formatDistanceToNow } = require('date-fns')
const cron = require('cron')

const backupJob = new cron.CronJob({
  cronTime: '0 0 0 1 * *',
  onTick: backupState,
  start: true,
  timeZone: 'America/Los_Angeles'
})

const serverState = {
  ao: [],
  sessions: [],
  members: [],
  tasks: [],
  resources: [],
  memes: [],
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
    info: {}
  }
}

const pubState = {
  ao: [],
  sessions: [],
  members: [],
  tasks: [],
  resources: [],
  memes: [],
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
    info: {}
  }
}

function setCurrent(state, b) {
  modules.cash.mutations.setCurrent(state.cash, b)
  modules.tasks.mutations.setCurrent(state.tasks, b)
  modules.sessions.mutations.setCurrent(state.sessions, b)
  modules.ao.mutations.setCurrent(state.ao, b)
  modules.members.mutations.setCurrent(state.members, b)
  modules.resources.mutations.setCurrent(state.resources, b)
  modules.memes.mutations.setCurrent(state.memes, b)
}

function applyBackup(b) {
  let b1 = Object.assign({}, b)
  setCurrent(serverState, b1)
  b.memes = b.memes && b.memes.length > 0 ? b.memes.map(removeSensitive) : []
  b.resources = b.resources.map(removeSensitive)
  b.members = b.members.map(removeSensitive)
  b.ao = b.ao.map(removeSensitive)
  b.tasks = b.tasks.map(removeSensitive)
  setCurrent(pubState, b)
}

function applyEvent(state, ev) {
  M.cashMuts(state.cash, ev)
  M.membersMuts(state.members, ev)
  M.resourcesMuts(state.resources, ev)
  M.memesMuts(state.memes, ev)
  M.sessionsMuts(state.sessions, ev)
  M.tasksMuts(state.tasks, ev)
  M.aoMuts(state.ao, ev)
}

function initialize(callback) {
  dctrlDb.recover((err, backup) => {
    let ts = 0
    if (backup.length > 0) {
      ts = backup[0].timestamp
      console.log(
        '\nFound',
        backup.length,
        'AO snapshot' +
          (backup.length === 1 ? '' : 's') +
          ' in the database. Applying' +
          (backup.length > 1 ? ' the most recent' : '') +
          ' backup from',
        formatDistanceToNow(ts, {
          addSuffix: true
        }),
        '...\n'
      )
      applyBackup(backup[0])
    }
    dctrlDb.getAll(ts, (err, all) => {
      if (err) return callback(err)
      all.forEach((ev, i) => {
        applyEvent(serverState, Object.assign({}, ev))
        applyEvent(pubState, removeSensitive(Object.assign({}, ev)))
        if (i > 0 && i % 10000 === 0) {
          console.log('applied ', i, '/', all.length, ' events...')
        }
      })
      console.log('applied ', all.length, ' events from the database')
      callback(null)
    })
  })
}

function backupState() {
  console.log(
    "\nTaking a monthly snapshot of the AO's current loaded state to improve performance..."
  )
  dctrlDb.insertBackup(serverState)
  console.log('Snapshot saved.')
}

function removeSensitive(ev) {
  let secretStuff = [
    'fob',
    'secret',
    'token',
    'email',
    'payment_hash',
    'inboundSecret',
    'outboundSecret'
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

module.exports = {
  serverState,
  pubState,
  initialize,
  applyEvent,
  removeSensitive,
  setCurrent
}
