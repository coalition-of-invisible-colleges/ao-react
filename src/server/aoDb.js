const Kefir = require('kefir')
const _ = require('lodash')
const uuidV1 = require('uuid/v1')
const dbengine = require('better-sqlite3')
const cryptoUtils = require('../crypto')

class AoDb {
  constructor(path, createIfNotExist = true) {
    this.preparedStmts = {}

    this.changeFeed = Kefir.stream(e => {
      this.eventEmitter = e
    })

    this.shadowFeed = Kefir.stream(e => {
      this.shadowEmitter = e
    })

    this.conn = dbengine(path, {})
    var checkTable = this.conn.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='events'"
    )

    if (checkTable.all().length == 0) {
      if (createIfNotExist) {
        console.log('initializing new database')
        let err = this.initializeNewDatabase()
        if (err !== true) {
          return err
        }
      } else {
        return 'Database does not exist or does not have AO tables in it.'
      }
    } else {
      this.createStatements()
    }
  }

  requireValidDatabase() {
    if (!this.conn) return 'No database connection.'
    return true
  }

  initializeNewDatabase() {
    console.log('initializing new sqlite3')
    var err = null
    try {
      var initDb = this.conn.prepare(
        'CREATE TABLE `events` ( `document` BLOB NOT NULL, `timestamp` INTEGER UNIQUE, PRIMARY KEY(`timestamp`) )'
      )
      var initBackups = this.conn.prepare(
        'CREATE TABLE `backups` ( `document` BLOB NOT NULL, `timestamp` INTEGER UNIQUE, PRIMARY KEY(`timestamp`) )'
      )
      initDb.run()
      initBackups.run()
      this.createStatements()
    } catch (actualErr) {
      console.log(actualErr)
      err = actualErr
    }
    if (err) {
      return err
    }
    this.insertDefaultData()
    return true
  }

  createStatements() {
    this.conn.function('eventFeed', doc => {
      this.eventEmitter.emit(JSON.parse(doc))
    })
    this.preparedStmts.getAll = this.conn.prepare(
      'SELECT document FROM events WHERE (timestamp > ?) ORDER BY timestamp'
    ) // WHERE (timestamp > ?)
    this.preparedStmts.insertEvent = this.conn.prepare(
      'INSERT INTO events VALUES (?, ?)'
    )
    this.preparedStmts.insertBackup = this.conn.prepare(
      'INSERT INTO backups VALUES (?, ?)'
    )
    this.preparedStmts.recover = this.conn.prepare(
      'SELECT document from backups ORDER BY timestamp DESC LIMIT 1'
    )
  }

  insertDefaultData() {
    this.insertEvent({
      type: 'member-created',
      name: 'dctrl',
      fob: '0000000000',
      secret: cryptoUtils.createHash('dctrl'), // init user-password is dctrl
      memberId: uuidV1(),
      address: '2Mz6BQSTkmK4WHCntwNfvdSfWHddTqQX4vu',
      active: 1,
      balance: 0,
      badges: [],
      info: {}
    })
    this.startFeed()
  }

  startFeed() {
    this.conn.function('eventFeed', doc => {
      this.eventEmitter.emit(JSON.parse(doc))
    })
    this.conn
      .prepare(
        'CREATE TRIGGER updateHook AFTER INSERT ON events BEGIN SELECT eventFeed(NEW.document); END'
      )
      .run()
  }

  triggerShadow(x) {
    this.shadowEmitter.emit(x)
  }

  recover() {
    try {
      let all = []

      for (const ev of this.preparedStmts.recover.iterate()) {
        console.log
        all.push(JSON.parse(ev.document))
      }
      return all
    } catch (err) {
      return 'Error recovering from backup: ' + err
    }
  }

  getAll(timestamp) {
    try {
      let all = []

      for (const ev of this.preparedStmts.getAll.iterate(timestamp)) {
        all.push(JSON.parse(ev.document))
      }
      return all
    } catch (err) {
      return 'Error getting all events: ' + err
    }
  }

  insertEvent(ev) {
    if (!this.requireValidDatabase()) return this.requireValidDatabase()
    if (!ev.timestamp) {
      ev.timestamp = Date.now()
    }
    var result = null
    try {
      result = this.preparedStmts.insertEvent.run(
        JSON.stringify(ev),
        ev.timestamp
      )
    } catch (err) {
      return err
    }
  }

  insertBackup(state) {
    if (!this.requireValidDatabase()) return this.requireValidDatabase()

    state.timestamp = Date.now()

    var result = null
    try {
      result = this.preparedStmts.insertBackup.run(
        JSON.stringify(state),
        state.timestamp
      )
    } catch (err) {
      return err
    }
    return true
  }
}

module.exports = { AoDb }
