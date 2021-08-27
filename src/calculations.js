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

export function isString(x) {
  return Object.prototype.toString.call(x) === '[object String]'
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

export function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}
