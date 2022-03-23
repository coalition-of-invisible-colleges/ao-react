import Kefir from 'kefir'
import _ from 'lodash'
import v1 from 'uuid'
import dbengine from 'better-sqlite3'
import { createHash } from '../crypto.js'
import { blankCard } from '../cards'

const preparedStmts = {}

export var conn

var eventEmitter, shadowEmitter

export const changeFeed = Kefir.stream(e => {
  eventEmitter = e
})

export const shadowFeed = Kefir.stream(e => {
  shadowEmitter = e
})

export function triggerShadow(x) {
  shadowEmitter.emit(x)
}

function initializeSqlite(cb) {
  console.log('initializing new sqlite3')
  var err = null
  try {
    var initDb = conn.prepare(
      'CREATE TABLE `events` ( `document` BLOB NOT NULL, `timestamp` INTEGER UNIQUE, PRIMARY KEY(`timestamp`) )'
    )
    var initBackups = conn.prepare(
      'CREATE TABLE `backups` ( `document` BLOB NOT NULL, `timestamp` INTEGER UNIQUE, PRIMARY KEY(`timestamp`) )'
    )
    initDb.run()
    initBackups.run()
    createStatements()
  } catch (actualErr) {
    console.log(actualErr)
    err = actualErr
  }
  if (err) {
    cb(err, conn)
  } else {
    const firstMemberId = v1()
    const now = Date.now()
    insertEvent({
      type: 'member-created',
      name: 'dctrl',
      fob: '0000000000',
      secret: createHash('dctrl'), // init user-password is dctrl
      memberId: firstMemberId,
      address: '2Mz6BQSTkmK4WHCntwNfvdSfWHddTqQX4vu',
      active: 1,
      balance: 0,
      badges: [],
      info: {},
    })
    const bookmarksCardTaskId = v1()
    let bookmarksCardEvent = blankCard(
      bookmarksCardTaskId,
      firstMemberId + '-bookmarks',
      'blue',
      now,
      [firstMemberId]
    )
    bookmarksCardEvent.type = 'task-created'
    insertEvent(bookmarksCardEvent)
    insertEvent({
      type: 'grid-added',
      taskId: bookmarksCardTaskId,
      height: 1,
      width: 6,
    })

    let blankCardEvent = blankCard(v1(), 'community hub', 'yellow', now, [
      firstMemberId,
    ])
    blankCardEvent.type = 'task-created'
    blankCardEvent.guild = 'Community Hub'
    insertEvent(blankCardEvent)
    startFeed()
    cb(null, conn)
  }
}

function createStatements() {
  // console.log("AO: server/dctrlDb.js: createStatements");
  conn.function('eventFeed', doc => {
    eventEmitter.emit(JSON.parse(doc))
  })
  preparedStmts.getAll = conn.prepare(
    'SELECT document FROM events WHERE (timestamp > ?) ORDER BY timestamp'
  ) // WHERE (timestamp > ?)
  preparedStmts.insertEvent = conn.prepare('INSERT INTO events VALUES (?, ?)')
  preparedStmts.insertBackup = conn.prepare('INSERT INTO backups VALUES (?, ?)')
  preparedStmts.recover = conn.prepare(
    'SELECT document from backups ORDER BY timestamp DESC LIMIT 1'
  )
}

export function recover(callback) {
  try {
    let all = []

    for (const ev of preparedStmts.recover.iterate()) {
      console.log
      all.push(JSON.parse(ev.document))
    }
    callback(null, all)
  } catch (err) {
    console.log('err caught recover ' + err)
  }
}

export function getAll(timestamp, callback) {
  try {
    let all = []

    for (const ev of preparedStmts.getAll.iterate(timestamp)) {
      all.push(JSON.parse(ev.document))
    }
    callback(null, all)
  } catch (err) {
    console.log('err caught getAll ' + err)
  }
}

function startFeed() {
  console.log('AO: server/dctrlDb.js: startFeed')
  conn.function('eventFeed', doc => {
    eventEmitter.emit(JSON.parse(doc))
  })
  try {
    conn
      .prepare(
        'CREATE TRIGGER updateHook AFTER INSERT ON events BEGIN SELECT eventFeed(NEW.document); END'
      )
      .run()
  } catch (error) {
    console.log('AO: server/dctrlDb.js: startFeed: error running conn prepare')
  }
}

export function insertEvent(ev, callback) {
  if (ev.type === 'tasks-received') {
    console.log(`received ${ev?.tasks?.length} tasks`)
    ev?.tasks?.forEach(task => console.log('p2p:', task.name))
    console.log('p2p: end of receive')
  } else {
    console.log('insertEvent ev is ', ev)
  }
  if (!conn) return callback('No db connection')
  if (!ev.timestamp) {
    ev.timestamp = Date.now()
  }
  var err = null
  var result = null
  try {
    result = preparedStmts.insertEvent.run(JSON.stringify(ev), ev.timestamp)
  } catch (actualErr) {
    err = actualErr
  }
  if (callback) {
    callback(err, result)
  }
}

export function insertBackup(state, callback) {
  if (!conn) return callback('No db connection')

  state.timestamp = Date.now()

  var err = null
  var result = null
  try {
    result = preparedStmts.insertBackup.run(
      JSON.stringify(state),
      state.timestamp
    )
  } catch (actualErr) {
    err = actualErr
  }
  if (callback) return callback(err, result)
}

export function startDb(path, callback) {
  conn = dbengine(path, {})
  var checkTable = conn.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='events'"
  )

  if (checkTable.all().length == 0) {
    initializeSqlite(callback)
  } else {
    createStatements()
    // startFeed()
    callback(null, conn)
  }
}

export function verifyAndLoadDb(path) {
  conn = dbengine(path, {})
  var checkTable = conn.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='events'"
  )

  if (checkTable.all().length == 0) {
    return 'Database does not exist or does not have AO tables in it.'
  } else {
    createStatements()
  }
  return true
}
