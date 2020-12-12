const satsPerBtc = 100000000 // one hundred million per btc
const _ = require('lodash')
const cryptoUtils = require('./crypto')

function crawlerHash(tasks, taskId) {
  return cryptoUtils.createHash(Buffer.from(crawler(tasks, taskId)))
}

function crawler(tasks, taskId) {
  let history = []
  tasks.forEach(task => {
    if (task.taskId === taskId) {
      let crawler = [taskId]
      do {
        newCards = []
        crawler.forEach(t => {
          if (history.indexOf(t) >= 0) return
          history.push(t)
          let subTask = tasks.filter(pst => pst.taskId === t)[0]
          if (subTask) {
            newCards = newCards
              .concat(subTask.subTasks)
              .concat(subTask.priorities)
              .concat(subTask.completed)
          }
        })
        crawler = newCards
      } while (crawler.length > 0)
    }
  })
  return history
}

function shortName(name) {
  let limit = 280
  let shortened = name.substring(0, limit)
  if (name.length > limit) {
    shortened += '…'
  }
  return shortened
}

function cardColorCSS(color) {
  return {
    redwx: color == 'red',
    bluewx: color == 'blue',
    greenwx: color == 'green',
    yellowwx: color == 'yellow',
    purplewx: color == 'purple',
    blackwx: color == 'black'
  }
}

function blankCard(
  taskId,
  name,
  color,
  created,
  deck = [],
  parents = [],
  height = undefined,
  width = undefined
) {
  let newCard = {
    taskId,
    color,
    deck,
    name: name,
    address: '',
    bolt11: '',
    book: {},
    boost: 0,
    priorities: [],
    subTasks: [],
    completed: [],
    parents: parents,
    claimed: [],
    passed: [],
    signed: [],
    guild: false,
    created: created,
    lastClaimed: 0,
    payment_hash: '',
    highlights: [],
    seen: [],
    time: [],
    grid: height >= 1 && width >= 1 ? blankGrid(height, width) : false
  }
  return newCard
}

function blankGrid(height = 3, width = 3) {
  let newGrid = {
    height: height,
    width: width,
    rows: {}
  }
  return newGrid
}

function isString(x) {
  return Object.prototype.toString.call(x) === '[object String]'
}

function safeMerge(cardA, cardZ) {
  // grids are not merged yet
  if (!cardA || !cardZ) {
    console.log('attempt to merge nonexistent card')
    return
  }

  if (!cardZ.taskId || !isString(cardZ.taskId)) {
    console.log('attempt to merge card with a missing or invalid taskId')
    return
  }

  if (!cardZ.color) {
    console.log('attempt to merge card without a color')
    return
  }

  if (isString(cardZ.color) && !_.isEmpty(cardZ.color.trim())) {
    cardA.color = cardZ.color
  }

  if (isString(cardZ.guild) && !_.isEmpty(cardZ.guild.trim())) {
    cardA.guild = cardZ.guild
  }

  const filterNull = tasks => {
    return tasks.filter(task => task !== null && task !== undefined)
  }

  cardA.book = cardZ.guild
  cardA.address = cardZ.guild
  cardA.bolt11 = cardZ.guild
  cardA.priorities = [
    ...new Set(cardA.priorities.concat(filterNull(cardZ.priorities)))
  ]
  cardA.subTasks = [
    ...new Set(cardA.subTasks.concat(filterNull(cardZ.subTasks)))
  ]
  cardA.completed = [
    ...new Set(cardA.completed.concat(filterNull(cardZ.completed)))
  ]
  cardA.passed = [...new Set(cardA.passed.concat(filterNull(cardZ.passed)))]
  // XXX only add in merge for now
  // XXX bolt11 / address need to clearly indicate origin ao
  // XXX book should be a list?
}

function cadToSats(cadAmt, spot) {
  let sats = (parseFloat(cadAmt) / parseFloat(spot)) * satsPerBtc
  return parseInt(sats)
}

function satsToCad(sats, spot) {
  let cad = sats * (spot / satsPerBtc)
  return cad.toFixed(2)
}

function calculateMsThisMonth() {
  let today = new Date()
  let daysThisMonth = new Date(today.getYear(), today.getMonth(), 0).getDate()
  return daysThisMonth * 24 * 60 * 60 * 1000
}

function getMeridienTime(ts) {
  let d = new Date(parseInt(ts))
  let hour24 = d.getHours()

  let rollover = 0
  if (hour24 >= 24) {
    rollover = 1
    hour24 %= 24
  }

  let hour, meridien
  if (hour24 > 12) {
    meridien = 'pm'
    hour = hour24 - 12
  } else {
    meridien = 'am'
    hour = hour24
  }

  let date = d.getDate() + rollover
  let month = d.getMonth() + 1
  let minute = d.getMinutes()
  let year = d.getFullYear()

  let weekday = d.toString().slice(0, 3)

  return { weekday, year, month, date, hour, minute, meridien }
}

module.exports = {
  cadToSats,
  satsToCad,
  getMeridienTime,
  shortName,
  cardColorCSS,
  blankCard,
  blankGrid,
  // safeClone,
  safeMerge,
  crawler,
  crawlerHash
}
