const Vue = require( 'vue')
const satsPerBtc = 100000000 // one hundred million per btc
const _ = require('lodash')
const cryptoUtils = require('./crypto')

function shortName(name) {
    let limit = 280
    let shortened = name.substring(0, limit)
    if(name.length > limit) {
        shortened += '…'
    }
    return shortened
}

function cardColorCSS(color) {
    return {
        redwx : color == 'red',
        bluewx : color == 'blue',
        greenwx : color == 'green',
        yellowwx : color == 'yellow',
        purplewx : color == 'purple',
        blackwx : color == 'black',
    }
}

function blankCard(name) {
    name = name.trim()
    let newCard = {
        name: name,
        taskId: cryptoUtils.createHash(name),
        address: '',
        allocations: [],
        bolt11: '',
        book: {},
        boost: 0,
        cap: 0,
        claimed: [],
        color: 'purple',
        completed: [],
        deck: [],
        guild: false,
        lastClaimed: 0,
        monthlyValue: 0,
        passed: [],
        payment_hash: '',
        priorities: [],
        subTasks: [],
    }
    return newCard
}

function safeClone(card) {
    // type check all this
    let safeClone = {
        taskId: card.taskId,
        name: card.name,
        claimed: [],
        completed: card.completed,
        passed: [],
        guild: card.guild,
        subTasks: card.subTasks,
        lastClaimed: 0,
        book: card.book,
        priorities: card.priorities,
        deck: [],
        color: card.color,
        address: card.address,
        allocations: [],
        bolt11: card.bolt11,
        payment_hash: '',
        boost: 0,
    }
    return safeClone
}


function isString(x) {
  return Object.prototype.toString.call(x) === "[object String]"
}

function safeMerge(cardA, cardZ) {
    if(isString(cardZ.color) && !_.isEmpty(cardZ.color.trim())) {
        Vue.set(cardA, 'color', cardZ.color )
    }

    if(isString(cardZ.guild) && !_.isEmpty(cardZ.guild.trim())) {
        Vue.set(cardA, 'guild', cardZ.guild )
    }

    Vue.set(cardA, 'book', cardZ.guild )
    Vue.set(cardA, 'address', cardZ.guild )
    Vue.set(cardA, 'bolt11', cardZ.guild )
    Vue.set(cardA, 'subTasks', [...new Set(cardA.subTasks.concat(cardZ.subTasks))])
    Vue.set(cardA, 'priorities', [...new Set(cardA.priorities.concat(cardZ.priorities))])
    Vue.set(cardA, 'completed', [...new Set(cardA.completed.concat(cardZ.completed))])
    Vue.set(cardA, 'passed', [...new Set(cardA.passed.concat(cardZ.passed))])
}

function cadToSats(cadAmt, spot){
    let sats = parseFloat( cadAmt ) / parseFloat( spot ) * satsPerBtc
    return parseInt(sats)
}

function satsToCad(sats, spot){
    let cad = sats * (spot / satsPerBtc)
    return cad.toFixed(2)
}

function calculateMsThisMonth(){
    let today = new Date()
    let daysThisMonth = new Date(today.getYear(), today.getMonth(), 0).getDate()
    return daysThisMonth * 24 * 60 * 60 * 1000
}

function calculateTaskPayout(task){
    let msThisMonth = calculateMsThisMonth()
    let msSince = Date.now() - parseFloat(task.lastClaimed)
    let payout = (msSince / msThisMonth) * parseFloat(task.monthlyValue) || 0
    let cap = parseFloat(task.cap) || 0
    let boost = parseFloat(task.boost) || 0
    if (cap > 0){
        return Math.min(payout, cap) + boost
    }
    else {
        return payout + boost
    }
}

function getMeridienTime(ts){

    let d = new Date( parseInt(ts) )
    let hour24 = d.getHours()

    let rollover = 0
    if (hour24 >= 24){
        rollover = 1
        hour24 %= 24
    }

    let hour, meridien
    if (hour24 > 12){
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

    let weekday = d.toString().slice(0,3)

    return { weekday, year, month, date, hour, minute, meridien }
}

module.exports = {
  calculateTaskPayout,
  cadToSats,
  satsToCad,
  getMeridienTime,
  shortName,
  cardColorCSS,
  blankCard,
  safeClone,
  safeMerge,
}
