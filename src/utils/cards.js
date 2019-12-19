import Vue from 'vue'
import _ from 'lodash'
import cryptoUtils from '../crypto'

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

// generalized goIn and other card utility functions should go here

export default {
    shortName,
    cardColorCSS,
    blankCard,
    safeClone,
    safeMerge,
}