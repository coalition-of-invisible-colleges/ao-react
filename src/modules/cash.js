const M = require( '../mutations')

const state = {
    alias: "",
    address: "",
    spot: 123456,
    currency: 'CAD',
    rent: 0,
    cap: 0,
    usedTxIds: [],
    outputs: [],
    channels: [],
    info: {'x':1},
    pay_index: 0,
}

const mutations = {
    setCurrent(state, current){
        state.alias = current.cash.alias
        state.address = current.cash.address
        state.spot = current.cash.spot
        state.currency = current.cash.currency
        state.rent = current.cash.rent
        state.cap = current.cash.cap
        state.usedTxIds = current.cash.usedTxIds
        state.outputs = current.cash.outputs
        state.channels = current.cash.channels
        state.info = current.cash.info
        state.pay_index = current.cash.pay_index
    },
    applyEvent: M.cashMuts
}

const actions = {}
const getters = {}

module.exports = {
    state,
    mutations,
    actions,
    getters
}
