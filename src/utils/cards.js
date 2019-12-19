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
        taskId: cryptoUtils.createHash(name),
        name: name,
        claimed: [],
        completed: [],
        passed: [],
        guild: false,
        subTasks: [],
        lastClaimed: 0,
        book: {},
        priorities: [],
        deck: [],
        color: 'purple',
        address: '',
        allocations: [],
        bolt11: 0,
        payment_hash: '',
        boost: 0,
        monthlyValue: 0,
        cap: 0,
        book: {},
        bolt11: '',
        payment_hash: ''
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

// generalized goIn and other card utility functions should go here

export default {
    shortName,
    cardColorCSS,
    blankCard,
    safeClone,
}