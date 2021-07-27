const satsPerBtc = 100000000 // one hundred million per btc
import _ from 'lodash'
import { createHash } from './crypto.js'

export function crawlerHash(tasks, taskId) {
  return createHash(Buffer.from(crawler(tasks, taskId)))
}

export function crawler(tasks, taskId) {
  let history = []
  tasks.forEach(task => {
    if (task.taskId === taskId) {
      let crawler = [taskId]
      do {
        let newCards = []
        crawler.forEach(t => {
          if (history.indexOf(t) >= 0) return
          history.push(t)
          let subTask = tasks.filter(pst => pst.taskId === t)[0]
          if (subTask) {
            let gridCells = []
            if (
              subTask?.grid?.rows &&
              Object.keys(subTask.grid.rows).length >= 1
            ) {
              const rowsArray = Object.values(subTask.grid.rows).forEach(
                row => {
                  gridCells = gridCells.concat(Object.values(row))
                }
              )
            }
            newCards = newCards
              .concat(subTask.subTasks)
              .concat(subTask.priorities)
              .concat(subTask.completed)
              .concat(gridCells)
          }
        })
        crawler = newCards
      } while (crawler.length > 0)
    }
  })
  return history
}

export function shortName(name) {
  let limit = 280
  let shortened = name.substring(0, limit)
  if (name.length > limit) {
    shortened += '…'
  }
  return shortened
}

export function cardColorCSS(color) {
  return {
    redwx: color == 'red',
    bluewx: color == 'blue',
    greenwx: color == 'green',
    yellowwx: color == 'yellow',
    purplewx: color == 'purple',
    blackwx: color == 'black',
  }
}

export function blankCard(
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
    name: typeof name !== 'string' ? 'invalid filename' : name.trim(),
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
    grid: height >= 1 && width >= 1 ? blankGrid(height, width) : false,
  }
  return newCard
}

export function blankGrid(height = 3, width = 3) {
  let newGrid = {
    height: height,
    width: width,
    rows: {},
  }
  return newGrid
}

export function isString(x) {
  return Object.prototype.toString.call(x) === '[object String]'
}

export function safeMerge(cardA, cardZ) {
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

  cardA.book = cardZ.book
  cardA.address = cardZ.address
  cardA.bolt11 = cardZ.bolt11
  cardA.priorities = [
    ...new Set(cardA.priorities.concat(filterNull(cardZ.priorities))),
  ]
  cardA.subTasks = [
    ...new Set(cardA.subTasks.concat(filterNull(cardZ.subTasks))),
  ]
  cardA.completed = [
    ...new Set(cardA.completed.concat(filterNull(cardZ.completed))),
  ]
  if(cardZ.grid && cardZ.height >= 1 && cardZ.width >= 1) {
      console.log("check1")
    if(!cardA.grid) {
        cardA.grid = { rows: {}, height: 1, width: 1 }
    }
          console.log("check2")

    cardA.grid.height = Math.max(cardA.grid.height, cardZ.grid.height)
    cardA.grid.width = Math.max(cardA.grid.width, cardZ.grid.width)
          console.log("check3")
    if (_.has(cardZ, 'grid.rows')) {
        Object.entries(cardZ.grid.rows).forEach(([x, row]) => {
                console.log("check4")

            const filteredRow = {}
                console.log("check5")

            Object.entries(row).forEach(([y, stId]) => {
                    console.log("check6")

                if(stId !== null && stId !== undefined) {
                    filteredRow[y] = stId
                }
            })
                console.log("check7")

            if(Object.keys(filteredRow).length >= 1) {
                if(!cardA.grid.rows) {
            cardA.grid.rows = {}
        }
                cardA.grid.rows[x] = filteredRow
            }
                console.log("check8")

        })
        console.log("cardA grid is now", JSON.stringify(cardA.grid))
        if(Objecct.entries(cardA.grid.rows).length < 1) {
            cardA.grid = false
        }
    }
  }
  cardA.passed = [...new Set(cardA.passed.concat(filterNull(cardZ.passed)))]
  // XXX only add in merge for now
  // XXX bolt11 / address need to clearly indicate origin ao
  // XXX book should be a list?
}

export function cadToSats(cadAmt, spot) {
  let sats = (parseFloat(cadAmt) / parseFloat(spot)) * satsPerBtc
  return parseInt(sats)
}

export function satsToCad(sats, spot) {
  let cad = sats * (spot / satsPerBtc)
  return cad.toFixed(2)
}

export function calculateMsThisMonth() {
  let today = new Date()
  let daysThisMonth = new Date(today.getYear(), today.getMonth(), 0).getDate()
  return daysThisMonth * 24 * 60 * 60 * 1000
}

export function getMeridienTime(ts) {
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
